/**
 * Starkzap-powered wallet hook.
 *
 * Supports:
 * 1. Social login (Google, Apple, email) via Starkzap SDK + Cartridge Controller
 * 2. Traditional browser wallets (ArgentX, Braavos) as fallback
 * 3. Devnet mode for local development
 *
 * The Starkzap SDK handles:
 * - Embedded wallet creation (no seed phrases) via Cartridge Controller popup
 * - Session key management
 * - Gasless transactions via AVNU Paymaster (feeMode: "sponsored")
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { Account, RpcProvider, constants, type AccountInterface } from 'starknet';
import { StarkZap } from 'starkzap';
import type { WalletInterface } from 'starkzap';
import { getRpcUrl, IS_DEVNET, DEVNET_ACCOUNT, DEVNET_RESOURCE_BOUNDS, CONTRACT_ADDRESSES } from '../lib/contracts/config';

export type AuthMethod = 'google' | 'apple' | 'email' | 'wallet' | 'devnet';

interface WalletState {
  account: AccountInterface | null;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  isDevnet: boolean;
  authMethod: AuthMethod | null;
  privacyKey: bigint | null;
  isKeyUnlocked: boolean;
  connect: (method?: AuthMethod) => Promise<void>;
  disconnect: () => void;
  setPrivacyKey: (key: bigint | null) => void;
}

const WalletContext = createContext<WalletState>({
  account: null,
  address: null,
  isConnecting: false,
  error: null,
  isDevnet: false,
  authMethod: null,
  privacyKey: null,
  isKeyUnlocked: false,
  connect: async () => {},
  disconnect: () => {},
  setPrivacyKey: () => {},
});

/** Build Cartridge session policies from our contract addresses */
function buildSessionPolicies() {
  const policies: Array<{ target: string; method: string }> = [];
  const contracts = [
    { addr: CONTRACT_ADDRESSES.shieldedVault, methods: ['deposit', 'withdraw', 'shield', 'unshield'] },
    { addr: CONTRACT_ADDRESSES.shieldedCDP, methods: ['open_cdp', 'lock_collateral', 'mint_susd', 'repay', 'close_cdp'] },
    { addr: CONTRACT_ADDRESSES.solvencyProver, methods: ['submit_vault_solvency_proof', 'submit_cdp_safety_proof'] },
    // ProofVerifier — needed for admin setup (set_verifier_class_hash)
    { addr: CONTRACT_ADDRESSES.proofVerifier, methods: ['set_verifier_class_hash'] },
    // xyBTC token — needed for faucet mint + ERC20 approve in deposit/lock multicalls
    { addr: CONTRACT_ADDRESSES.xyBTC, methods: ['mint', 'approve'] },
    // Price feed — needed for oracle refresh before CDP operations
    { addr: CONTRACT_ADDRESSES.priceFeed, methods: ['set_price'] },
  ];
  for (const c of contracts) {
    if (c.addr) {
      for (const method of c.methods) {
        policies.push({ target: c.addr, method });
      }
    }
  }
  return policies;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [privacyKey, setPrivacyKey] = useState<bigint | null>(null);
  const starkzapWalletRef = useRef<WalletInterface | null>(null);

  const connectDevnet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const rpcUrl = getRpcUrl();
      const provider = new RpcProvider({ nodeUrl: rpcUrl });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (provider as any).channel.blockIdentifier = 'latest';
      const baseAccount = new Account(
        provider,
        DEVNET_ACCOUNT.address,
        DEVNET_ACCOUNT.privateKey,
        '1',
        constants.TRANSACTION_VERSION.V3,
      );

      const origExecute = baseAccount.execute.bind(baseAccount);
      baseAccount.execute = async function(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transactions: any, arg2?: any, arg3?: any
      ) {
        const nonceResp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'starknet_getNonce', id: 1,
            params: { block_id: 'latest', contract_address: DEVNET_ACCOUNT.address },
          }),
        });
        const nonceJson = await nonceResp.json();
        const nonce = nonceJson.result;
        const details = arg2 === undefined || Array.isArray(arg2) ? (arg3 || {}) : arg2;
        details.nonce = nonce;
        if (arg2 === undefined || Array.isArray(arg2)) {
          return origExecute(transactions, arg2, { ...DEVNET_RESOURCE_BOUNDS, ...details });
        }
        return origExecute(transactions, { ...DEVNET_RESOURCE_BOUNDS, ...details });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      setAccount(baseAccount);
      setAddress(DEVNET_ACCOUNT.address);
      setAuthMethod('devnet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to devnet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Starkzap Social Login via Cartridge Controller.
   *
   * Uses the real Starkzap SDK:
   * - sdk.connectCartridge() opens the Cartridge auth popup (Google/Apple/passkeys)
   * - Session keys are configured with policies for our contracts
   * - feeMode: "sponsored" enables gasless transactions via AVNU Paymaster
   * - wallet.getAccount() returns a starknet.js Account compatible with AccountInterface
   */
  const connectWithStarkzap = useCallback(async (method: AuthMethod) => {
    setIsConnecting(true);
    setError(null);
    setAuthMethod(method);

    try {
      // Initialize Starkzap SDK with Sepolia network
      const sdk = new StarkZap({ network: 'sepolia' });

      // Connect via Cartridge Controller — opens social login popup
      // Supports Google, Apple, email, and passkeys natively
      const wallet = await sdk.connectCartridge({
        policies: buildSessionPolicies(),
        feeMode: 'sponsored', // Gasless: AVNU Paymaster covers all tx fees
      });

      // Ensure the wallet is ready (deploys account contract if needed)
      await wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' });

      // Store the Starkzap wallet reference for cleanup
      starkzapWalletRef.current = wallet;

      // Get the underlying starknet.js Account for compatibility with
      // our existing contract interaction layer (vault.ts, cdp.ts, etc.)
      const starknetAccount = wallet.getAccount() as unknown as AccountInterface;

      setAccount(starknetAccount);
      setAddress(wallet.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Starkzap connection failed');
      setAuthMethod(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connect = useCallback(async (method?: AuthMethod) => {
    if (IS_DEVNET) {
      await connectDevnet();
    } else {
      await connectWithStarkzap(method || 'google');
    }
  }, [connectDevnet, connectWithStarkzap]);

  const disconnect = useCallback(async () => {
    // Disconnect Starkzap wallet if connected
    if (starkzapWalletRef.current) {
      try {
        await starkzapWalletRef.current.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      starkzapWalletRef.current = null;
    }
    setAccount(null);
    setAddress(null);
    setError(null);
    setAuthMethod(null);
    setPrivacyKey(null);
  }, []);

  useEffect(() => {
    if (IS_DEVNET && !account) {
      connectDevnet();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WalletContext.Provider
      value={{
        account,
        address,
        isConnecting,
        error,
        isDevnet: IS_DEVNET,
        authMethod,
        privacyKey,
        isKeyUnlocked: privacyKey !== null,
        connect,
        disconnect,
        setPrivacyKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  return useContext(WalletContext);
}

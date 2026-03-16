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
import { restoreStatsFromCloud } from '../lib/gamification';

export type AuthMethod = 'google' | 'apple' | 'email' | 'wallet' | 'devnet';

interface WalletState {
  account: AccountInterface | null;
  address: string | null;
  isConnecting: boolean;
  isRestoring: boolean;
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
  isRestoring: true,
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

const SESSION_KEY = 'zapscura_wallet_session';

interface WalletSession {
  authMethod: AuthMethod;
  address: string;
  connectedAt: number;
}

function saveSession(authMethod: AuthMethod, address: string) {
  try {
    const session: WalletSession = { authMethod, address, connectedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* ignore storage errors */ }
}

function loadSession(): WalletSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: WalletSession = JSON.parse(raw);
    // Expire sessions after 24 hours
    if (Date.now() - session.connectedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

/**
 * Synchronously read the saved session so we can hydrate address on first render.
 * This prevents the route guard from redirecting to /login before the async
 * Cartridge Controller restore completes.
 */
function getInitialSession(): WalletSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: WalletSession = JSON.parse(raw);
    if (Date.now() - session.connectedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

const initialSession = IS_DEVNET ? null : getInitialSession();

export function WalletProvider({ children }: { children: ReactNode }) {
  // Hydrate address from localStorage immediately so route guard doesn't redirect
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [address, setAddress] = useState<string | null>(initialSession?.address ?? null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(initialSession?.authMethod ?? null);
  const [privacyKey, setPrivacyKey] = useState<bigint | null>(null);
  const [isRestoring, setIsRestoring] = useState(!!initialSession || IS_DEVNET);
  const starkzapWalletRef = useRef<WalletInterface | null>(null);
  const restoringRef = useRef(false);

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
      saveSession('devnet', DEVNET_ACCOUNT.address);
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
      saveSession(method, wallet.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Starkzap connection failed');
      setAuthMethod(null);
      clearSession();
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
    clearSession();
  }, []);

  // Auto-restore session on mount.
  // Address is already hydrated from localStorage (synchronous), so the route guard
  // won't redirect. Here we restore the actual Starkzap account object in the background.
  useEffect(() => {
    if (restoringRef.current || account) {
      setIsRestoring(false);
      return;
    }

    if (IS_DEVNET) {
      connectDevnet().finally(() => setIsRestoring(false));
      return;
    }

    // Check the session saved in localStorage
    const session = loadSession();
    if (session && session.authMethod !== 'devnet') {
      restoringRef.current = true;

      // Restore the full Starkzap wallet session (Cartridge Controller iframe).
      // The address is already set from getInitialSession() so the user sees the
      // dashboard immediately while this runs in the background.
      const attemptRestore = async (retriesLeft: number): Promise<void> => {
        try {
          const sdk = new StarkZap({ network: 'sepolia' });
          const wallet = await sdk.connectCartridge({
            policies: buildSessionPolicies(),
            feeMode: 'sponsored',
          });
          await wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' });
          starkzapWalletRef.current = wallet;
          const starknetAccount = wallet.getAccount() as unknown as AccountInterface;
          setAccount(starknetAccount);
          setAddress(wallet.address);
          setAuthMethod(session.authMethod);
          saveSession(session.authMethod, wallet.address);
        } catch (err) {
          if (retriesLeft > 0) {
            // Exponential backoff: 2s, 4s, 8s
            const delay = 2000 * Math.pow(2, 3 - retriesLeft);
            await new Promise((r) => setTimeout(r, delay));
            return attemptRestore(retriesLeft - 1);
          }
          // All retries exhausted — keep the hydrated address so the user
          // stays on the dashboard. They just can't send transactions until
          // they manually reconnect. Don't clear the session.
          console.warn('[ZapScura] Session restore failed, keeping hydrated session:', err);
        } finally {
          restoringRef.current = false;
          setIsRestoring(false);
        }
      };

      attemptRestore(3);
    } else {
      // No session to restore
      setIsRestoring(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore gamification stats from cloud when wallet connects
  useEffect(() => {
    if (address) {
      restoreStatsFromCloud(address).catch(() => {});
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        account,
        address,
        isConnecting,
        isRestoring,
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

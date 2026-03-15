/**
 * Initialize the ProofVerifier contract with Garaga UltraKeccakHonkVerifier class hash.
 *
 * This sets the verifier class hash for all 7 circuit types so that
 * shield/unshield/lock/mint/repay/close operations can verify proofs on-chain.
 *
 * Usage:
 *   OWNER_PRIVATE_KEY=0x... node scripts/init-verifier.mjs
 *
 * The OWNER_PRIVATE_KEY must belong to the ProofVerifier owner account:
 *   0x17a2c3a31c3c487d30e06d558e7c1827273f942d9609340da266be6c1d5fbfe
 */

import { Account, RpcProvider, constants } from 'starknet';
import { readFileSync } from 'fs';

const RPC_URL = 'https://api.cartridge.gg/x/starknet/sepolia';
const PROOF_VERIFIER_ADDRESS = '0x04c4e22683a7512582b50986d402781b7d092611b820778a1881b4f62d77ec4a';
const OWNER_ADDRESS = '0x17a2c3a31c3c487d30e06d558e7c1827273f942d9609340da266be6c1d5fbfe';

// Garaga UltraKeccakHonkVerifier — declared on Starknet Sepolia
// Universal verifier: VK is included in full_proof_with_hints calldata
const GARAGA_HONK_CLASS_HASH = '0x00918e2c5aa72bd570ad01b48e03f9717ff767112bc67d3ea9cb9ee148ef93a4';

const CIRCUIT_TYPES = [1, 2, 3, 4, 5, 6, 7]; // range_proof through cdp_safety_bound

// Read .env file
function loadEnv() {
  try {
    const envContent = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (val && !process.env[key]) process.env[key] = val;
        }
      }
    }
  } catch { /* ignore */ }
}

async function main() {
  loadEnv();
  const privateKey = process.env.OWNER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: Set OWNER_PRIVATE_KEY in .env file or environment variable');
    console.error('Owner account:', OWNER_ADDRESS);
    process.exit(1);
  }

  console.log('Connecting to Starknet Sepolia...');
  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  // Cartridge RPC doesn't support "pending" — use "latest"
  provider.channel.blockIdentifier = 'latest';

  const account = new Account(
    provider,
    OWNER_ADDRESS,
    privateKey,
    '1',
    constants.TRANSACTION_VERSION.V3,
  );

  console.log('Building multicall for all 7 circuit types...');
  const calls = CIRCUIT_TYPES.map(circuitType => ({
    contractAddress: PROOF_VERIFIER_ADDRESS,
    entrypoint: 'set_verifier_class_hash',
    calldata: [circuitType.toString(), GARAGA_HONK_CLASS_HASH],
  }));

  console.log('Garaga class hash:', GARAGA_HONK_CLASS_HASH);
  console.log('Circuit types:', CIRCUIT_TYPES.join(', '));
  console.log('');

  try {
    console.log('Sending transaction...');
    const result = await account.execute(calls, undefined, {
      resourceBounds: {
        l1_gas: { max_amount: '0x2710', max_price_per_unit: '0x174876e800' },
        l2_gas: { max_amount: '0x1e8480', max_price_per_unit: '0x174876e800' },
      },
    });
    console.log('Transaction hash:', result.transaction_hash);
    console.log('');

    console.log('Waiting for confirmation...');
    await provider.waitForTransaction(result.transaction_hash);
    console.log('Done! All 7 circuit types initialized.');
    console.log('');
    console.log('You can now use shield/unshield/CDP operations in ZapScura.');
  } catch (err) {
    console.error('Transaction failed:', err.message || err);
    if (err.message?.includes('not authorized') || err.message?.includes('caller is not the owner')) {
      console.error('');
      console.error('The provided key does not belong to the ProofVerifier owner.');
      console.error('Expected owner:', OWNER_ADDRESS);
    }
  }
}

main();

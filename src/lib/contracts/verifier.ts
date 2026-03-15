/**
 * ProofVerifier contract interaction layer.
 * Handles verifier initialization check and admin setup.
 */

import { type AccountInterface, RpcProvider } from 'starknet';
import { CONTRACT_ADDRESSES, IS_DEVNET, DEVNET_RESOURCE_BOUNDS, getRpcUrl } from './config';

const verifierAddr = () => CONTRACT_ADDRESSES.proofVerifier;
const execOpts = () => IS_DEVNET ? DEVNET_RESOURCE_BOUNDS : {};

function getProvider(): RpcProvider {
  const provider = new RpcProvider({ nodeUrl: getRpcUrl() });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (provider as any).channel.blockIdentifier = 'latest';
  return provider;
}

/**
 * Check if the on-chain verifier is initialized for a given circuit type
 * by calling verify() with dummy data. If it reverts with a specific error
 * (like missing class hash), the verifier isn't set up.
 *
 * Returns true if the verifier appears to be configured (even if proof is invalid).
 */
export async function isVerifierInitialized(circuitType = 1): Promise<boolean> {
  try {
    const provider = getProvider();
    // Call verify with circuit_type and minimal proof data
    // If verifier class hash is not set, this will revert
    // If it's set, it returns true/false (false for invalid proof is fine — means it's working)
    await provider.callContract({
      contractAddress: verifierAddr(),
      entrypoint: 'verify',
      calldata: [
        circuitType.toString(),  // circuit_type: u8
        '1',                     // proof_data length
        '0xdeadbeef',           // dummy proof element
      ],
    });
    // If we get here without error, verifier is responding (even if it returns false)
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // If the error mentions class hash or entry point, verifier isn't initialized
    if (msg.includes('class hash') || msg.includes('CONTRACT_NOT_FOUND') || msg.includes('ENTRYPOINT_NOT_FOUND')) {
      return false;
    }
    // For other errors (like invalid proof format), verifier IS initialized but proof is bad
    return true;
  }
}

/**
 * Set the Garaga verifier class hash for a specific circuit type.
 * Only callable by the ProofVerifier contract owner.
 *
 * @param account - Must be the owner account
 * @param circuitType - 1=range_proof, 2=balance_sufficiency, etc.
 * @param classHash - The declared Garaga verifier class hash on Starknet
 */
export async function setVerifierClassHash(
  account: AccountInterface,
  circuitType: number,
  classHash: string,
): Promise<string> {
  const result = await account.execute(
    {
      contractAddress: verifierAddr(),
      entrypoint: 'set_verifier_class_hash',
      calldata: [circuitType.toString(), classHash],
    },
    undefined,
    execOpts(),
  );
  return result.transaction_hash;
}

/**
 * Initialize ALL circuit types with the same Garaga verifier class hash.
 * Sends a multicall with 7 set_verifier_class_hash calls.
 */
export async function initializeAllVerifiers(
  account: AccountInterface,
  classHash: string,
): Promise<string> {
  const calls = [];
  for (let circuitType = 1; circuitType <= 7; circuitType++) {
    calls.push({
      contractAddress: verifierAddr(),
      entrypoint: 'set_verifier_class_hash',
      calldata: [circuitType.toString(), classHash],
    });
  }
  const result = await account.execute(calls, undefined, execOpts());
  return result.transaction_hash;
}

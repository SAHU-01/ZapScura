/**
 * Proof calldata encoding for Starknet contracts.
 */

/** Convert proof bytes to felt252 array (mock/devnet mode) */
export function bytesToFelts(proof: Uint8Array): string[] {
  const felts: string[] = [];
  for (let i = 0; i < proof.length; i += 31) {
    const chunk = proof.slice(i, Math.min(i + 31, proof.length));
    let val = BigInt(0);
    for (const b of chunk) val = (val << BigInt(8)) | BigInt(b);
    felts.push(`0x${val.toString(16)}`);
  }
  return felts;
}

/** Encode proof using Garaga for real on-chain verification */
export async function encodeGaragaCalldata(
  proof: Uint8Array,
  publicInputs: string[],
  vk: Uint8Array,
): Promise<string[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const garaga: any = await import('garaga');
    const encode = garaga.encodeProofCalldata || garaga.default?.encodeProofCalldata;
    if (!encode) return bytesToFelts(proof);
    const calldata = encode(proof, publicInputs, vk);
    return (calldata as unknown[]).map((v: unknown) => String(v));
  } catch {
    return bytesToFelts(proof);
  }
}

/** Generate a random nullifier for replay protection */
export function generateNullifier(): bigint {
  const bytes = new Uint8Array(31);
  crypto.getRandomValues(bytes);
  let val = BigInt(0);
  for (const b of bytes) val = (val << BigInt(8)) | BigInt(b);
  return val;
}

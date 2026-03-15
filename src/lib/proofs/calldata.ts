/**
 * Proof calldata encoding for Starknet contracts.
 * Uses Garaga's getZKHonkCallData for on-chain verification encoding.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let garagaReady: Promise<any> | null = null;

/** Initialize garaga WASM and return the module */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGaraga(): Promise<any> {
  if (garagaReady) return garagaReady;
  garagaReady = (async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const garaga: any = await import('garaga');
    // init() loads the embedded WASM (data: URL with base64)
    await garaga.init();
    console.log('[ZapScura] Garaga WASM initialized');
    return garaga;
  })();
  return garagaReady;
}

/** Convert proof bytes to felt252 array (mock/devnet mode only) */
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

/** Convert hex string (0x-prefixed) to 32-byte Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  const padded = h.padStart(64, '0');
  const buf = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    buf[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

/**
 * Encode proof using Garaga's getZKHonkCallData for real on-chain verification.
 * Throws on failure — no silent fallback.
 */
export async function encodeGaragaCalldata(
  proof: Uint8Array,
  publicInputs: string[],
  vk: Uint8Array,
): Promise<string[]> {
  const garaga = await getGaraga();

  const getZKHonkCallData = garaga.getZKHonkCallData;
  if (!getZKHonkCallData) {
    throw new Error('Garaga getZKHonkCallData not found. Exports: ' + Object.keys(garaga).join(', '));
  }

  // Convert public inputs from hex strings to concatenated bytes
  const pubInputBytes = new Uint8Array(publicInputs.length * 32);
  publicInputs.forEach((hex, i) => {
    pubInputBytes.set(hexToBytes(hex), i * 32);
  });

  console.log('[ZapScura] Garaga encoding:', proof.length, 'proof bytes,', publicInputs.length, 'pub inputs,', vk.length, 'vk bytes');

  const calldata: bigint[] = getZKHonkCallData(proof, pubInputBytes, vk);

  console.log('[ZapScura] Garaga encoded:', calldata.length, 'felt252 calldata elements');

  return calldata.map((v: bigint) => `0x${v.toString(16)}`);
}

/** Generate a random nullifier for replay protection */
export function generateNullifier(): bigint {
  const bytes = new Uint8Array(31);
  crypto.getRandomValues(bytes);
  let val = BigInt(0);
  for (const b of bytes) val = (val << BigInt(8)) | BigInt(b);
  return val;
}

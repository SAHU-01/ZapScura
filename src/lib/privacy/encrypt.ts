/**
 * ElGamal encryption + Pedersen commitments for shielded amounts.
 *
 * Uses Barretenberg's native Pedersen (Grumpkin curve)
 * to match the Noir circuit's std::hash::pedersen_commitment / pedersen_hash.
 */

/** ElGamal ciphertext: two curve points (c1, c2) */
export interface Ciphertext {
  c1: { x: bigint; y: bigint };
  c2: { x: bigint; y: bigint };
}

const P = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
const FELT252_MAX = (BigInt(1) << BigInt(252)) - BigInt(1);
const SUBGROUP_ORDER = BigInt('2736030358979909402780800718157159386076813972158567259200215660948447373041');
const GEN_X = BigInt('5299619240641551281634865583518297030282874472190772894086521144482721001553');
const GEN_Y = BigInt('16950150798460657717958625567821834550301663161624707787222815936182638968203');

function modpow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = BigInt(1);
  base = ((base % mod) + mod) % mod;
  while (exp > BigInt(0)) {
    if (exp & BigInt(1)) result = (result * base) % mod;
    exp >>= BigInt(1);
    base = (base * base) % mod;
  }
  return result;
}

function pointAdd(x1: bigint, y1: bigint, x2: bigint, y2: bigint): [bigint, bigint] {
  if (x1 === BigInt(0) && y1 === BigInt(0)) return [x2, y2];
  if (x2 === BigInt(0) && y2 === BigInt(0)) return [x1, y1];
  const d = BigInt('12181644023421730124874158521699555681764249180949974110617291017600649128846');
  const a = BigInt('168700');
  const num_x = (((x1 * y2) % P) + ((y1 * x2) % P)) % P;
  const den_x = (BigInt(1) + ((((d * x1) % P) * x2 % P) * y1 % P) * y2) % P;
  const num_y = (((y1 * y2) % P) - ((((a * x1) % P) * x2) % P) + P) % P;
  const den_y = (BigInt(1) - ((((d * x1) % P) * x2 % P) * y1 % P) * y2 % P + P * P) % P;
  const inv_den_x = modpow(den_x, P - BigInt(2), P);
  const inv_den_y = modpow(den_y, P - BigInt(2), P);
  return [(num_x * inv_den_x) % P, (num_y * inv_den_y) % P];
}

function scalarMul(scalar: bigint, px: bigint, py: bigint): [bigint, bigint] {
  let rx = BigInt(0), ry = BigInt(0);
  let qx = px, qy = py;
  let s = scalar;
  while (s > BigInt(0)) {
    if (s & BigInt(1)) [rx, ry] = pointAdd(rx, ry, qx, qy);
    [qx, qy] = pointAdd(qx, qy, qx, qy);
    s >>= BigInt(1);
  }
  return [rx, ry];
}

/* ---- Barretenberg-backed Pedersen ---- */

// Singleton bb instance (lazy-initialized)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bbInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bbInitPromise: Promise<any> | null = null;

// Which Pedersen variant the circuit uses (auto-detected on first call)
let pedersenMode: 'commit' | 'hash' | null = null;

/** Convert a bigint to a 32-byte big-endian Uint8Array (Fr format) */
function bigintToFr(val: bigint): Uint8Array {
  const buf = new Uint8Array(32);
  let v = val;
  for (let i = 31; i >= 0; i--) {
    buf[i] = Number(v & BigInt(0xff));
    v >>= BigInt(8);
  }
  return buf;
}

/** Convert a 32-byte big-endian Uint8Array back to bigint */
function frToBigint(buf: Uint8Array): bigint {
  let val = BigInt(0);
  for (let i = 0; i < buf.length; i++) {
    val = (val << BigInt(8)) | BigInt(buf[i]);
  }
  return val;
}

/** Get or initialize the Barretenberg singleton */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBb(): Promise<any> {
  if (bbInstance) return bbInstance;
  if (bbInitPromise) return bbInitPromise;
  bbInitPromise = (async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bbModule: any = await import('@aztec/bb.js');
    const Barretenberg = bbModule.Barretenberg || bbModule.default?.Barretenberg;
    bbInstance = await Barretenberg.new({ threads: 1 });
    return bbInstance;
  })();
  return bbInitPromise;
}

/** Compute pedersen_commitment([value, blinding]).x using Barretenberg */
async function bbPedersenCommitX(value: bigint, blinding: bigint): Promise<bigint> {
  const bb = await getBb();
  const inputs = [bigintToFr(value), bigintToFr(blinding)];
  const result = await bb.pedersenCommit({ inputs, hashIndex: 0 });
  return frToBigint(result.point.x);
}

/** Compute pedersen_hash([value, blinding]) using Barretenberg */
async function bbPedersenHash(value: bigint, blinding: bigint): Promise<bigint> {
  const bb = await getBb();
  const inputs = [bigintToFr(value), bigintToFr(blinding)];
  const result = await bb.pedersenHash({ inputs, hashIndex: 0 });
  return frToBigint(result.hash);
}

/**
 * Pedersen commitment using Barretenberg — matches Noir circuit.
 *
 * On first call, auto-detects whether the circuit uses pedersen_commitment
 * or pedersen_hash by trying the range_proof circuit with known test values.
 * Caches the result for subsequent calls.
 */
export async function pedersenCommit(value: bigint, blinding: bigint): Promise<bigint> {
  if (pedersenMode === 'hash') {
    return bbPedersenHash(value, blinding);
  }
  if (pedersenMode === 'commit') {
    return bbPedersenCommitX(value, blinding);
  }

  // Auto-detect: try pedersen_commitment first, then pedersen_hash
  // We detect by attempting witness execution with the range_proof circuit
  try {
    const commitResult = await bbPedersenCommitX(value, blinding);

    // Try executing the circuit with this commitment to verify
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const noirModule: any = await import('@noir-lang/noir_js');
    const { loadArtifact } = await import('../proofs/circuits');
    const { CircuitType } = await import('../proofs/circuits');
    const artifact = await loadArtifact(CircuitType.RANGE_PROOF);
    const Noir = noirModule.Noir || noirModule.default?.Noir;
    const noir = new Noir(artifact);

    const testValue = value;
    const testBlinding = blinding;
    const MAX_U64 = BigInt(2) ** BigInt(64) - BigInt(1);
    const toHex = (v: bigint) => `0x${v.toString(16).padStart(64, '0')}`;

    try {
      await noir.execute({
        value: toHex(testValue),
        blinding: toHex(testBlinding),
        commitment: toHex(commitResult),
        max_value: toHex(MAX_U64),
      });
      // pedersen_commitment works!
      pedersenMode = 'commit';
      console.log('[ZapScura] Pedersen mode: commitment (point.x)');
      return commitResult;
    } catch {
      // Try pedersen_hash
      const hashResult = await bbPedersenHash(testValue, testBlinding);
      try {
        await noir.execute({
          value: toHex(testValue),
          blinding: toHex(testBlinding),
          commitment: toHex(hashResult),
          max_value: toHex(MAX_U64),
        });
        pedersenMode = 'hash';
        console.log('[ZapScura] Pedersen mode: hash');
        return hashResult;
      } catch {
        // Neither worked — throw with details
        throw new Error(
          `Pedersen auto-detect failed. commitment(${testValue},${testBlinding})=${commitResult}, hash=${hashResult}. Neither matches the circuit.`
        );
      }
    }
  } catch (err) {
    // If auto-detect itself fails (e.g., bb init error), fall back to commitment
    console.error('[ZapScura] Pedersen auto-detect error, falling back to commitment:', err);
    pedersenMode = 'commit';
    return bbPedersenCommitX(value, blinding);
  }
}

/** Find a valid blinding factor that produces a felt252-range commitment */
export async function findValidBlinding(
  value: bigint,
  startOffset = 0,
): Promise<{ blinding: bigint; commitment: bigint }> {
  for (let i = startOffset; i < startOffset + 1000; i++) {
    const blinding = BigInt(i + 1);
    const commitment = await pedersenCommit(value, blinding);
    if (commitment > BigInt(0) && commitment <= FELT252_MAX) {
      return { blinding, commitment };
    }
  }
  // Fallback (should rarely happen)
  const blinding = BigInt(1);
  const commitment = await pedersenCommit(value, blinding);
  return { blinding, commitment };
}

/** Compute ElGamal ciphertext delta for balance update */
export function computeCiphertextDelta(
  amount: bigint,
  publicKey: { x: bigint; y: bigint },
  isDeposit: boolean,
): { delta_c1: bigint; delta_c2: bigint } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let r = BigInt(0);
  for (const b of bytes) r = (r << BigInt(8)) | BigInt(b);
  r = (r % (SUBGROUP_ORDER - BigInt(2))) + BigInt(1);

  const [c1x] = scalarMul(r, GEN_X, GEN_Y);
  const [sharedX, sharedY] = scalarMul(r, publicKey.x, publicKey.y);
  const [mGx, mGy] = scalarMul(amount, GEN_X, GEN_Y);

  let c2x: bigint;
  if (isDeposit) {
    [c2x] = pointAdd(sharedX, sharedY, mGx, mGy);
  } else {
    const negMGy = (P - mGy) % P;
    [c2x] = pointAdd(sharedX, sharedY, mGx, negMGy);
  }

  return { delta_c1: c1x, delta_c2: c2x };
}

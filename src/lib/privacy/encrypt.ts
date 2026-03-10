/**
 * ElGamal encryption + Pedersen commitments for shielded amounts.
 * Ported from Obscura.
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
const H_X = BigInt('9671717474070082183213120505906694280345674901098722789458757420325286642825');
const H_Y = BigInt('14655019877793856891887000922277836972901573616510047188681961816651715360982');

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

/** Pedersen commitment: C = value * G + blinding * H (mod P) */
export function pedersenCommit(value: bigint, blinding: bigint): bigint {
  const [vgx, vgy] = scalarMul(value, GEN_X, GEN_Y);
  const [bhx, bhy] = scalarMul(blinding, H_X, H_Y);
  const [cx] = pointAdd(vgx, vgy, bhx, bhy);
  return cx;
}

/** Find a valid blinding factor that produces a felt252-range commitment */
export async function findValidBlinding(
  value: bigint,
  startOffset = 0,
): Promise<{ blinding: bigint; commitment: bigint }> {
  for (let i = startOffset; i < startOffset + 1000; i++) {
    const blinding = BigInt(i + 1);
    const commitment = pedersenCommit(value, blinding);
    if (commitment > BigInt(0) && commitment <= FELT252_MAX) {
      return { blinding, commitment };
    }
  }
  return { blinding: BigInt(1), commitment: pedersenCommit(value, BigInt(1)) };
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

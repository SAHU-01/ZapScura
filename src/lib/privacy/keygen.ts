/**
 * ElGamal keypair generation on Baby JubJub curve.
 * Ported from Obscura — same curve parameters for contract compatibility.
 */

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

const P = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

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

export function generateKeyPair(): { privateKey: bigint; publicKey: { x: bigint; y: bigint } } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let privKey = BigInt(0);
  for (const b of bytes) privKey = (privKey << BigInt(8)) | BigInt(b);
  privKey = (privKey % (SUBGROUP_ORDER - BigInt(2))) + BigInt(1);
  const [px, py] = scalarMul(privKey, GEN_X, GEN_Y);
  return { privateKey: privKey, publicKey: { x: px, y: py } };
}

export function derivePublicKey(privateKey: bigint): { x: bigint; y: bigint } {
  const [px, py] = scalarMul(privateKey, GEN_X, GEN_Y);
  return { x: px, y: py };
}

export function serializeKeyPair(kp: { privateKey: bigint; publicKey: { x: bigint; y: bigint } }): string {
  return JSON.stringify({
    privateKey: `0x${kp.privateKey.toString(16)}`,
    publicKey: {
      x: `0x${kp.publicKey.x.toString(16)}`,
      y: `0x${kp.publicKey.y.toString(16)}`,
    },
  });
}

export function deserializeKeyPair(json: string): { privateKey: bigint; publicKey: { x: bigint; y: bigint } } {
  const parsed = JSON.parse(json);
  return {
    privateKey: BigInt(parsed.privateKey),
    publicKey: {
      x: BigInt(parsed.publicKey.x),
      y: BigInt(parsed.publicKey.y),
    },
  };
}

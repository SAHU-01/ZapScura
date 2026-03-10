/**
 * Circuit loading and management.
 * Loads compiled Noir circuits from /public/circuits/ directory.
 */

export enum CircuitType {
  RANGE_PROOF = 'range_proof',
  BALANCE_SUFFICIENCY = 'balance_sufficiency',
  COLLATERAL_RATIO = 'collateral_ratio',
  DEBT_UPDATE_VALIDITY = 'debt_update_validity',
  ZERO_DEBT = 'zero_debt',
  VAULT_SOLVENCY = 'vault_solvency',
  CDP_SAFETY_BOUND = 'cdp_safety_bound',
}

export const PROOF_TYPE_IDS: Record<CircuitType, number> = {
  [CircuitType.RANGE_PROOF]: 1,
  [CircuitType.BALANCE_SUFFICIENCY]: 2,
  [CircuitType.COLLATERAL_RATIO]: 3,
  [CircuitType.DEBT_UPDATE_VALIDITY]: 4,
  [CircuitType.ZERO_DEBT]: 5,
  [CircuitType.VAULT_SOLVENCY]: 6,
  [CircuitType.CDP_SAFETY_BOUND]: 7,
};

const circuitCache = new Map<CircuitType, Uint8Array>();
const vkCache = new Map<CircuitType, Uint8Array>();

export async function loadCircuit(type: CircuitType): Promise<Uint8Array> {
  if (circuitCache.has(type)) return circuitCache.get(type)!;
  const resp = await fetch(`/circuits/${type}.json`);
  if (!resp.ok) throw new Error(`Failed to load circuit: ${type}`);
  const json = await resp.json();
  const bytecode = Uint8Array.from(atob(json.bytecode), (c) => c.charCodeAt(0));
  circuitCache.set(type, bytecode);
  return bytecode;
}

export async function loadVK(type: CircuitType): Promise<Uint8Array> {
  if (vkCache.has(type)) return vkCache.get(type)!;
  const resp = await fetch(`/circuits/${type}_vk.bin`);
  if (!resp.ok) throw new Error(`Failed to load VK: ${type}`);
  const buf = await resp.arrayBuffer();
  const vk = new Uint8Array(buf);
  vkCache.set(type, vk);
  return vk;
}

export async function preloadCircuits(types: CircuitType[]): Promise<void> {
  await Promise.all(types.map((t) => loadCircuit(t)));
}

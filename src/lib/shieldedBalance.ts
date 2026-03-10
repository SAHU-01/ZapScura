/**
 * Local shielded balance tracking via localStorage.
 * On-chain balances are encrypted — we track locally for UX.
 */

const STORAGE_PREFIX = 'zapscura_';

export interface ShieldedWitnessState {
  balanceU64: bigint;
  blinding: bigint;
  commitment: bigint;
}

function getKey(address: string, suffix: string): string {
  return `${STORAGE_PREFIX}${address.slice(0, 10)}_${suffix}`;
}

export function getLocalShieldedBalance(address: string): bigint {
  const raw = localStorage.getItem(getKey(address, 'shielded'));
  return raw ? BigInt(raw) : BigInt(0);
}

export function addShieldedBalance(address: string, amount: bigint): void {
  const current = getLocalShieldedBalance(address);
  localStorage.setItem(getKey(address, 'shielded'), String(current + amount));
}

export function subtractShieldedBalance(address: string, amount: bigint): void {
  const current = getLocalShieldedBalance(address);
  const newBal = current > amount ? current - amount : BigInt(0);
  localStorage.setItem(getKey(address, 'shielded'), String(newBal));
}

export function getShieldedWitnessState(address: string): ShieldedWitnessState | null {
  const raw = localStorage.getItem(getKey(address, 'witness'));
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    balanceU64: BigInt(parsed.balanceU64),
    blinding: BigInt(parsed.blinding),
    commitment: BigInt(parsed.commitment),
  };
}

export function setShieldedWitnessState(address: string, state: ShieldedWitnessState): void {
  localStorage.setItem(getKey(address, 'witness'), JSON.stringify({
    balanceU64: String(state.balanceU64),
    blinding: String(state.blinding),
    commitment: String(state.commitment),
  }));
}

export function getLocalCDPCollateral(address: string): bigint {
  const raw = localStorage.getItem(getKey(address, 'cdp_col'));
  return raw ? BigInt(raw) : BigInt(0);
}

export function setLocalCDPCollateral(address: string, amount: bigint): void {
  localStorage.setItem(getKey(address, 'cdp_col'), String(amount));
}

export function getLocalCDPDebt(address: string): bigint {
  const raw = localStorage.getItem(getKey(address, 'cdp_debt'));
  return raw ? BigInt(raw) : BigInt(0);
}

export function setLocalCDPDebt(address: string, amount: bigint): void {
  localStorage.setItem(getKey(address, 'cdp_debt'), String(amount));
}

export function getCDPColWitness(address: string): ShieldedWitnessState | null {
  const raw = localStorage.getItem(getKey(address, 'cdp_col_witness'));
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    balanceU64: BigInt(parsed.balanceU64),
    blinding: BigInt(parsed.blinding),
    commitment: BigInt(parsed.commitment),
  };
}

export function setCDPColWitness(address: string, state: ShieldedWitnessState): void {
  localStorage.setItem(getKey(address, 'cdp_col_witness'), JSON.stringify({
    balanceU64: String(state.balanceU64),
    blinding: String(state.blinding),
    commitment: String(state.commitment),
  }));
}

export function clearCDPState(address: string): void {
  localStorage.removeItem(getKey(address, 'cdp_col'));
  localStorage.removeItem(getKey(address, 'cdp_debt'));
  localStorage.removeItem(getKey(address, 'cdp_col_witness'));
}

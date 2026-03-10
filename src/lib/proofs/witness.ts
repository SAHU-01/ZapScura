/**
 * Witness structures for ZK circuits.
 */

export interface RangeProofWitness {
  value: bigint;
  blinding: bigint;
  commitment: bigint;
  max_value: bigint;
}

export interface BalanceSufficiencyWitness {
  balance: bigint;
  amount: bigint;
  new_balance: bigint;
  balance_blinding: bigint;
  amount_blinding: bigint;
  new_balance_blinding: bigint;
  balance_commitment: bigint;
  amount_commitment: bigint;
  new_balance_commitment: bigint;
}

export interface CollateralRatioWitness {
  collateral: bigint;
  debt: bigint;
  collateral_blinding: bigint;
  debt_blinding: bigint;
  collateral_commitment: bigint;
  debt_commitment: bigint;
  price: bigint;
  min_ratio_percent: bigint;
}

export interface DebtUpdateWitness {
  old_debt: bigint;
  new_debt: bigint;
  delta: bigint;
  old_blinding: bigint;
  new_blinding: bigint;
  delta_blinding: bigint;
  old_debt_commitment: bigint;
  new_debt_commitment: bigint;
  delta_commitment: bigint;
  is_repayment: boolean;
}

export interface ZeroDebtWitness {
  debt: bigint;
  blinding: bigint;
  debt_commitment: bigint;
}

export interface VaultSolvencyWitness {
  total_assets: bigint;
  total_liabilities: bigint;
  num_accounts: bigint;
  assets_blinding: bigint;
  liabilities_blinding: bigint;
  assets_commitment: bigint;
  liabilities_commitment: bigint;
}

export interface CDPSafetyWitness {
  total_collateral: bigint;
  total_debt: bigint;
  price: bigint;
  min_ratio: bigint;
  num_cdps: bigint;
  collateral_blinding: bigint;
  debt_blinding: bigint;
  collateral_commitment: bigint;
  debt_commitment: bigint;
}

export type WitnessMap = Map<number, string>;

function toHex(val: bigint): string {
  return `0x${val.toString(16).padStart(64, '0')}`;
}

export function generateWitnessInputs(
  type: string,
  data: unknown,
): Record<string, string> {
  const inputs: Record<string, string> = {};

  if (type === 'range_proof') {
    const w = data as RangeProofWitness;
    inputs.value = toHex(w.value);
    inputs.blinding = toHex(w.blinding);
    inputs.commitment = toHex(w.commitment);
    inputs.max_value = toHex(w.max_value);
  } else if (type === 'balance_sufficiency') {
    const w = data as BalanceSufficiencyWitness;
    inputs.balance = toHex(w.balance);
    inputs.amount = toHex(w.amount);
    inputs.new_balance = toHex(w.new_balance);
    inputs.balance_blinding = toHex(w.balance_blinding);
    inputs.amount_blinding = toHex(w.amount_blinding);
    inputs.new_balance_blinding = toHex(w.new_balance_blinding);
    inputs.balance_commitment = toHex(w.balance_commitment);
    inputs.amount_commitment = toHex(w.amount_commitment);
    inputs.new_balance_commitment = toHex(w.new_balance_commitment);
  } else if (type === 'collateral_ratio') {
    const w = data as CollateralRatioWitness;
    inputs.collateral = toHex(w.collateral);
    inputs.debt = toHex(w.debt);
    inputs.collateral_blinding = toHex(w.collateral_blinding);
    inputs.debt_blinding = toHex(w.debt_blinding);
    inputs.collateral_commitment = toHex(w.collateral_commitment);
    inputs.debt_commitment = toHex(w.debt_commitment);
    inputs.price = toHex(w.price);
    inputs.min_ratio_percent = toHex(w.min_ratio_percent);
  } else if (type === 'debt_update_validity') {
    const w = data as DebtUpdateWitness;
    inputs.old_debt = toHex(w.old_debt);
    inputs.new_debt = toHex(w.new_debt);
    inputs.delta = toHex(w.delta);
    inputs.old_blinding = toHex(w.old_blinding);
    inputs.new_blinding = toHex(w.new_blinding);
    inputs.delta_blinding = toHex(w.delta_blinding);
    inputs.old_debt_commitment = toHex(w.old_debt_commitment);
    inputs.new_debt_commitment = toHex(w.new_debt_commitment);
    inputs.delta_commitment = toHex(w.delta_commitment);
    inputs.is_repayment = w.is_repayment ? '0x01' : '0x00';
  } else if (type === 'zero_debt') {
    const w = data as ZeroDebtWitness;
    inputs.debt = toHex(w.debt);
    inputs.blinding = toHex(w.blinding);
    inputs.debt_commitment = toHex(w.debt_commitment);
  }

  return inputs;
}

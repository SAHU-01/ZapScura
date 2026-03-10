/**
 * Proof history persistence in localStorage.
 */

export interface ProofRecord {
  id: string;
  circuit: string;
  status: 'verified' | 'pending' | 'failed';
  timestamp: number;
  txHash?: string;
}

const MAX_RECORDS = 50;

function getKey(address: string): string {
  return `zapscura_${address.slice(0, 10)}_proofs`;
}

export function loadProofHistory(address: string): ProofRecord[] {
  const raw = localStorage.getItem(getKey(address));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addProofRecord(address: string, record: ProofRecord): void {
  const history = loadProofHistory(address);
  history.unshift(record);
  if (history.length > MAX_RECORDS) history.length = MAX_RECORDS;
  localStorage.setItem(getKey(address), JSON.stringify(history));
}

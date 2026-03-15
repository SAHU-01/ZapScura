/**
 * Proof generation hook for ZapScura.
 */

import { useState, useCallback } from 'react';
import { generateProof, type ProofProgress, type ProofResult } from '../lib/proofs/prover';
import { CircuitType } from '../lib/proofs/circuits';

export function useProof() {
  const [isProving, setIsProving] = useState(false);
  const [progress, setProgress] = useState<ProofProgress | null>(null);
  const [result, setResult] = useState<ProofResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prove = useCallback(async (input: { type: CircuitType; data: unknown }): Promise<{ proof: Uint8Array; publicInputs: string[]; vk: Uint8Array }> => {
    setIsProving(true);
    setError(null);
    setResult(null);

    try {
      const proofResult = await generateProof(input.type, input.data, setProgress);
      setResult(proofResult);
      return { proof: proofResult.proof, publicInputs: proofResult.publicInputs, vk: proofResult.vk };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Proof generation failed';
      setError(msg);
      throw err;
    } finally {
      setIsProving(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProving(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return { prove, isProving, progress, result, error, reset };
}

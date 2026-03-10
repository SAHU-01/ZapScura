/**
 * ZK proof generation using Noir + Barretenberg (in-browser).
 */

import { CircuitType, loadCircuit } from './circuits';
import { generateWitnessInputs } from './witness';

export interface ProofProgress {
  stage: 'loading' | 'witnessing' | 'proving' | 'encoding' | 'submitting' | 'confirming' | 'done' | 'error';
  message: string;
  percent?: number;
}

export type ProgressCallback = (p: ProofProgress) => void;

export interface ProofResult {
  proof: Uint8Array;
  publicInputs: string[];
  timeMs: number;
}

export async function generateProof(
  circuitType: CircuitType,
  witnessData: unknown,
  onProgress?: (p: ProofProgress) => void,
): Promise<ProofResult> {
  const start = Date.now();
  const report = onProgress || (() => {});

  try {
    report({ stage: 'loading', message: 'Loading circuit...', percent: 10 });
    const bytecode = await loadCircuit(circuitType);

    report({ stage: 'witnessing', message: 'Generating witness...', percent: 30 });
    const inputs = generateWitnessInputs(circuitType, witnessData);

    report({ stage: 'proving', message: 'Generating ZK proof... (this may take 15-30s)', percent: 50 });

    // Dynamic import for code-splitting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const noirModule: any = await import('@noir-lang/noir_js');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bbModule: any = await import('@aztec/bb.js');

    const Noir = noirModule.Noir || noirModule.default?.Noir;
    const noir = new Noir({ bytecode: Array.from(bytecode) });
    const { witness } = await noir.execute(inputs);

    const bbInit = bbModule.default || bbModule;
    const bb = typeof bbInit === 'function' ? await bbInit() : bbInit;
    const proofRaw = await bb.proveUltraKeccakZKHonk(bytecode, witness);
    const publicInputs: string[] = Array.from({ length: Math.min(10, witness.length) }, (_, i) => String(witness[i]));

    report({ stage: 'done', message: 'Proof generated!', percent: 100 });

    return {
      proof: proofRaw instanceof Uint8Array ? proofRaw : new Uint8Array(proofRaw),
      publicInputs,
      timeMs: Date.now() - start,
    };
  } catch (err) {
    report({ stage: 'error', message: `Proof generation failed: ${err}` });
    throw err;
  }
}

/**
 * ZK proof generation using Noir + Barretenberg (in-browser).
 *
 * Uses:
 * - @noir-lang/noir_js (Noir class) for witness generation
 * - @aztec/bb.js (UltraHonkBackend) for proof generation
 */

import { CircuitType, loadArtifact, loadVK } from './circuits';
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
  vk: Uint8Array;
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
    const artifact = await loadArtifact(circuitType);

    report({ stage: 'witnessing', message: 'Generating witness...', percent: 30 });
    const inputs = generateWitnessInputs(circuitType, witnessData);

    // Dynamic import for code-splitting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const noirModule: any = await import('@noir-lang/noir_js');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bbModule: any = await import('@aztec/bb.js');

    // Noir needs the full artifact (with abi) for witness generation
    const Noir = noirModule.Noir || noirModule.default?.Noir;
    const noir = new Noir(artifact);
    const { witness } = await noir.execute(inputs);

    report({ stage: 'proving', message: 'Generating ZK proof... (this may take 15-30s)', percent: 50 });

    // UltraHonkBackend takes the base64 bytecode string from the artifact
    const UltraHonkBackend = bbModule.UltraHonkBackend || bbModule.default?.UltraHonkBackend;
    const backend = new UltraHonkBackend(artifact.bytecode);

    // Generate UltraKeccakZKHonk proof
    const { proof: proofBytes, publicInputs } = await backend.generateProof(witness, { keccakZK: true });

    report({ stage: 'encoding', message: 'Loading verification key...', percent: 85 });

    // Use pre-compiled VK files (1888 bytes) for Garaga calldata encoding
    const vkBytes = await loadVK(circuitType);

    // Cleanup
    await backend.destroy().catch(() => {});

    report({ stage: 'done', message: 'Proof generated!', percent: 100 });

    return {
      proof: proofBytes instanceof Uint8Array ? proofBytes : new Uint8Array(proofBytes),
      publicInputs,
      vk: vkBytes,
      timeMs: Date.now() - start,
    };
  } catch (err) {
    report({ stage: 'error', message: `Proof generation failed: ${err}` });
    throw err;
  }
}

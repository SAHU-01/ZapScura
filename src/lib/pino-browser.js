// Minimal ESM stub for pino (required by bb.js in browser)
export function pino() {
  return {
    info: () => {},
    debug: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
    trace: () => {},
    child: () => pino(),
    level: 'silent',
  };
}
export default pino;

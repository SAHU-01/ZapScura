import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      pino: path.resolve(__dirname, 'src/lib/pino-browser.js'),
    },
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['@noir-lang/noir_js', '@aztec/bb.js'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
});

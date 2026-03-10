/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STARKNET_NETWORK: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_VAULT_ADDRESS: string;
  readonly VITE_CDP_ADDRESS: string;
  readonly VITE_VERIFIER_ADDRESS: string;
  readonly VITE_SOLVENCY_ADDRESS: string;
  readonly VITE_PRICE_FEED_ADDRESS: string;
  readonly VITE_XYBTC_ADDRESS: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

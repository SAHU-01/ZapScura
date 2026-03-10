# ZapScura — Privacy-Preserving AI DeFi Agent

> Private DeFi yield in one sentence — just tell the AI what you want.

ZapScura is a privacy-preserving AI DeFi agent that lets users manage shielded Bitcoin and STRK positions through natural language chat, with zero-friction onboarding via **Starkzap SDK** social login and gasless transactions.

## How It Works

1. **Sign in** with Google/Apple/email (Starkzap social login — no seed phrase)
2. **Chat** with the AI agent: "Stake 0.1 BTC privately and earn yield"
3. The AI **generates ZK proofs**, encrypts balances, submits gasless transactions
4. Users see their **private portfolio**: shielded balances, yield earned, proof history

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   USER (Browser)                      │
│                                                       │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │ Starkzap │  │  AI Chat  │  │  Privacy Engine    │  │
│  │  Social  │  │  (Main    │  │  (ElGamal + Noir)  │  │
│  │  Login   │  │   UI)     │  │                    │  │
│  └────┬─────┘  └────┬──────┘  └────────┬──────────┘  │
│       │              │                  │              │
│  ┌────┴──────────────┴──────────────────┴──────────┐  │
│  │       Action Executor (13 actions)               │  │
│  │  deposit | shield | stake | unshield | withdraw  │  │
│  │  open_cdp | lock | mint_susd | repay | close     │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                              │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │         Starkzap Paymaster (gasless tx)          │  │
│  └──────────────────────┬──────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
               ┌──────────┴──────────┐
               │  Starknet (Sepolia) │
               │                     │
               │  ShieldedVault      │
               │  ShieldedCDP        │
               │  ProofVerifier      │
               │  (Garaga verifiers) │
               │  SolvencyProver     │
               └─────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Wallet | Starkzap SDK (Social Login + Paymaster) |
| AI | DeepSeek API (via Vercel serverless proxy) |
| ZK Proofs | Noir 1.0.0-beta.16 + bb.js (in-browser) |
| On-chain Verification | Garaga verifier contracts (7 circuits) |
| Privacy | ElGamal encryption (Baby JubJub) |
| Contracts | Cairo (Starknet) — deployed on Sepolia |
| Hosting | Vercel |

## Key Differentiators

1. **AI-first interface**: Natural language replaces complex DeFi UIs
2. **Privacy by default**: ZK proofs + encrypted balances — portfolio invisible on-chain
3. **Zero-friction onboarding**: Starkzap social login + paymaster = no wallet, no gas
4. **Real proof verification**: Garaga on-chain verifiers — real ZK proofs on Starknet
5. **Starknet-native**: Built for strkBTC + Starknet ecosystem

## Getting Started

```bash
cd ZapScura
npm install
npm run dev
```

Set up environment variables in `.env`:
```
VITE_STARKNET_NETWORK=sepolia
VITE_DEEPSEEK_API_KEY=your_key_here
```

For Vercel deployment:
```
DEEPSEEK_API_KEY=your_key_here
```

## ZK Circuits (7)

| Circuit | Purpose |
|---------|---------|
| range_proof | Proves shielded amount is valid |
| balance_sufficiency | Proves unshield without underflow |
| collateral_ratio | Proves CDP health (200% min) |
| debt_update_validity | Validates borrow/repay arithmetic |
| zero_debt | Proves CDP debt is zero for closing |
| vault_solvency | Protocol vault solvency attestation |
| cdp_safety_bound | Protocol-wide CDP coverage |

## Starkzap Integration

ZapScura leverages the Starkzap SDK modules:

- **Wallets**: Social login via Privy + Cartridge Controller
- **Paymaster**: Gasless transactions via AVNU / Cartridge
- **DeFi**: Access to staking, token operations, balance checking

## Built For

Starkzap Developer Challenge — $1,500 best build / $500 most creative

## License

MIT

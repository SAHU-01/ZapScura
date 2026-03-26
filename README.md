# ZapScura: Privacy-Preserving AI DeFi Agent on Starknet

> Private DeFi yield in one sentence — just tell the AI what you want.

## What is ZapScura?

ZapScura is a privacy-preserving AI DeFi agent built on Starknet [currently on testnet]. It lets users manage shielded Bitcoin and STRK positions through **natural language chat** — stake BTC via liquid staking, shield balances using ElGamal encryption, open private CDPs to mint stablecoins, and prove solvency — all without revealing actual amounts on-chain.

Every DeFi protocol today leaks your financial data. Balances, positions, strategies — everything is visible to MEV bots, competitors, and on-chain analysts. ZapScura fixes this — and makes it **fun**.

What makes ZapScura different: an **AI-first interface** replaces complex DeFi UIs with natural language, **zero-friction onboarding** via Starkzap social login removes seed phrases and gas, and a full **gamification layer** turns privacy into a game with XP, levels, achievements, and streaks.

## The Problems We Solve

| Problem | ZapScura's Solution |
|---------|-------------------|
| DeFi UIs are complex and intimidating | AI chat agent — just describe what you want in plain English |
| All balances/positions visible on-chain | ElGamal encryption + Pedersen commitments + ZK proofs |
| Wallet setup is friction-heavy | Starkzap social login (Google/Apple/email) — no seed phrase |
| Gas fees deter new users | Starkzap Paymaster — gasless transactions |
| Privacy tools feel dry and technical | Gamification — XP, levels, achievements, streaks, quests |
| No way to verify protocol health privately | On-chain solvency proofs via Garaga verifiers |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     USER (Browser)                        │
│                                                           │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────────┐ │
│  │ Starkzap │  │  AI Chat  │  │    Privacy Engine       │ │
│  │  Social  │  │  Agent    │  │  (ElGamal + Pedersen    │ │
│  │  Login   │  │  (Main UI)│  │   + Noir ZK Proofs)    │ │
│  └────┬─────┘  └────┬──────┘  └──────────┬─────────────┘ │
│       │              │                    │                │
│  ┌────┴──────────────┴────────────────────┴────────────┐  │
│  │         Action Executor (13 actions)                 │  │
│  │  deposit | shield | stake | unshield | withdraw      │  │
│  │  open_cdp | lock | mint_susd | repay | close_cdp     │  │
│  │  faucet | check_balances | check_solvency           │  │
│  └─────────────────────┬───────────────────────────────┘  │
│                         │                                  │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │       Gamification Engine (XP + Levels + Quests)     │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                  │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │         Starkzap Paymaster (gasless tx)               │  │
│  └──────────────────────┬──────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │
               ┌──────────┴───────────┐
               │  Starknet (Sepolia)   │
               │                       │
               │  ShieldedVault        │
               │  ShieldedCDP          │
               │  ProofVerifier        │
               │  (Garaga verifiers)   │
               │  SolvencyProver       │
               └───────────────────────┘
```

## Privacy Stack — Three Cryptographic Layers

### Layer 1: ElGamal Encrypted Balances

Balances are stored on-chain as ElGamal ciphertexts on the Baby JubJub curve:

```
Ciphertext = (C1, C2) where:
  C1 = r × G              (ephemeral public key)
  C2 = amount × G + r × PK (encrypted amount)

  r  = random blinding factor
  G  = generator point (Baby JubJub)
  PK = user's public key
```

**Properties:**
- **Additively homomorphic** — Contract can update encrypted balances: `Enc(a) + Enc(b) = Enc(a+b)` without decrypting
- **Owner-decryptable** — Only the private key holder can recover the plaintext amount
- **Semantically secure** — Ciphertexts reveal nothing about plaintexts
- **Re-randomizable** — Ciphertexts can be refreshed without changing plaintext

**Client-Side Operations:**
```
Key Generation:   sk = randomScalar(), pk = G × sk
Encryption:       r = randomScalar(), C1 = r × G, C2 = r × PK + amount × G
Decryption:       shared = sk × C1, encoded = C2 - shared, amount = discreteLog(encoded)
Homomorphic Add:  (a.C1 + b.C1, a.C2 + b.C2) = Enc(a + b)
```

### Layer 2: Pedersen Commitment Scheme

Every balance operation produces a Pedersen commitment used as a public input to ZK proofs:

```
commitment = PedersenHash(value, blinding_factor)
```

The contract stores commitments (not amounts). ZK proofs prove properties about committed values without revealing them. Commitments bind the value — you can't change it after committing — while the blinding factor keeps it hidden.

### Layer 3: Zero-Knowledge Proofs (Noir + Garaga)

Seven specialized circuits prove different properties about encrypted state:

| Circuit | Purpose |
|---------|---------|
| `range_proof` | Proves shielded amount is within valid range |
| `balance_sufficiency` | Proves unshield/withdrawal won't cause underflow |
| `collateral_ratio` | Proves CDP health (≥200% collateralization) |
| `debt_update_validity` | Validates borrow/repay arithmetic correctness |
| `zero_debt` | Proves CDP debt is exactly zero for closure |
| `vault_solvency` | Protocol-wide vault solvency attestation |
| `cdp_safety_bound` | Protocol-wide CDP coverage proof |

The contract never sees your amounts — it only sees the proof (which reveals nothing) and the commitment (which hides the value).

All circuits are written in **Noir**, compiled to ACIR, and proven using Barretenberg's **UltraKeccakZKHonk** proving system. Proofs are generated entirely in-browser in ~5–15 seconds. On-chain verification happens via **Garaga-generated Cairo verifier contracts** using `library_call_syscall` — stateless, efficient, and upgradeable.

## Staking Flow — Private BTC Yield

ZapScura integrates liquid staking so users never interact with validators directly. The entire staking infrastructure is abstracted away.

**Step-by-step:**

1. **Bridge BTC to Starknet** — Use a BTC bridge to bring Bitcoin to Starknet as wrapped BTC
2. **Deposit into ShieldedVault** — Call `deposit()` with wrapped BTC. The vault routes it for staking, minting xyBTC (liquid staking token). Your BTC is now earning yield. Requires: `RANGE_PROOF`
3. **Shield to sxyBTC** — Convert public xyBTC into encrypted sxyBTC. Your balance becomes an ElGamal ciphertext on-chain. Only your private key can decrypt it. Requires: `DEBT_UPDATE_VALIDITY` proof

**Token Flow:** `BTC → wBTC → xyBTC (staking) → sxyBTC (shielded)`

**Key Properties:**
- No validator management required — staking protocol handles delegation, rewards, slashing protection
- xyBTC exchange rate appreciates as staking rewards accrue
- After shielding, nobody on-chain can see how much you hold — yield accrues silently
- Instant exit possible via DEX swap (bypass unbonding period)

## Shielding Protocol — The Privacy Layer

Shielding converts a public on-chain balance into an encrypted balance that only you can read. It's the core privacy primitive of ZapScura.

### Shield Operation (Public → Encrypted)
```
shield(amount, commitment, ciphertext, proof) → encrypted balance

1. Client: Build Pedersen commitment = Hash(amount, randomness)
2. Client: Encrypt amount with ElGamal → ciphertext (C1, C2)
3. Client: Generate RANGE_PROOF (first shield) or DEBT_UPDATE_VALIDITY proof
4. Client: Encode proof via Garaga npm → Starknet calldata
5. Contract: Verify proof on-chain via ProofVerifier → Garaga library_call
6. Contract: Store ciphertext, consume nullifier, emit event
```

### Unshield Operation (Encrypted → Public)
```
unshield(amount, commitment, ciphertext, proof) → public balance

1. Client: Decrypt current balance using private key
2. Client: Generate BALANCE_SUFFICIENCY proof (proves balance ≥ withdrawal)
3. Contract: Verify proof, update ciphertext, return public xyBTC
4. User: Withdraw public xyBTC from vault
```

### Key Management

All encryption keys are managed entirely client-side. The protocol operator never has access to private keys.

- Master key derived via PBKDF2 from user password
- ElGamal private key encrypted with AES-256-GCM in browser localStorage
- Optional export to encrypted JSON backup file
- **If you lose your encryption key, you lose access to your shielded balances forever — there is no recovery mechanism**

## Lending Protocol — ShieldedCDP

The ShieldedCDP lets users borrow sUSD stablecoins against their encrypted sxyBTC collateral. Every value — collateral amount, debt amount, collateral ratio — stays hidden behind Pedersen commitments and ZK proofs.

### CDP Parameters

| Parameter | Value |
|-----------|-------|
| Min Collateral Ratio | 200% |
| Liquidation Threshold | 150% |
| Stability Fee | 2% APR |
| Max Debt per CDP | Protocol-limited |

### CDP Lifecycle

1. **Open CDP** — `open_cdp()` creates a new position with a unique `position_id`. No proof required.
2. **Lock Collateral** — `lock_collateral(amount, proof)` transfers sxyBTC from shielded balance to CDP. Amount stays encrypted. Requires: `BALANCE_SUFFICIENCY` proof.
3. **Mint sUSD** — `mint_susd(commitment, proof)` borrows sUSD against locked collateral. Requires: `COLLATERAL_RATIO` proof (proves collateral × price ≥ debt × 200% without revealing amounts). On-chain calldata contains ONLY commitments, ciphertexts, nullifiers, and proof bytes — NO amounts.
4. **Repay sUSD** — `repay(commitment, proof)` burns sUSD to reduce debt. Requires: `DEBT_UPDATE_VALIDITY` proof.
5. **Close CDP** — `close_cdp(proof)` closes position when fully repaid. Requires: `ZERO_DEBT` proof. Unlocks all collateral back to shielded balance.

## All 13 Executable Actions

| Action | Description | ZK Proof Required |
|--------|-------------|-------------------|
| `faucet` | Mint test xyBTC tokens | No |
| `deposit` | Deposit xyBTC into ShieldedVault | No |
| `shield` | Convert public → encrypted balance | `RANGE_PROOF` |
| `unshield` | Convert encrypted → public balance | `BALANCE_SUFFICIENCY` |
| `withdraw` | Withdraw public xyBTC from vault | No |
| `open_cdp` | Create new CDP position | No |
| `lock_collateral` | Lock sxyBTC as CDP collateral | `BALANCE_SUFFICIENCY` |
| `mint_susd` | Borrow sUSD against collateral | `COLLATERAL_RATIO` |
| `repay` | Repay sUSD debt | `DEBT_UPDATE_VALIDITY` |
| `close_cdp` | Close CDP (must be debt-free) | `ZERO_DEBT` |
| `submit_solvency` | Submit vault solvency proof | `VAULT_SOLVENCY` |
| `check_balances` | View decrypted balances | No |
| `check_solvency` | Check protocol solvency status | No |

## Proof Generation Flow (In-Browser)

Every private operation follows this pipeline:

```
1. [LOADING  — 10%]  Load circuit artifact JSON from /public/circuits/
2. [WITNESS  — 30%]  Generate witness inputs (amounts, blindings, commitments)
3. [PROVING  — 50%]  Generate UltraKeccakZKHonk proof (~5-15 seconds)
4. [ENCODING — 85%]  Load verification key (1888-byte pre-compiled VK)
5. [DONE     — 100%] Return proof + public inputs → encode as Starknet calldata
```

Proofs are cached in localStorage (max 50 per address) with full history: circuit type, status (verified/pending/failed), timestamp, and transaction hash.

## Solvency Proofs — Protocol Health

ZapScura maintains two independent solvency domains. This isolation prevents issues in one domain from affecting the other.

**Vault Solvency** — Proves: `Sum(UserDepositsCipher) == VaultReserveCipher`. Ensures all user deposits are backed by actual reserves. No individual position is revealed.

**CDP Solvency** — Proves: `TotalDebt <= TotalCollateral × Price / MIN_CR`. Ensures all minted sUSD is overcollateralized. No individual CDP amounts disclosed.

An authorized prover submits proofs periodically. Anyone can query verification status on-chain.

## AI Agent — Chat-Driven DeFi

ZapScura's primary interface is an AI-powered chat agent. No buttons, no forms — just tell it what you want.

```
User: "Stake 0.1 BTC privately and earn yield"
AI:   → deposit(0.1) → shield(0.1) → confirms with ZK proofs
```

**Capabilities:**
- Explain ZK proofs and circuits in plain language
- Analyze positions and CDP health
- Execute all 13 actions with full proof pipeline
- Provide privacy score assessment
- Award XP and track gaming progress

**Security:**
- API key server-side only (Vercel serverless proxy)
- XSS-escaped output
- User confirmation required for every action
- Same proof pipeline as direct contract calls

## Starkzap Integration — Zero-Friction Onboarding

ZapScura leverages the **Starkzap SDK** to eliminate every onboarding barrier:

| Module | What It Does |
|--------|-------------|
| **Wallets** | Social login via Privy + Cartridge Controller — Google, Apple, email. No seed phrase. |
| **Paymaster** | Gasless transactions via AVNU / Cartridge. Users never need STRK for gas. |
| **DeFi** | Access to staking, token operations, balance checking |

**Onboarding flow:** Sign in with Google → Chat with AI → DeFi happens. That's it.

## Gamification — Privacy as a Game

ZapScura turns private DeFi into a progression system. Every action you take earns XP, unlocks achievements, and levels up your agent profile. This isn't cosmetic — it drives user engagement and educates users about privacy through play.

### XP Rewards by Action

Every DeFi action awards XP. Actions that generate ZK proofs award more XP because they contribute to privacy:

| Action | XP Reward | ZK Proof? |
|--------|-----------|-----------|
| Faucet mint | 10 XP | No |
| Deposit | 25 XP | No |
| **Shield balance** | **50 XP** | Yes |
| Unshield | 30 XP | Yes |
| Withdraw | 15 XP | No |
| Open CDP | 40 XP | No |
| **Lock collateral** | **50 XP** | Yes |
| **Mint sUSD** | **40 XP** | Yes |
| Repay debt | 30 XP | Yes |
| Close CDP | 25 XP | Yes |
| **Submit solvency proof** | **60 XP** | Yes |
| Check balances | 5 XP | No |
| Check solvency | 10 XP | No |

### Streak System

Daily activity tracking with compounding rewards:

- **Streak multiplier:** +10% bonus XP per consecutive day (caps at +50%)
- Example: 5-day streak → every action gives 1.5× XP
- Streak resets if you miss a day
- Tracks current streak and longest streak

### 8-Level Progression System

As you accumulate XP, you rank up through 8 themed levels:

| Level | Title | XP Required | Rank Color |
|-------|-------|-------------|------------|
| 1 | Shadow Initiate | 0 XP | Gray |
| 2 | Cipher Apprentice | 100 XP | Blue |
| 3 | Proof Runner | 300 XP | Purple |
| 4 | Shield Bearer | 600 XP | Cyan |
| 5 | Vault Guardian | 1,000 XP | Green |
| 6 | Privacy Phantom | 1,500 XP | Amber |
| 7 | ZK Master | 2,100 XP | Red |
| 8 | Shadow Sovereign | 2,800 XP | Cyan Glow |

Each level unlocks a new visual rank badge and glow effect on the player card.

### 12 Achievements

Achievements are one-time unlocks that award bonus XP and recognize milestones:

| Achievement | Condition | Bonus XP |
|-------------|-----------|----------|
| First Steps | Complete your first action | 20 XP |
| Shield Up | Shield a balance for the first time | 30 XP |
| Proof Generator | Generate 5 ZK proofs | 50 XP |
| ZK Veteran | Generate 20 ZK proofs | 100 XP |
| CDP Operator | Open your first CDP | 40 XP |
| Privacy Pro | Reach 80% privacy score | 75 XP |
| Full Stealth | Reach 100% privacy score | 150 XP |
| Guardian Status | Reach Level 5 (Vault Guardian) | 100 XP |
| On a Roll | Maintain a 3-day streak | 50 XP |
| Dedicated Agent | Maintain a 7-day streak | 100 XP |
| Power User | Complete 25 total actions | 75 XP |
| Faucet Farmer | Use the faucet 5 times | 20 XP |

### 6 Quests (Guided Missions)

Quests guide new users through the protocol with structured objectives and difficulty tiers:

| Quest | Difficulty | Objective | XP Reward |
|-------|-----------|-----------|-----------|
| Gear Up | Starter | Mint tokens from faucet | 15 XP |
| Into the Vault | Starter | Deposit tokens into vault | 30 XP |
| Go Dark | Intermediate | Shield your balance | 60 XP |
| Leverage Up | Intermediate | Open a CDP | 80 XP |
| Shadow Protocol | Advanced | Reach 80% privacy score | 100 XP |
| Trust Verifier | Advanced | Submit a solvency proof | 75 XP |

### Privacy Score

Your privacy score measures how much of your portfolio is shielded:

```
Privacy Score = (shieldedBalance / totalBalance) × 100%
```

| Score | Rating | Color |
|-------|--------|-------|
| 80%+ | High privacy | Green |
| 50–79% | Moderate | Amber |
| <50% | Low privacy | Red |

Privacy score directly affects achievement unlocks (Privacy Pro at 80%, Full Stealth at 100%) and is visible on the player card.

### Player Stats Tracked

```
totalXP, totalActions, proofsGenerated
maxPrivacyScore, currentStreak, longestStreak
lastActiveDate (for streak calculation)
unlockedAchievements[], completedQuests[]
actionCounts{} (per-action tallies)
xpHistory[{date, xp}] (last 30 days, for XP chart)
```

**Persistence:** localStorage for instant local access + optional Supabase sync for cloud persistence and cross-device leaderboard.

## What's Visible vs Hidden On-Chain

| Data | On-Chain Visibility |
|------|-------------------|
| Wallet address | Visible |
| Transaction type (deposit, shield, etc.) | Visible |
| Pedersen commitments | Visible (but hides value) |
| ElGamal ciphertexts | Visible (but encrypted) |
| Nullifiers | Visible (prevents replay) |
| ZK proof bytes | Visible (reveals nothing) |
| **Actual balances** | **Hidden** |
| **Collateral amounts** | **Hidden** |
| **Debt amounts** | **Hidden** |
| **Privacy score** | **Hidden (client-only)** |
| **XP / Level / Achievements** | **Hidden (client-only)** |

## Smart Contracts — Deployed on Starknet Sepolia

| Contract | Purpose |
|----------|---------|
| **ShieldedVault** | Deposit/withdraw xyBTC, shield/unshield with ZK proofs |
| **ShieldedCDP** | Open/close CDPs, lock collateral, mint sUSD, repay debt |
| **ProofVerifier** | Verifies all 7 ZK proof types via Garaga verifier contracts |
| **SolvencyProver** | Public vault + CDP solvency verification |
| **xyBTC Token** | ERC20 test token with faucet |
| **PriceFeed** | Oracle for collateral ratio calculations |

On-chain verification uses a universal **UltraKeccakZKHonk** Garaga verifier. All 7 circuits share the same verifier, differentiated by circuit-specific verification keys.

## Security Invariants

These properties are enforced by the proof system and must always hold:

- **No balance underflow** — Balance sufficiency proof prevents spending more than you have
- **Proof-before-state** — Every state change requires a valid ZK proof verified on-chain
- **Collateral ratio ≥ 200%** — Collateral ratio proof enforces minimum collateralization
- **Zero-debt closure** — CDPs can only close after proving debt is exactly zero
- **No proof replay** — Nullifiers prevent reusing a proof for multiple operations
- **Domain separation** — Each proof type has a unique verifier key; proofs cannot cross circuits
- **Oracle freshness** — Stale price data automatically pauses minting
- **Per-domain solvency** — Vault and CDP solvency are proven independently

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Wallet | Starkzap SDK (Social Login + Paymaster) |
| AI | DeepSeek API (via Vercel serverless proxy) |
| ZK Proofs | Noir 1.0.0-beta.16 + bb.js (UltraKeccakZKHonk, in-browser) |
| On-chain Verification | Garaga verifier contracts (7 circuits) |
| Privacy | ElGamal encryption (Baby JubJub) + Pedersen commitments |
| Contracts | Cairo (Starknet) — deployed on Sepolia |
| Gamification | Custom XP engine + Supabase leaderboard |
| Hosting | Vercel |

## Getting Started

```bash
git clone https://github.com/SAHU-01/ZapScura.git
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

## Starkzap Modules Used

| Module | Integration | Details |
|--------|------------|---------|
| **Wallets** | `StarkZap.connectCartridge()` | Social login (Google/Apple/email) via Cartridge Controller + session keys |
| **Paymaster** | `feeMode: 'sponsored'` | Gasless transactions via AVNU Paymaster |
| **DeFi** | Token operations | Staking, balance checking, token transfers |

## Links

- **Demo Video:** [YouTube](https://youtu.be/g1nG6X3eXis)
- **GitHub:** [github.com/SAHU-01/ZapScura](https://github.com/SAHU-01/ZapScura)
- **Live App:** [zap-scura.vercel.app](https://zap-scura.vercel.app)

## Built For

Starkzap Developer Challenge — $1,500 best build / $500 most creative

---

That's private DeFi — with XP.

## License

MIT

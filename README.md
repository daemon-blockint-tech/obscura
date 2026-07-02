# Obscura — Privacy-Preserving Swap & Transfer on Solana

A full-stack privacy dApp for Solana featuring confidential token transfers (Token-2022), shielded pool operations with ZK proofs, and private swaps via Jupiter — all routed through Helius infrastructure.

## Features

- **Confidential Transfers** — Token-2022 confidential transfer extension with ElGamal encryption + ZK proofs
- **Shielded Pool** — Merkle tree commitments, nullifier sets, unlinkable deposits/withdrawals/transfers
- **Private Swaps** — Jupiter-powered swaps with confidential deposit/withdraw wrapping
- **Helius Infrastructure** — RPC, Sender (multi-path tx submission), Priority Fee API, DAS API, ZK Compression, Webhooks
- **ZK Compression** — Light Protocol integration for compressed state proofs

## Architecture

### On-Chain Program (Anchor/Rust)
- `programs/obscura/` — Anchor program with shielded pool state, deposit/withdraw/transfer/private_swap instructions
- Merkle tree helpers for commitment verification
- ZK proof verification stubs (production: `@solana-program/zk-elgamal-proof`)

### Frontend (Next.js/React/TypeScript)
- `web/` — Next.js 14 App Router with Tailwind CSS
- `web/src/lib/solana/` — RPC client, confidential transfer helpers, ZK proof generation, key management
- `web/src/lib/helius/` — Sender, Priority Fee, ZK Compression, DAS API, Webhooks
- `web/src/lib/shielded/` — Pool operations, commitment generation, Merkle tree proofs
- `web/src/lib/swap/` — Jupiter swap integration
- `web/src/components/` — Wallet, Transfer, Swap UI components
- `web/src/providers/` — Solana wallet adapter providers

## Project Structure

```
obscura/
├── programs/                          # Anchor on-chain program
│   ├── Cargo.toml                     # Workspace manifest
│   ├── Anchor.toml                    # Anchor config
│   ├── obscura/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                 # Program entry + instructions
│   │       ├── state/                 # ShieldedPool, Commitment, Nullifier
│   │       ├── instructions/          # Deposit, Withdraw, Transfer, PrivateSwap
│   │       └── utils/                 # Merkle tree, ZK proof helpers
│   └── tests/
│       └── obscura.ts                 # Integration tests
├── web/                               # Next.js frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/                       # App Router pages
│       │   ├── layout.tsx             # Root layout + providers
│       │   ├── page.tsx               # Home
│       │   ├── transfer/page.tsx      # Private transfer
│       │   └── swap/page.tsx          # Private swap
│       ├── lib/
│       │   ├── solana/                # RPC, confidential, proofs, keys
│       │   ├── helius/                # Sender, priority-fee, zk-compression, das, webhooks
│       │   ├── shielded/              # Pool, commitments, merkle
│       │   ├── swap/                  # Jupiter integration
│       │   └── utils/                 # Formatting helpers
│       ├── components/
│       │   ├── wallet/                # WalletProvider + button
│       │   ├── transfer/              # Deposit, Withdraw, Transfer forms + balance
│       │   └── swap/                  # SwapInterface
│       └── providers/
│           └── SolanaProvider.tsx     # Wallet adapter setup
├── app/                               # Android Kotlin client (legacy)
├── package.json                       # Root workspace
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+ and Yarn
- Rust + Cargo
- Anchor CLI 0.30.1+
- Solana CLI 1.18+

### Configuration

1. Copy `web/.env.example` to `web/.env.local` and fill in your keys:

```bash
HELIUS_API_KEY=your-helius-key
JUPITER_API_KEY=your-jupiter-key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_OBSCURA_PROGRAM_ID=your-program-id
```

2. Set up Helius CLI (for program deployment):

```bash
npm install -g helius-cli
helius keygen
helius signup
```

### Build & Run

#### On-Chain Program

```bash
cd programs
anchor build                    # Build the program
anchor test                     # Run integration tests on localnet
anchor deploy                   # Deploy to devnet
```

#### Frontend

```bash
# Install dependencies
yarn install

# Run development server
yarn dev:web

# Build for production
yarn build:web
```

The frontend will be available at `http://localhost:3000`.

## Key Flows

### Shielded Deposit
1. User generates nullifier secret + randomness (client-side)
2. Commitment = hash(nullifier_secret, amount, randomness)
3. SPL tokens transferred from depositor to pool vault
4. Commitment added to Merkle tree (emitted as event)
5. Nullifier secret stored locally for future withdrawal

### Shielded Withdraw
1. Check Helius ZK Compression indexer health
2. Fetch Merkle proof via `getCompressedAccountProof`
3. Generate ZK proof proving knowledge of commitment
4. Submit withdraw tx with nullifier (marked as spent)
5. Tokens transferred from pool vault to fresh recipient address

### Shielded Transfer (Internal)
1. Generate ZK proof for old commitment + new recipient commitment
2. Old nullifier marked as spent
3. New commitment added to Merkle tree
4. No token movement — purely commitment update

### Private Swap
1. Get Jupiter quote for input → output token pair
2. Get serialized swap transaction from Jupiter API
3. Estimate priority fee via Helius Priority Fee API
4. Sign transaction with wallet
5. Submit via Helius Sender for fast execution
6. (Production: wrap with confidential deposit/withdraw)

## Helius Integration

| Service | Endpoint | Usage |
|---------|----------|-------|
| RPC | `https://{network}.helius-rpc.com/?api-key=KEY` | All Solana RPC calls |
| Sender | `https://sender.helius-rpc.com/fast` | Multi-path tx submission |
| Priority Fee | `getPriorityFeeEstimate` RPC method | Dynamic fee estimation |
| DAS API | `getAssetsByOwner` RPC method | Token list for swap UI |
| ZK Compression | `getCompressedAccountProof`, `getValidityProof` | Shielded pool proofs |
| Webhooks | `https://api.helius.xyz/v0/webhooks` | Monitor pool events |

## Security Considerations

- **ZK Proofs**: Production requires Poseidon hash (not keccak256) for ZK circuit compatibility
- **Proof Verification**: On-chain verification via `@solana-program/zk-elgamal-proof`
- **Nullifier Set**: Prevents double-spends in shielded pool
- **Relayer**: Optional gas abstraction service for enhanced privacy
- **Auditor Key**: Support for compliance/viewing keys for authorized auditors

## Dependencies

### On-Chain
- `anchor-lang` 0.30.1
- `anchor-spl` 0.30.1
- `spl-token-2022` 3.0.2
- `solana-program` 1.18

### Frontend
- Next.js 14.2.3
- React 18.3.1
- `@solana/web3.js` 1.91.0
- `@solana/wallet-adapter-react` 0.15.35
- `@coral-xyz/anchor` 0.30.1
- `@jup-ag/api` 0.7.0
- Tailwind CSS 3.4.3
- Lucide React 0.378.0

## Implementation Phases

- **Phase 1** ✅ — Foundation: Anchor program, Next.js scaffold, Helius RPC/Sender/PriorityFee, confidential transfer flows, wallet connection, basic UI
- **Phase 2** ✅ — Shielded Pool: Merkle tree commitments, nullifier set, ZK Compression API, deposit/withdraw/transfer, webhooks
- **Phase 3** ✅ — Private Swaps: Jupiter integration, swap UI, DAS API token selection, Helius Sender submission
- **Phase 4** — Polish & Security: Integration tests, security audit prep, auditor key support, relayer service, mainnet deployment

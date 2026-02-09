# 🎯 BountyBoard — On-Chain Bug Bounty Platform

> Decentralized bug bounty board. Post bounties with ETH rewards, submit security findings, get paid — all trustlessly via smart contracts.

## Features

- **Post Bounties** — deposit ETH as escrow reward, set deadline, describe the task
- **Submit Findings** — security researchers submit work with full details
- **Approve & Pay** — creator approves, ETH instantly sent to hunter (minus platform fee)
- **Reject & Reopen** — creator can reject bad submissions and reopen for new ones
- **Cancel & Refund** — creator can cancel open bounties and get full ETH refund
- **Deadline Enforcement** — submissions only accepted before expiry
- **Platform Fees** — configurable bps fee on approved payouts
- **Fee Withdrawal** — owner can collect accumulated platform fees

## Tech Stack

### Smart Contracts
- **Solidity 0.8.20** + Foundry
- 21/21 tests passing
- 100% line + branch + function coverage
- Slither clean

### Frontend
- **Next.js 16** + TypeScript + Tailwind CSS v4
- **wagmi v3** + **viem v2** + **ConnectKit** for wallet connection
- 5 interactive tabs: Browse, Create, Submit, Manage, Stats
- Dark theme UI with status-colored bounty cards
- Real-time contract reads, transaction confirmations

## Quick Start

### Contracts

```bash
cd contracts
forge install
forge build
forge test
```

### Deploy

```bash
cd contracts
PRIVATE_KEY=0x... forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Update `src/config/contract.ts` with your deployed contract address.

## Architecture

```
bounty-board/
├── contracts/          # Foundry project
│   ├── src/
│   │   └── BountyBoard.sol
│   ├── test/
│   │   └── BountyBoard.t.sol
│   └── script/
│       └── Deploy.s.sol
├── frontend/           # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   └── bounty/
│   │   │       └── page.tsx      # Dashboard (5 tabs)
│   │   └── config/
│   │       ├── contract.ts       # ABI + address
│   │       └── wagmi.ts          # Chain config
│   └── package.json
└── README.md
```

## Contract API

| Function | Description | Access |
|----------|-------------|--------|
| `create(deadline, desc)` | Post bounty with ETH | Anyone (payable) |
| `submit(id, work)` | Submit finding for bounty | Anyone except creator |
| `approve(id)` | Approve & pay hunter | Creator only |
| `reject(id)` | Reject & reopen bounty | Creator only |
| `cancel(id)` | Cancel & refund ETH | Creator only |
| `withdrawFees()` | Collect platform fees | Owner only |
| `getBounty(id)` | View bounty details | Public (view) |
| `bountyCount()` | Total bounties posted | Public (view) |

## Bounty Lifecycle

```
                ┌─────────────┐
                │   Created   │ ← creator deposits ETH
                │   (Open)    │
                └──────┬──────┘
                       │ hunter submits
                       ▼
                ┌─────────────┐
                │  Submitted  │ ← awaiting review
                └──────┬──────┘
               ┌───────┴───────┐
               │               │
         approve()         reject()
               │               │
               ▼               ▼
        ┌─────────────┐ ┌─────────────┐
        │  Approved   │ │   (Open)    │ ← reopened
        │  💰 Paid    │ │   again     │
        └─────────────┘ └─────────────┘

        cancel() → Cancelled + ETH refunded to creator
```

## Grant Potential

This project targets:
- **Ethereum Foundation ESP** — public goods for security infrastructure
- **Optimism RetroPGF** — on-chain security tooling for the OP ecosystem
- **Scroll Security Subsidy** — decentralized audit/bounty infrastructure

## License

MIT

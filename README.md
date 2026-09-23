# PromoVault — AI Marketing Copy with On-Chain Proof of Originality

PromoVault lets small businesses generate platform-ready marketing copy in seconds and anchor every campaign on BOT Chain, creating a verifiable, timestamped proof they created the content first.

## How It Works

1. **Connect your wallet** — MetaMask on BOT Chain
2. **Type a prompt** — e.g., "Write an Instagram caption for a 20% off weekend coffee sale"
3. **Pick a platform** — Instagram, Twitter/X, Flyer, Google Business
4. **Generate** — AI creates tailored marketing copy
5. **Anchor on BOT Chain** — SHA-256 hash of the content is stored on-chain
6. **Verify anytime** — Paste any text to check if it was registered first

## Why Blockchain?

Without the on-chain hash, this is just another ChatGPT wrapper. With it, businesses hold cryptographic proof of when they created their marketing content — useful for IP disputes, brand audits, and franchise compliance.

## Architecture

```
Frontend (React + Tailwind)  →  Backend (Node.js + LLM API)
        ↕                              ↓
  MetaMask / ethers.js          Returns text + SHA-256 hash
        ↕
  PromoVault.sol on BOT Chain
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, ethers.js v6
- **Backend**: Node.js, Express, Google Gemini / OpenAI
- **Smart Contract**: Solidity 0.8.20, deployed via Remix IDE
- **Chain**: BOT Chain (EVM-compatible)

## Deployment

### Smart Contract Addresses

| Network | Chain ID | Contract Address |
|---|---|---|
| BOT Chain Testnet | 968 | `0xdc8B6e56E92C4a5ff327F9d21425b76bdb8Bb800` |
| BOT Chain Mainnet | 677 | `<PASTE MAINNET ADDRESS AFTER DEPLOY>` |

### Running Locally

**Backend:**
```bash
cd server
cp .env.example .env
# Add your LLM API key to .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Smart Contract

The `PromoVault.sol` contract provides:

- `registerCampaign(contentHash, category, platform)` — Store a content hash on-chain
- `verifyCampaign(contentHash)` — Check if content was registered and by whom
- `getCampaign(id)` — Get full campaign details
- `getMyCampaignIds()` — List all campaigns for the connected wallet

## Links

- **Live Site**: TBD
- **Block Explorer**: [scan.botchain.ai](https://scan.botchain.ai)
- **BOT Chain**: [botchain.ai](https://botchain.ai)

## License
--deploy--

MIT

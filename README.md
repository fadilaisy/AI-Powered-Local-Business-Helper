# PromoVault — AI marketing copy with a public on-chain hash timestamp

PromoVault helps small businesses generate platform-ready marketing copy and optionally anchor its SHA-256 hash on BOT Chain.

The blockchain record proves that a hash was first submitted by an address at a recorded time. It does not prove authorship, business identity, or that AI generated the text. Verify the exact bytes you intended to anchor; any change creates a different hash.

## How it works

1. Generate copy with a prompt, target platform, and business category.
2. Review whether the result came from the configured LLM or the explicit template fallback.
3. Connect a wallet only when anchoring; verification uses a public RPC and does not require a wallet.
4. Anchor the exact generated text hash to the configured BOT Chain contract.
5. Verify exact text or paste a 32-byte hash later.

## Architecture

```
React/Vite frontend -> Express or Vercel /api/generate -> configured LLM or template fallback
       |                                      |
       |                                      +-- canonical SHA-256 hash
       +-- MetaMask/ethers -> PromoVault.sol on BOT Chain
```

## Local development

Backend:

```bash
cd server
cp .env.example .env
# Add GEMINI_API_KEY or OPENAI_API_KEY
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:3001`; do not set `VITE_API_URL` for the normal local setup.

## Environment variables

Backend variables are documented in `server/.env.example`:

- `LLM_PROVIDER`: `gemini` or `openai`
- `GEMINI_API_KEY` / `OPENAI_API_KEY`: provider credentials
- `GEMINI_MODEL` / `OPENAI_MODEL`: optional model overrides
- `ALLOWED_ORIGINS`: comma-separated production origins; omit locally
- `PORT`: local server port, default `3001`

Frontend variables:

- `VITE_API_URL`: optional absolute API URL for a separately hosted backend
- `VITE_BOT_NETWORK`: `TESTNET` (default) or `MAINNET`
- `VITE_MAINNET_CONTRACT_ADDRESS`: required when selecting mainnet

## Contract addresses

| Network | Chain ID | Contract Address | Explorer |
|---|---:|---|---|
| BOT Chain Mainnet | 677 | [`0xe25bD38d596c79Fb168d5Fd95CdEdB7af9C6adDF`](https://scan.botchain.ai/address/0xe25bD38d596c79Fb168d5Fd95CdEdB7af9C6adDF) | [scan.botchain.ai](https://scan.botchain.ai/) |
| BOT Chain Testnet | 968 | [`0xdc8B6e56E92C4a5ff327F9d21425b76bdb8Bb800`](https://scan.bohr.life/address/0xdc8B6e56E92C4a5ff327F9d21425b76bdb8Bb800) | [scan.bohr.life](https://scan.bohr.life/) |

The application supports both networks seamlessly with an in-app network switcher in the header. The default active network is **BOT Chain Mainnet**.

## Validation

```bash
npm test
npm run build
```

The root build uses the frontend lockfile. Vercel serves the built SPA and the `api/` serverless functions from the repository root.

## Legal and data notices

Generated briefs are sent to the configured third-party LLM provider when AI generation is available. Template fallback mode does not send the brief to an LLM. On-chain records contain hashes and campaign metadata, not the source copy. Review the provider's data policy and applicable advertising, intellectual-property, privacy, and consumer-protection rules before commercial use.

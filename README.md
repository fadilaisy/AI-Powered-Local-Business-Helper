# PromoVault — AI marketing copy with a public on-chain hash timestamp

PromoVault helps small businesses generate platform-ready marketing copy and optionally anchor its SHA-256 hash on BOT Chain.

The blockchain record proves that a hash was first submitted by an address at a recorded time. It does not prove authorship, business identity, or that AI generated the text. Verify the exact bytes you intended to anchor; any change creates a different hash.

## How it works

1. Generate copy with a prompt, target platform, and business category.
2. Review whether the result came from the configured LLM or the explicit template fallback.
3. Connect a wallet only when anchoring; verification uses a public RPC and does not require a wallet.
4. Anchor the exact generated text hash to the configured BOT Chain contract.
5. Verify exact text or paste a 32-byte hash later.

Every generated round is also saved to a per-device history in the browser
(`promovault.history`, newest first, capped at 50) so past copy and its
fingerprint stay reachable without regenerating. History is local to the
browser: clearing site data removes it, and it is never uploaded.

## Platforms and category fallback

`server/platforms.js` is the single source of truth for the target platform and
business category vocabularies. It owns prompt rules, template fallback, and
validation, so those three can no longer drift apart.

- Omitting `platform` is valid and normalizes to a `general` target.
- A `general` category is routed deterministically across the routable
  categories (a brief always lands on the same one, so its hash is stable).
- X/Twitter is deliberately excluded from the cross-category fallback: the
  280-character ceiling is too tight to carry a category body, so it uses its
  own single-line template instead.
- Each platform has a hard character ceiling that fallback copy is clamped to.

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

The Vite development server proxies `/api` to `http://localhost:3001`; do not set `VITE_API_URL` for the normal local setup. `npm run dev` forces `NODE_ENV=development` before Vite starts, so a shell that already exports `NODE_ENV=production` cannot silently redirect the dev server at the deployed API instead of your local backend.

## Theming

Colors are defined once as CSS variables in `frontend/src/index.css` and exposed
to Tailwind as semantic tokens (`surface`, `ink`, `muted`, `line`, `brand`,
`accent`, `success`, `danger`, ...). Components use those tokens rather than
hex literals, so light/dark switching is a single variable swap and no element
can be left with a hardcoded, unreadable color. When adding a color, add a
token for both themes and keep text/background pairs at WCAG AA contrast.

## Environment variables

Backend variables are documented in `server/.env.example`:

- `LLM_PROVIDER`: `gemini` or `openai`
- `GEMINI_API_KEY` / `OPENAI_API_KEY`: provider credentials
- `GEMINI_MODEL` / `OPENAI_MODEL`: optional model overrides (defaults: `gemini-3.6-flash`, `gpt-4o-mini`)
- `ALLOWED_ORIGINS`: comma-separated production origins; omit locally
- `PORT`: local server port, default `3001`

`server/.env` is loaded relative to the `server/` directory, so it is picked up
whether you run `npm start` from the repository root or `npm run dev` from
inside `server/`. Real environment variables (Vercel, CI, Docker) take
precedence over the file.

## Provider limits and fallback

`GET /api/health` reports `status: "ok"` only when a provider key is configured;
otherwise it is `degraded` with HTTP 503. Check that endpoint before
concluding the app is broken.

A generation response carries `source`, `degraded`, and `degradedReason`:

| `degradedReason` | Meaning |
|---|---|
| `provider_not_configured` | No API key set. |
| `quota_exceeded` | The key's request quota is spent (the Gemini free tier is capped per day). |
| `rate_limited` | Provider is throttling requests right now. |
| `provider_unavailable` | Provider returned 5xx or reported overload. |
| `invalid_credentials` / `invalid_model` | Key or model rejected. |
| `timeout` | Provider did not respond within 12s. |

Transient failures (5xx, overload, network) are retried once before falling
back. Quota, credential, model, and timeout errors are not retried, because they
cannot succeed within a request. Whenever the provider is unavailable the API
still returns `200` with deterministic template copy, so the product keeps
working; the UI states which reason applied.

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

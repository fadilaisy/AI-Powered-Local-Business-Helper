# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small-business owners and local marketing operators who need platform-ready promotional copy and a durable way to demonstrate when a specific campaign was first submitted to PromoVault.

## Product Purpose

PromoVault turns a plain-language campaign brief into marketing copy for a selected platform and business category. It calculates a canonical SHA-256 hash of the exact generated text and can optionally anchor that hash, with campaign metadata, to PromoVault's public BOT Chain contract. Success means a business can review, copy, anchor, list, and independently verify a campaign without needing blockchain expertise for verification.

## Positioning

PromoVault combines fast AI-assisted local-business copywriting with an optional public timestamp for the exact text bytes. The product is honest about what the record proves: a hash was first submitted by an address at a recorded time; it does not prove authorship, business identity, or that AI generated the text.

## Operating Context

The primary workflow contains three connected surfaces: Generate, My Vault, and Verify Authenticity. A user enters a campaign brief, chooses a target platform and business category, reviews generated copy, and optionally connects an EVM wallet to anchor the exact content hash. The My Vault surface reads anchored campaigns for the connected address. The Verify surface accepts exact campaign text or a 32-byte hash and reads the configured public chain without requiring a wallet.

## Capabilities and Constraints

- Generate copy through a configured LLM provider with an explicit template fallback when AI generation is unavailable.
- Support Instagram, X / Twitter, Print Flyer, and Google Business as target platforms.
- Support the existing business-category choices and campaign preset prompts.
- Calculate and display a canonical SHA-256 fingerprint of the exact generated text.
- Persist the most recent generated campaign locally in the browser.
- Connect, switch, and validate an EVM wallet against the configured BOT Chain network and contract.
- Anchor a hash and campaign metadata only when the wallet is connected and the exact hash is not already registered.
- List campaigns owned by the connected address.
- Verify exact text or a valid 32-byte hash through a public read contract without a wallet.
- Default to BOT Chain testnet; testnet records must not be presented as production evidence.
- Preserve legal, privacy, AI-provider, intellectual-property, advertising, and consumer-protection disclosures.
- Do not invent customer counts, revenue, performance benchmarks, or testimonial evidence.

## Brand Commitments

Product name: PromoVault. Core language centers on marketing copy, exact-text fingerprints, public records, and ownership of the creative record. Visual direction is user-pinned to https://doany.ai/ as a reference for the full frontend redesign, translated to PromoVault's product truth rather than copied as a brand.

## Evidence on Hand

The repository contains the production React/Vite interface, generation API, BOT Chain contract integration, README product/legal notes, and configured testnet contract address. There is no verified customer evidence, testimonials, case studies, or performance benchmark set available in the repository.

## Product Principles

- Make the exact-text boundary explicit whenever a record is created or verified.
- Keep generation approachable for non-technical local-business owners.
- Treat wallet connection as an optional action reserved for anchoring and vault reading.
- Keep verification public and jargon-light.
- Show honest fallback, loading, error, empty, and network states.

## Accessibility & Inclusion

The interface must support keyboard operation, visible focus states, readable contrast, understandable labels, reduced-motion preferences, and responsive use on desktop and mobile web. Blockchain terminology must be explained in plain language.

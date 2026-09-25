---
version: 1
slug: "frontend-src-app-jsx"
primary_target: "frontend/src/App.jsx"
related_targets: []
---

# PromoVault Frontend

## Scope and mode
Operate-mode redesign of the existing single-page React/Vite frontend. Preserve Generate, My Vault, and Verify Authenticity, plus generation, wallet connection, anchoring, campaign listing, and public verification behavior.

## Product truth
PromoVault helps small businesses create platform-ready campaign copy, calculate a canonical SHA-256 hash of the exact text, and optionally anchor that hash to BOT Chain. A public record proves first submission by an address at a time; it does not prove authorship, identity, or AI generation.

## Direction contract

### Thesis
The app is an editorial campaign desk, not a crypto dashboard. Its shell borrows doany.ai's confidence—oversized type, black structural lines, warm white field, pill navigation, outlined controls—while every interaction remains grounded in the simple local-business job and honest proof mechanism.

### Own-world
Warm white canvas with a fine black-dot field; black ink; cobalt as the generation/action color; yellow for campaign energy and selected states; coral for warnings and anchoring; green only for confirmed records. Figtree-style rounded grotesk for display and UI, tabular mono only for hashes. Components use 2px black outlines, restrained corner radii, short pill labels, and tactile press states without decorative glass.

### Story
The visitor describes a promotion in plain language, chooses where it will run, reviews usable copy, and sees the exact-text fingerprint as a concrete artifact. Anchoring is visibly optional and explained; verification remains public and wallet-free.

### First viewport
A slim black-outlined header contains the PromoVault mark, the three product tabs, and wallet state. The hero is a two-column operating composition: oversized claim and plain-language explanation on the left, a live campaign brief composer on the right. The generation CTA is visible without scrolling. Below, a proof rail explains brief → copy → fingerprint → public record without abstract metrics.

### Form
Code-led, assigned direction 7 of the grounded catalog. The user-pinned doany.ai reference overrides the catalog assignment and controls world selection. Seed key: 8cfa3929.

### Signature interaction
Submitting a brief compresses the composer into a cobalt loading state, then reveals a campaign result sheet with a spring rise, animated hash-stamp accent, and a clear optional anchor action. The rest of the interface uses the same lift-and-settle motion, not unrelated effects.

### Cross-surface reach
Generate, My Vault, and Verify Authenticity share the same canvas, typography, controls, state colors, focus treatment, and editorial composition. The system works for empty, connected, loading, error, success, and campaign-record states.

### Finish
unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

# build-website-inspired

## What This Is

A Claude Code (and cross-agent) skill that researches a **category** of premium websites, extracts design tokens from each, and merges them into a **single coherent theme** — exported as CSS variables, JSON, and a human-readable rationale doc.

v1.0 is intentionally narrow: **tokens only, no build**. The skill stops after writing three files. Users apply those tokens to their own app manually (or invoke a downstream build skill).

## Positioning

| Tool | What it does |
|---|---|
| `tweakcn.com` | Edit one theme visually in a UI |
| `JCodesMore/ai-website-cloner-template` (parent) | Pixel-perfect clone of one URL |
| **`/build-website-inspired` (this)** | Research a category → extract N sites → merge into ONE coherent theme |

## How to invoke

```
/build-website-inspired "<category-description-or-vibe>"
```

## Phases

0. **Category Research** — propose 5-8 reference URLs (`docs/research/REFERENCES.md`)
1. **Token Extraction** — Playwright MCP, scroll-hydrate, `getComputedStyle()` per site (`docs/research/<hostname>/tokens.json` + `screenshot.png`)
2. **Curated Merge + Output** — classify → anchor → rule-based overlay → validate → write 3 files, STOP:
   - `design/DESIGN_TOKENS.md` — human-readable doc with provenance per token
   - `design/theme.css` — ready-to-paste CSS custom properties (shadcn-compatible)
   - `design/theme.json` — machine-readable

## MOST IMPORTANT NOTES

- **This skill is repo-agnostic.** It does NOT require a Next.js scaffold, `package.json`, or `npm run build`.
- **The skill stops after Phase 2.** Do not build, scaffold, or dispatch builder agents after writing the three output files.
- **Playwright MCP is required.** Other browser MCPs may work but scroll-hydration is load-bearing for premium sites.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing `.claude/skills/build-website-inspired/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms.

## Credits

Token extraction technique adapted from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template).

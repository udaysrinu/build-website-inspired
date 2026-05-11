<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

# build-website-inspired

A skill that researches a **category** of premium websites, extracts design tokens from each, and merges them into a single coherent theme. v1.0 is tokens-only — no build.

## Phases

0. Category Research — propose 5-8 reference URLs (`docs/research/REFERENCES.md`)
1. Token Extraction — Playwright MCP, scroll-hydrate, `getComputedStyle()` per site
2. Curated Merge + Output — classify → anchor → rule-based overlay → validate → write 3 files, STOP

## MOST IMPORTANT NOTES

- Repo-agnostic. No Next.js, no package.json required.
- STOP after Phase 2. Do not build, scaffold, or dispatch builder agents.
- Playwright MCP required.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh`.
- After editing `.claude/skills/build-website-inspired/SKILL.md`, run `node scripts/sync-skills.mjs`.

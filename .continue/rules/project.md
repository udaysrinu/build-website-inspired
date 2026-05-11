---
description: Project conventions for build-website-inspired
alwaysApply: true
---

<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

# build-website-inspired

A skill that researches a **category** of premium websites, extracts design tokens, and merges them into a single theme. v1.0 is tokens-only — no build.

## Phases

0. Category Research — propose 5-8 reference URLs
1. Token Extraction — Playwright MCP, scroll-hydrate, `getComputedStyle()` per site
2. Curated Merge + Output — classify → anchor → rule-based overlay → validate → write 3 files, STOP

## STOP after Phase 2

Do not build, scaffold, install, or dispatch builder agents.

## Update process

- Edit `AGENTS.md`, run `bash scripts/sync-agent-rules.sh`
- Edit `.claude/skills/build-website-inspired/SKILL.md`, run `node scripts/sync-skills.mjs`

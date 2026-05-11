# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-11

Forked from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) and rewritten as a fundamentally different tool.

### Added

- `/build-website-inspired` skill — research a category of premium sites, extract design tokens, curate them into a single coherent theme
- Phase 0: LLM proposes 5-8 reference URLs from a category description; category hint cache for fintech/devtools/healthcare/SaaS/luxury/editorial/AI/design-agency verticals
- Phase 1: Playwright MCP navigation with scroll-hydration (80%-viewport steps, 300ms pauses) followed by `getComputedStyle()` walk extracting top-12 backgrounds/text-colors/radii/shadows/font-sizes/letter-spacings + canonical body/h1/h2/p styles
- Phase 2: curated merge (classify → anchor → rule-based overlay → validate) producing three output files — `design/DESIGN_TOKENS.md` (with provenance per token), `design/theme.css` (shadcn-compatible), `design/theme.json`
- Cross-agent compatibility: skill generated for Claude Code, Codex, GitHub Copilot, Cursor, Windsurf, Gemini, OpenCode, Augment, Continue, Amazon Q
- `sync-skills.mjs` rewritten for the new skill name and source path

### Changed

- Positioning: now a **tokens-only theme generator**, explicitly stops before any build or scaffolding
- README rewritten around category-research positioning with example Runway output
- `AGENTS.md` rewritten as the new tool's source-of-truth doc

### Removed

- Next.js scaffold (`src/`, `components.json`, `next.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `eslint.config.mjs`, `.nvmrc`)
- Docker scaffolding (`Dockerfile`, `Dockerfile.dev`, `docker-compose.yml`, `.dockerignore`)
- Next.js CI workflow (lint/typecheck/build — not applicable to a tokens-only skill)
- `public/` directory and its downloaded-asset subfolders
- `/clone-website` skill across all agent platforms (replaced by `/build-website-inspired`)
- `docs/research/INSPECTION_GUIDE.md` (replaced by Phase-1 scripts embedded in the skill)
- Pixel-perfect clone pipeline (parent project's Phases 2-5: foundation build, component spec dispatch, page assembly, visual QA diff)

### Notes on scope

v1.0 is intentionally narrow:
- Rule-based curated merge only — no LLM refinement pass. (Planned for v1.1)
- No interactive customization CLI — full theme emitted in a single run. (Planned for v2.0)
- No dark-mode extraction flag — sample whatever mode the site renders by default. (Planned for later)

### Credits

Token-extraction `getComputedStyle()` technique adapted from JCodesMore/ai-website-cloner-template. Thanks to JCodesMore for the elegant DOM-walk that makes hydrated-page extraction reliable.

[1.0.0]: https://github.com/udaysrinu/build-website-inspired/releases/tag/v1.0.0

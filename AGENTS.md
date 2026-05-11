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

Examples:
- `/build-website-inspired "premium fintech risk dashboard"`
- `/build-website-inspired "editorial luxury ecommerce"`
- `/build-website-inspired "calm healthcare portal"`
- `/build-website-inspired "use mercury.com, brex.com, runway.com"` (direct URLs)

## Phases

The skill has THREE phases, not five:

0. **Category Research** — propose 5-8 reference URLs (`docs/research/REFERENCES.md`)
1. **Token Extraction** — Playwright MCP, scroll-hydrate, `getComputedStyle()` per site (`docs/research/<hostname>/tokens.json` + `screenshot.png`)
2. **Curated Merge + Output** — classify → anchor → rule-based overlay → validate → write 3 files, STOP:
   - `design/DESIGN_TOKENS.md` — human-readable doc with provenance per token
   - `design/theme.css` — ready-to-paste CSS custom properties (shadcn-compatible)
   - `design/theme.json` — machine-readable

## Repo layout

```
.claude/skills/build-website-inspired/
  SKILL.md                              # Source of truth for the skill

.codex/skills/build-website-inspired/SKILL.md       # Auto-generated (sync-skills.mjs)
.github/skills/build-website-inspired/SKILL.md      # Auto-generated
.cursor/commands/build-website-inspired.md          # Auto-generated
.windsurf/workflows/build-website-inspired.md       # Auto-generated
.gemini/commands/build-website-inspired.toml        # Auto-generated
.opencode/commands/build-website-inspired.md        # Auto-generated
.augment/commands/build-website-inspired.md         # Auto-generated
.continue/commands/build-website-inspired.md        # Auto-generated
.amazonq/cli-agents/build-website-inspired.json     # Auto-generated

scripts/
  sync-skills.mjs                       # Regenerates all platform copies from .claude source
  sync-agent-rules.sh                   # Regenerates AGENTS.md-derived rules (copilot, cline, etc.)
```

## MOST IMPORTANT NOTES

- **This skill is repo-agnostic.** It does NOT require a Next.js scaffold, `package.json`, or `npm run build`. It writes tokens into whatever repo it's invoked in, under `design/` and `docs/research/`.
- **The skill stops after Phase 2.** Do not build, scaffold, or dispatch builder agents after writing the three output files. That is the #1 failure mode.
- **Playwright MCP is required.** Other browser MCPs may work but scroll-hydration is load-bearing for premium sites — test carefully if substituting.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing `.claude/skills/build-website-inspired/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms.

## Credits

Token extraction technique adapted from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template). This fork keeps Phase 1 of that pipeline and adds category research + merge, stopping before any build step.

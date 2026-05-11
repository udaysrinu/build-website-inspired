# build-website-inspired

<a href="https://github.com/udaysrinu/build-website-inspired/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>

> **Research premium sites in a category, extract their design tokens, and curate them into one coherent theme — ready to paste into any app.**

`/build-website-inspired` is a Claude Code skill (with cross-agent support) that takes a description like _"premium fintech risk dashboard"_ or _"calm healthcare portal"_, proposes 5-8 reference sites, extracts real `getComputedStyle()` tokens from each, and curates them into a shadcn-compatible theme you can paste into any app.

v1.0 is a **tokens-only generator**. It does not build an app. It does not scaffold components. It writes three files and stops: `design/DESIGN_TOKENS.md`, `design/theme.css`, `design/theme.json`.

## Why this exists

There is no systematic way to say _"build me a UI inspired by premium financial dashboards"_ and get back a coherent theme. The closest alternatives each miss something:

- [`tweakcn.com`](https://tweakcn.com) lets you edit one theme visually, but you bring the reference yourself.
- Pixel-perfect cloners ([JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template), what this project forked from) give you a near-verbatim copy of a single URL — great for migrations, wrong for "inspiration."
- Design-system generators that prompt an LLM cold-produce tokens without grounding — the output is plausible but generic and rarely looks premium.

This skill fills the gap between "clone one site" and "vibes-only prompt." It **curates** a reference set from a category description, extracts real computed tokens from each live site, and merges them with an opinionated (and boring, by design) algorithm so you get something that actually looks like the genre you asked for.

## How it differs

| Tool | What it does | You bring |
|---|---|---|
| **`tweakcn.com`** | Edit one theme visually | A starting theme |
| **`ai-website-cloner-template` (parent)** | Pixel-perfect clone of one URL | One specific URL |
| **`/build-website-inspired` (this)** | Research a category → extract N sites → merge into ONE theme | A category description |

Key differentiator: **curation, not copying.**

## Quick start

### 1. Install the skill

Clone this repo into a location your agent can read skills from, or copy the skill files into your existing repo:

```bash
git clone https://github.com/udaysrinu/build-website-inspired.git
# The skill lives at:
#   .claude/skills/build-website-inspired/SKILL.md   (Claude Code)
# Plus parallel copies for Codex, Cursor, Windsurf, Gemini,
# OpenCode, Augment, Continue, Amazon Q, GitHub Copilot.
```

If you're adding it to an existing repo, copy the agent folder(s) you care about into that repo:

```bash
cp -r .claude/skills/build-website-inspired /path/to/your-repo/.claude/skills/
```

### 2. Invoke

From inside your target repo, with Playwright MCP connected:

```
/build-website-inspired "premium fintech risk dashboard"
```

Or directly with URLs:

```
/build-website-inspired "use mercury.com, brex.com, runway.com"
```

### 3. Review outputs

The skill writes:

- `docs/research/REFERENCES.md` — the shortlist it picked and why
- `docs/research/<hostname>/tokens.json` — per-site extractions
- `docs/research/<hostname>/screenshot.png` — per-site screenshots
- `design/DESIGN_TOKENS.md` — human-readable merged theme with rationale
- `design/theme.css` — ready-to-paste CSS custom properties (shadcn-compatible)
- `design/theme.json` — machine-readable theme

### 4. Apply the theme

```bash
# In your app:
cp design/theme.css app/globals.css   # or merge into your existing globals
```

Tokens use shadcn variable names (`--background`, `--foreground`, `--accent`, `--primary`, etc.) so existing shadcn component libraries light up immediately.

## Example output

Here's what `design/DESIGN_TOKENS.md` looks like after running `/build-website-inspired "premium FP&A dashboard"` with Runway as the anchor:

```markdown
# Design Tokens — premium FP&A dashboard

Anchor: runway.com
Overlays: none
Generated: 2026-05-11

## Colors

| Token | Value | Source | Rationale |
|---|---|---|---|
| `--background` | `#F8F7F5` | runway.com (top bg, 1424 elements) | Warm cream — dominant body surface |
| `--foreground` | `#261B07` | runway.com (top text, 1499 elements) | Deep espresso — primary text |
| `--muted` | `#E3DFD5` | runway.com | Secondary neutral surface |
| `--accent` | `#F9A600` | runway.com | Saturated amber — only non-neutral; highest-visibility accent |
| `--card` | `#FFFFFF` | runway.com | Pure white card surface over cream background |

## Typography

| Token | Value |
|---|---|
| `--font-sans` | `"Interphases Pro Variable", "Inter", Arial, sans-serif` |
| `h1` | `72px / 584 weight / -1.44px tracking` |
| `h2` | `56px / 584 weight` |
| `body` | `16px / 20px line-height / -0.16px tracking` |

## Radii

| Token | Value | Notes |
|---|---|---|
| `--radius` | `8px` | Top radius (185 elements), rounded for consistency |
```

And `design/theme.css`:

```css
:root {
  --background: 40 27% 96%;         /* #F8F7F5 */
  --foreground: 33 79% 9%;          /* #261B07 */
  --card: 0 0% 100%;
  --muted: 45 22% 86%;              /* #E3DFD5 */
  --accent: 39 100% 49%;            /* #F9A600 */
  --primary: 39 100% 49%;
  --border: 33 68% 10% / 0.08;
  --radius: 0.5rem;
  --font-sans: "Interphases Pro Variable", "Inter", Arial, sans-serif;
  --shadow-sm: 0 4px 8px 0 rgb(38 27 7 / 0.06);
}
```

That's the whole theme — paste it into any shadcn-based app and every primitive instantly adopts the Runway-inspired character (warm cream backgrounds, deep espresso text, amber accent, 8px radii, Interphases-adjacent typography).

## How the merge works (v1.0)

v1.0 is a **curated merge** — rule-based, deterministic, with provenance per token:

1. Phase 0: LLM proposes 5-8 reference sites for the category, or uses URLs you provide directly.
2. Phase 1: Playwright MCP navigates each site, scroll-hydrates the full page (pauses every 80% viewport height for 300ms, then returns to top), and runs a `getComputedStyle()` walk to tally top 12 backgrounds, text colors, radii, shadows, fonts, weights, letter-spacings, plus canonical `body`/`h1`/`h2`/`p` styles.
3. Phase 2: classify each site by archetype → pick the **anchor** whose archetype best matches the category → overlay specific tokens from other sites using deterministic rules (accent = highest saturation clearing AA; H1 = largest size × tightest tracking; shadow = most-layered; radius = tightest scale; fonts auto-substituted if licensed) → reject any overlay that clashes with the anchor's character → validate WCAG AA + radius consistency + ≤3 accents → write the three output files with one-sentence provenance per token and **stop**.

## Prerequisites

- **Playwright MCP** connected to your agent (Chrome MCP and others may work but the scroll-hydration pause is load-bearing for premium sites, and Playwright exposes it most reliably)
- An AI coding agent that reads one of the supported skill formats (see [Supported Platforms](#supported-platforms))

## Supported Platforms

Skill is regenerated for every platform from a single source (`.claude/skills/build-website-inspired/SKILL.md`) via `node scripts/sync-skills.mjs`:

| Agent | Skill location |
|---|---|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `.claude/skills/build-website-inspired/` |
| [Codex CLI](https://github.com/openai/codex) | `.codex/skills/build-website-inspired/` |
| [GitHub Copilot](https://github.com/features/copilot) | `.github/skills/build-website-inspired/` |
| [Cursor](https://cursor.com/) | `.cursor/commands/build-website-inspired.md` |
| [Windsurf](https://codeium.com/windsurf) | `.windsurf/workflows/build-website-inspired.md` |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `.gemini/commands/build-website-inspired.toml` |
| [OpenCode](https://opencode.ai/) | `.opencode/commands/build-website-inspired.md` |
| [Augment Code](https://www.augmentcode.com/) | `.augment/commands/build-website-inspired.md` |
| [Continue](https://continue.dev/) | `.continue/commands/build-website-inspired.md` |
| [Amazon Q](https://aws.amazon.com/q/developer/) | `.amazonq/cli-agents/build-website-inspired.json` |

## Roadmap

- **v1.0 (current)** — Curated merge with anchor + rule-based overlay + validation. Classify each site, pick an anchor on archetype match, overlay specific tokens (accent / H1 / shadow / radius / fonts) under deterministic rules, reject conflicts, validate WCAG AA and consistency, write three output files with provenance per token. Stops before any build.
- **v1.1** — LLM refinement pass on the merged theme. After the rule-based curation, a single LLM coherence check against the anchor screenshot flags any token that breaks the theme's feel; flagged tokens back out to the anchor default. One pass, no iterative drift.
- **v2.0** — Interactive customization. Minimal refinement CLI ("keep this color, swap the font, switch the radius era") that rewrites affected tokens and re-runs validation only, with provenance updated to `user-override`.

## Credits

Built as a fork of [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template). Phase 1's `getComputedStyle()` extraction technique is adapted directly from that project — thanks to JCodesMore for the elegant DOM-walk pattern that makes hydrated-page token extraction reliable.

## License

MIT

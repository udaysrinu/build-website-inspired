<!-- AUTO-GENERATED from .github/skills/build-website-inspired/SKILL.md — do not edit directly.
     Run `node scripts/sync-skills.mjs` to regenerate. -->


# Build Website Inspired

You are about to research a **category** of premium websites, extract their design tokens, and **merge** them into one coherent theme. You will produce three output files and then **STOP**. You are not building an app. You are not scaffolding components. You are a **theme generator**.

Your input is `the category description the user provided` — a category description, vibe, or a list of sites to synthesize from. Examples:

- "premium fintech risk dashboard"
- "editorial luxury ecommerce"
- "calm healthcare portal"
- "developer tool, dark, Vercel-adjacent"
- "inspired by Mercury, Brex, and Runway"

## Positioning

| Tool | What it does |
|---|---|
| `tweakcn.com` | Edit one theme visually in a UI |
| `/clone-website` (parent fork) | Pixel-perfect clone of one URL |
| **`/build-website-inspired` (this)** | Research a category → extract N sites → merge into ONE coherent theme |

The differentiator is **curation, not copying**. Users don't want to pixel-clone Mercury. They want "the vibe of premium fintech dashboards as a set of tokens I can apply to my own app."

## The Three Phases

There are only three phases. Do them in order. Do not skip ahead. Do not do anything after Phase 2.

- **Phase 0** — Category Research: propose 5-8 reference URLs
- **Phase 1** — Token Extraction: scroll-hydrate + `getComputedStyle()` per site
- **Phase 2** — Curated Merge + Output: classify → anchor → rule-based overlay → validate → write three files, STOP

## Pre-Flight

1. **Playwright MCP is required.** This skill uses Playwright MCP specifically for scroll-hydration (other browser MCPs often don't expose the scroll/wait primitives reliably enough). If Playwright MCP is not available, ask the user to connect it before proceeding. Do NOT fall back to plain `fetch` — hydration is essential.
2. Read `the category description the user provided` as the category description. If it is already a list of URLs, skip straight to Phase 1 with those URLs as the reference set.
3. Create output directories in the **user's current working repo** (wherever this skill is invoked, not this template repo): `docs/research/`, `design/`. If those already exist, don't wipe them — append.
4. Do NOT require `npm run build`, `package.json`, or any Node.js scaffolding in the target repo. This skill is repo-agnostic. It produces tokens; applying them is the user's job.

## Phase 0 — Category Research

Interpret `the category description the user provided` and propose a shortlist of reference sites. You are curating a tasteful corpus — not Googling a generic list.

### Category hint cache

For common categories, use this as a baseline. You may swap 1-2 sites for ones you know better-fit the user's phrasing, but start here so the output is predictable:

| Category | Baseline sites (pick 5-8) |
|---|---|
| **Fintech / risk / FP&A dashboards** | mercury.com, brex.com, runway.com, rilla.com, pilot.com, ramp.com, stripe.com |
| **Developer tools / infra** | vercel.com, linear.app, railway.app, resend.com, supabase.com, planetscale.com, neon.tech |
| **Healthcare / calm / clinical** | oscar.com, onemedical.com, alma.com, forwardhealth.com, maven.com, modernfertility.com |
| **SaaS / productivity** | notion.so, linear.app, height.app, attio.com, superhuman.com, arc.net, craft.do |
| **Luxury / editorial ecommerce** | louisavuitton.com, hermes.com, loewe.com, jwanderson.com, ssense.com, mrporter.com, apc.fr |
| **Editorial publishing** | theverge.com, stratechery.com, every.to, nytimes.com/interactive, bloomberg.com |
| **Design agencies / studios** | pentagram.com, instrument.com, ueno.co, active-theory.com |
| **AI products** | anthropic.com, openai.com, perplexity.ai, cursor.com, cohere.com |

If `the category description the user provided` doesn't fuzzy-match one of these, don't force it — propose sites you know fit the vibe from first principles and state your reasoning per site.

### Deliverable: REFERENCES.md

Write `docs/research/REFERENCES.md` with:

```markdown
# References — <category>

Prompt: "<user's the category description the user provided verbatim>"
Generated: <ISO date>

## Shortlist

| # | Site | Why it fits |
|---|---|---|
| 1 | https://mercury.com | Banking app aesthetic — soft beiges, serious type, precise data tables |
| 2 | https://brex.com | Corporate card, premium ink-on-paper feel, excellent typographic hierarchy |
| 3 | https://runway.com | FP&A native — exact category match, Interphases type, warm cream background |
| ... |

## Anchor recommendation

**Anchor:** Runway (runway.com). Product-archetype match: FP&A dashboard with modeling-first workflows. Its tokens will form the base of the merged theme.

## Overlay candidates

- Mercury: warmer neutrals, rounder radii — consider overlaying muted/accent if Runway feels too stark
- Brex: heavier type hierarchy — consider overlaying h1/h2 weights if we want more editorial presence
```

Then **confirm with the user** before running Phase 1. Show them the shortlist and ask:

> "Proposed references above. Confirm or edit? Also tell me which one should be the ANCHOR (its tokens form the base), and optionally which sites to OVERLAY specific tokens from (e.g., 'Mercury's accent color')."

Wait for their reply. If they confirm, proceed.

## Phase 1 — Token Extraction

For each URL on the confirmed shortlist, run the extraction flow in isolation per site.

### Per-site flow

1. **Navigate** with Playwright MCP to the URL. Wait for `domcontentloaded` and a 500ms settle.

2. **Scroll-hydrate the full page.** Many premium sites lazy-load content, hydrate fonts on first view, or animate tokens in. You must trigger all of them:

   ```javascript
   // Run via Playwright MCP — scroll down, pause, until full doc is seen
   (async function() {
     const step = Math.floor(window.innerHeight * 0.8);
     const max = document.documentElement.scrollHeight;
     for (let y = 0; y < max; y += step) {
       window.scrollTo(0, y);
       await new Promise(r => setTimeout(r, 300));
     }
     window.scrollTo(0, 0);
     await new Promise(r => setTimeout(r, 500));
   })();
   ```

3. **Take a screenshot** at 1440x900 viewport. Save to `docs/research/<hostname>/screenshot.png`.

4. **Run the token extraction script.** This is the same `getComputedStyle()` walk as the parent `clone-website` skill, pared down to token-level data (no DOM tree, no per-element state):

   ```javascript
   // Run via Playwright MCP — extract tokens across full DOM
   (function() {
     const all = [...document.querySelectorAll('*')];
     const tally = (prop, filterFn = () => true) => {
       const counts = new Map();
       all.forEach(el => {
         const v = getComputedStyle(el)[prop];
         if (!v || !filterFn(v)) return;
         counts.set(v, (counts.get(v) || 0) + 1);
       });
       return [...counts.entries()]
         .sort((a, b) => b[1] - a[1])
         .slice(0, 12)
         .map(([v, c]) => ({ v, c }));
     };

     const canonical = (sel) => {
       const el = document.querySelector(sel);
       if (!el) return null;
       const cs = getComputedStyle(el);
       return {
         bg: cs.backgroundColor,
         color: cs.color,
         fontFamily: cs.fontFamily,
         fontSize: cs.fontSize,
         fontWeight: cs.fontWeight,
         lineHeight: cs.lineHeight,
         letterSpacing: cs.letterSpacing,
         text: (el.textContent || '').trim().slice(0, 120),
       };
     };

     return JSON.stringify({
       site: location.hostname,
       totalElements: all.length,
       docHeight: document.documentElement.scrollHeight,
       canonical: {
         body: canonical('body'),
         h1: canonical('h1'),
         h2: canonical('h2'),
         p: canonical('p'),
       },
       topBackgrounds: tally('backgroundColor', v => v !== 'rgba(0, 0, 0, 0)'),
       topTextColors: tally('color'),
       topRadii: tally('borderRadius', v => v !== '0px'),
       topFontSizes: tally('fontSize'),
       topShadows: tally('boxShadow', v => v !== 'none'),
       fonts: [...new Set(all.slice(0, 400).map(el => getComputedStyle(el).fontFamily))].slice(0, 10),
       weights: [...new Set(all.slice(0, 400).map(el => getComputedStyle(el).fontWeight))].slice(0, 8),
       topLetterSpacings: tally('letterSpacing', v => v !== 'normal' && v !== '0px'),
     }, null, 2);
   })();
   ```

5. **Save** the returned JSON to `docs/research/<hostname>/tokens.json`.

### Per-site artifacts

After Phase 1, for each reference you should have:

```
docs/research/
  REFERENCES.md
  <hostname-1>/
    tokens.json
    screenshot.png
  <hostname-2>/
    tokens.json
    screenshot.png
  ...
```

### What NOT to do in Phase 1

- Don't extract per-element DOM trees. We only want token-level data here.
- Don't extract per-section component specs. This is not `/clone-website`.
- Don't save HTML dumps or full asset lists. We don't need images/videos/fonts — tokens describe the palette, not the content.
- Don't skip the scroll-hydration step. Tokens extracted on a non-hydrated page are often wrong (lazy-loaded webfonts are missing, hero colors not computed yet).

## Phase 2 — Curated Merge

Synthesize one coherent theme from the N extractions using **rule-based curation**, not weighted averages. The merge is deterministic and opinionated; every final token carries a one-sentence provenance.

### Merge algorithm (v1.0)

**Step A — Classify each site** by dominant characteristic (editorial, institutional, techy, warm, cool, institutional-dark) based on its top backgrounds + heading fonts + accent saturation. A site is one archetype; do not hedge.

**Step B — Pick an ANCHOR site** — the one whose archetype best matches the user's category. If ambiguous (top two candidates within ~10% confidence), **ask the user before proceeding**. The anchor contributes base `--background`, `--foreground`, spacing scale, and radius scale.

**Step C — Overlay specific tokens from non-anchor sites** using these rules:

- **Accent color** = whichever site's accent has highest saturation AND passes ≥4.5:1 WCAG AA contrast against the anchor background.
- **H1 metrics** (font-size, weight, tracking) = site with the largest H1 × tightest tracking (these signal premium).
- **Shadow recipe** = site with the most-layered shadow (multi-stop preferred over single). Prefer warm-tinted over cool.
- **Radius scale** = site with the tightest scale (3-4 values, not 7+). Snap to one era: Sharp (≤4px), Soft (6-10px), or Pillowy (≥12px).
- **Fonts**: auto-substitute any licensed custom faces (Arcadia, Interphases, Söhne, Alliance) with OFL-licensed alternates (Fraunces, Inter Display, Switzer, General Sans).

**Step D — Conflict resolution**: if an overlay clashes with the anchor's character (e.g., cool accent on warm anchor, pillowy overlay on sharp anchor), **keep the anchor**. No Frankenstein merges.

**Step E — Validate** before writing output:
- WCAG AA contrast on every text-on-bg pairing
- Tabular numerals in `font-feature-settings`
- Consistent radius era (no mixed Sharp + Pillowy)
- ≤3 accent colors in the final palette
- No pure `#000` or `#FFF` — warm-off-white / cool-off-white only

### Rationale generation

For every final token, include a one-sentence provenance in `DESIGN_TOKENS.md`. Example:

> "Accent `#F9A600` — from Runway. Picked over Attio's mono-accent because Runway's warm amber doubles as a severity signal for dashboard use cases and clears 6.1:1 on the warm-off-white anchor."

### Rejection criteria (the merge AVOIDS)

- Pure black (`#000`) or pure white (`#FFF`)
- Mixed radius eras
- Licensed fonts in output
- More than 3 accent colors
- Unverified contrast ratios
- Two competing display faces

### Output file 1: `design/DESIGN_TOKENS.md`

Human-readable doc with a rationale column. Template:

```markdown
# Design Tokens — <category>

Anchor: <anchor site>
Overlays: <list, or "none">
Generated: <ISO date>
References: see `docs/research/REFERENCES.md`

## Colors

| Token | Value | Source | Rationale |
|---|---|---|---|
| `--background` | `#F8F7F5` | runway.com (1424 elements) | Warm cream — dominant body surface |
| `--foreground` | `#261B07` | runway.com (1499 elements) | Deep espresso — primary text |
| `--accent` | `#F9A600` | runway.com | Saturated amber — only non-neutral in palette, highest-visibility accent |
| ... |

## Typography

| Token | Value | Source |
|---|---|---|
| `--font-sans` | `"Interphases Pro Variable", Arial, sans-serif` | runway.com canonical body |
| `--font-heading` | Same as sans (Interphases covers display) | runway.com h1 |
| `h1` | `72px / 584 weight / -1.44px tracking` | runway.com |
| `h2` | `56px / 584 weight` | runway.com |
| `body` | `16px / 20px line-height / -0.16px tracking` | runway.com |

## Radii

| Token | Value | Notes |
|---|---|---|
| `--radius` | `8px` | Top radius (185 elements), rounded for consistency |
| (outliers) | `4px`, `12px` | Used for compact / loose surfaces respectively |

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `color(srgb 0.149 0.106 0.027 / 0.06) 0 4px 8px 0` |
| `--shadow-inset` | (anchor's inset pattern if present) |

## Application notes

- This is a **light theme**. Anchor (runway.com) was sampled in its default light mode. For dark mode, re-run with `?theme=dark` or request a separate dark extraction.
- Contrast ratios have NOT been validated. Before shipping, run tokens through a WCAG checker.
- Font is proprietary (Interphases Pro) — if unavailable, fall back to `Inter` or `Söhne`.
```

### Output file 2: `design/theme.css`

Ready-to-paste CSS custom properties block. Shadcn-compatible naming. Template:

```css
/* Generated by /build-website-inspired
 * Anchor: <anchor>
 * Overlays: <list>
 * Date: <ISO date>
 */

:root {
  /* Colors */
  --background: 40 27% 96%;         /* #F8F7F5 */
  --foreground: 33 79% 9%;          /* #261B07 */
  --card: 0 0% 100%;
  --card-foreground: 33 79% 9%;
  --muted: 45 22% 86%;              /* #E3DFD5 */
  --muted-foreground: 33 68% 25%;
  --accent: 39 100% 49%;            /* #F9A600 */
  --accent-foreground: 33 79% 9%;
  --primary: 39 100% 49%;
  --primary-foreground: 33 79% 9%;
  --border: 33 68% 10% / 0.08;
  --input: 33 68% 10% / 0.08;
  --ring: 39 100% 49%;

  /* Radii */
  --radius: 0.5rem;

  /* Typography */
  --font-sans: "Interphases Pro Variable", "Inter", Arial, sans-serif;
  --font-heading: var(--font-sans);

  /* Shadows */
  --shadow-sm: 0 4px 8px 0 rgb(38 27 7 / 0.06);
  --shadow-md: 0 1px 2px 0 rgb(38 27 7 / 0.36), 0 4px 8px 0 rgb(38 27 7 / 0.06);
}
```

Write actual HSL values with a hex comment beside each color so users can verify visually.

### Output file 3: `design/theme.json`

Machine-readable for programmatic consumption. Template:

```json
{
  "meta": {
    "anchor": "runway.com",
    "overlays": [],
    "category": "premium fintech risk dashboard",
    "generated": "2026-05-11T00:00:00Z",
    "source_references": ["runway.com", "mercury.com", "brex.com"]
  },
  "colors": {
    "background": "#F8F7F5",
    "foreground": "#261B07",
    "card": "#FFFFFF",
    "cardForeground": "#261B07",
    "muted": "#E3DFD5",
    "mutedForeground": "rgb(38 27 7 / 0.6)",
    "accent": "#F9A600",
    "accentForeground": "#261B07",
    "primary": "#F9A600",
    "primaryForeground": "#261B07",
    "border": "rgb(38 27 7 / 0.08)"
  },
  "radii": {
    "default": "8px",
    "sm": "4px",
    "lg": "12px"
  },
  "typography": {
    "fontSans": "\"Interphases Pro Variable\", \"Inter\", Arial, sans-serif",
    "fontHeading": "\"Interphases Pro Variable\", \"Inter\", Arial, sans-serif",
    "h1": { "size": "72px", "weight": 584, "letterSpacing": "-1.44px" },
    "h2": { "size": "56px", "weight": 584 },
    "body": { "size": "16px", "lineHeight": "20px", "letterSpacing": "-0.16px" }
  },
  "shadows": {
    "sm": "0 4px 8px 0 rgb(38 27 7 / 0.06)",
    "md": "0 1px 2px 0 rgb(38 27 7 / 0.36), 0 4px 8px 0 rgb(38 27 7 / 0.06)"
  }
}
```

## STOP

This is the single most important rule of this skill: **STOP after Phase 2**.

Do NOT:
- Scaffold a Next.js app
- Dispatch builder agents
- Modify `src/`, `components/`, `app/`, or any application code
- Install packages
- Run `npm install`, `npm run build`, or `git` anything other than what the user explicitly asks
- Create a preview page to "show off" the theme
- Start building an "example component" so the user can see the tokens in use
- Call `/clone-website` to reconstruct any of the references

The user asked for a **theme**. Not an app. Not a demo. They will apply these tokens to their own code themselves, or invoke a follow-up build skill explicitly. Your job is done when `design/DESIGN_TOKENS.md`, `design/theme.css`, and `design/theme.json` exist and the report is written.

If the user asks "can you also build me an example"— tell them to rerun with a different skill. This one is ruthlessly a tokens generator.

## Example invocations

### 1. Category with cache hit

```
/build-website-inspired "premium FP&A dashboard with ink-on-paper feel"
```

Expected behavior:
- Phase 0 proposes Runway, Mercury, Brex, Pilot, Ramp + 2 editorial crossovers
- User confirms, picks Runway as anchor
- Phase 1 extracts tokens from all 7
- Phase 2 emits cream-background, amber-accent light theme
- Stops

### 2. Novel category (no cache hit)

```
/build-website-inspired "veterinary clinic portal — warm but clinical"
```

Expected behavior:
- Phase 0 fuzzy-matches to "healthcare + calm", proposes 6 sites from memory with reasoning per site
- User may swap some (e.g., "use chewy.com instead of maven.com")
- Phase 1 extracts
- Phase 2 emits whatever anchor implies — probably sage/cream palette
- Stops

### 3. User provides URLs directly

```
/build-website-inspired "use attio.com, linear.app, vercel.com"
```

Expected behavior:
- Skip Phase 0 category research (URLs already given). Write REFERENCES.md with the three URLs + brief rationale each.
- Ask which is anchor (recommend Attio for product-archetype match if user didn't say)
- Phase 1 extracts
- Phase 2 emits
- Stops

## Completion report

When done, report:
- Number of references extracted
- Anchor site
- Overlays applied (if any)
- Paths to the three output files
- One-sentence summary of the theme's character ("warm cream + amber, editorial serif-adjacent sans-serif, moderate radius")
- Explicit confirmation: **"Stopping here. Apply `design/theme.css` to your repo manually, or invoke a build skill next."**

## Credits

This skill builds on the `getComputedStyle()` extraction technique from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template). The cloner produces a pixel-perfect clone of one site; this skill keeps only the token extraction and adds category research + merge, stopping before any build step.

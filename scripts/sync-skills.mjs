#!/usr/bin/env node

/**
 * Generates build-website-inspired command/skill files for all supported AI coding platforms.
 * Source of truth: .claude/skills/build-website-inspired/SKILL.md
 *
 * Usage: node scripts/sync-skills.mjs
 *
 * Fallback source (if .claude path doesn't exist yet): .github/skills/build-website-inspired/SKILL.md
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Primary source: .claude/skills/build-website-inspired/SKILL.md
// Fallback source: .github/skills/build-website-inspired/SKILL.md
const PRIMARY_SOURCE = join(ROOT, '.claude', 'skills', 'build-website-inspired', 'SKILL.md');
const FALLBACK_SOURCE = join(ROOT, '.github', 'skills', 'build-website-inspired', 'SKILL.md');

const SOURCE = existsSync(PRIMARY_SOURCE) ? PRIMARY_SOURCE : FALLBACK_SOURCE;
const SOURCE_REL = SOURCE.replace(ROOT + '/', '');

// --- Parse source skill ---

let raw;
try {
  raw = readFileSync(SOURCE, 'utf8').replace(/\r\n/g, '\n');
} catch {
  console.error(`Error: Source skill not found. Tried:`);
  console.error(`  - ${PRIMARY_SOURCE}`);
  console.error(`  - ${FALLBACK_SOURCE}`);
  process.exit(1);
}

const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) {
  console.error('Error: Could not parse SKILL.md frontmatter');
  process.exit(1);
}

const body = match[2];
const shortDesc =
  'Research a category of premium sites, extract design tokens, merge into one theme. Outputs tokens only — no build.';

// --- Helpers ---

function write(relPath, content) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

const HEADER =
  `<!-- AUTO-GENERATED from ${SOURCE_REL} — do not edit directly.\n` +
  '     Run `node scripts/sync-skills.mjs` to regenerate. -->\n\n';

const noArgs = (text) =>
  text.replace(/\$ARGUMENTS/g, 'the category description the user provided');

// --- Generate ---

console.log('Syncing build-website-inspired skill to all platforms...');
console.log(`  Source: ${SOURCE_REL}\n`);

// 1. Claude Code — only regenerate if we have write access (this is normally the source)
if (SOURCE !== PRIMARY_SOURCE) {
  // Source is .github/ — also sync to .claude/
  write('.claude/skills/build-website-inspired/SKILL.md', raw);
}

// 2. Codex CLI — same SKILL.md format, same $ARGUMENTS syntax
write('.codex/skills/build-website-inspired/SKILL.md', raw);

// 3. GitHub Copilot — same SKILL.md format. Skip if this is the source.
if (SOURCE !== FALLBACK_SOURCE) {
  write('.github/skills/build-website-inspired/SKILL.md', raw);
}

// 4. Cursor — plain markdown, no argument substitution support
write('.cursor/commands/build-website-inspired.md', HEADER + noArgs(body));

// 5. Windsurf — markdown workflow
write('.windsurf/workflows/build-website-inspired.md', HEADER + noArgs(body));

// 6. Gemini CLI — TOML format, {{args}} for arguments
const geminiBody = body.replace(/\$ARGUMENTS/g, '{{args}}');
write(
  '.gemini/commands/build-website-inspired.toml',
  `# AUTO-GENERATED from ${SOURCE_REL}\n` +
    `# Run \`node scripts/sync-skills.mjs\` to regenerate.\n\n` +
    `description = "${shortDesc}"\n\n` +
    `[prompt]\ntext = '''\n${geminiBody}\n'''\n`
);

// 7. OpenCode — markdown + YAML frontmatter, $ARGUMENTS works natively
write(
  '.opencode/commands/build-website-inspired.md',
  `---\ndescription: "${shortDesc}"\n---\n${HEADER}${body}`
);

// 8. Augment Code — markdown + YAML frontmatter
write(
  '.augment/commands/build-website-inspired.md',
  `---\ndescription: "${shortDesc}"\nargument-hint: "<category-description-or-vibe>"\n---\n${HEADER}${body}`
);

// 9. Continue — prompt file with invokable: true
write(
  '.continue/commands/build-website-inspired.md',
  `---\nname: build-website-inspired\ndescription: "${shortDesc}"\ninvokable: true\n---\n${HEADER}${body}`
);

// 10. Amazon Q — JSON agent definition
write(
  '.amazonq/cli-agents/build-website-inspired.json',
  JSON.stringify(
    {
      name: 'build-website-inspired',
      description: shortDesc,
      prompt: noArgs(body),
      fileContext: ['AGENTS.md', 'docs/research/**', 'design/**'],
    },
    null,
    2
  ) + '\n'
);

console.log('\nDone! Platform command files generated from source skill.');

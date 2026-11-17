#!/usr/bin/env node
/**
 * deckhand install — installe le skill dans les répertoires d'agents détectés.
 *   node scripts/install.mjs [--target claude|codex|agents|all]
 * Copie SKILL.md dans ~/.claude/skills/deckhand et équivalents.
 */
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const home = homedir();
const targets = {
  claude: join(home, '.claude', 'skills', 'deckhand'),
  codex: join(home, '.codex', 'skills', 'deckhand'),
  agents: join(home, '.agents', 'skills', 'deckhand'),
};

const which = process.argv.includes('--target')
  ? process.argv[process.argv.indexOf('--target') + 1]
  : 'all';

const selected = which === 'all'
  ? Object.entries(targets)
  : Object.entries(targets).filter(([k]) => k === which);

if (!selected.length) {
  console.error(`✗ cible inconnue : ${which} (claude | codex | agents | all)`);
  process.exit(1);
}

const src = new URL('../SKILL.md', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
if (!existsSync(src)) {
  console.error('✗ SKILL.md introuvable');
  process.exit(1);
}

for (const [name, dir] of selected) {
  mkdirSync(dir, { recursive: true });
  copyFileSync(src, join(dir, 'SKILL.md'));
  console.log(`✓ ${name.padEnd(7)} → ${dir}`);
}
console.log('\nPuis : demande un deck à ton agent, ou lance `deckhand build slides dist`.');

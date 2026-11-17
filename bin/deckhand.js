#!/usr/bin/env node
/**
 * deckhand — CLI
 *   deckhand build [src=slides] [out=dist]
 *   deckhand audit [out=dist]
 *   deckhand init  [dir=slides]
 */
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const [cmd, ...args] = process.argv.slice(2);

const run = (script, argv) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...argv], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
};

switch (cmd) {
  case 'build':
    run('build.mjs', [args[0] || 'slides', args[1] || 'dist']);
    break;
  case 'audit':
    run('audit.mjs', [args[0] || 'dist']);
    break;
  case 'install':
    run('install.mjs', args);
    break;
  case 'init': {
    const dir = resolve(args[0] || 'slides');
    if (existsSync(dir) && !args.includes('--force')) {
      console.error(`✗ ${dir} existe déjà (utilise --force)`);
      process.exit(1);
    }
    mkdirSync(dir, { recursive: true });
    const seed = join(ROOT, 'examples', 'pitch', '01.html');
    writeFileSync(join(dir, '01.html'), readFileSync(seed, 'utf8'));
    console.log(`✓ ${dir}/01.html créé — lance \`deckhand build ${args[0] || 'slides'}\``);
    break;
  }
  case '--version':
  case '-v':
    console.log('deckhand 0.1.0');
    break;
  default:
    console.log(`deckhand — editorial slides for agents

  deckhand build [src=slides] [out=dist]   assemble, export PDF + PNG
  deckhand audit [out=dist]                vérifie les débordements
  deckhand init  [dir=slides]              crée une slide de départ
  deckhand install [--target claude|codex|agents|all]   installe le skill

Un fragment par slide : slides/01.html, slides/02.html, …
Layouts : cover, section, two-col, quote, data, full, list, end.
`);
}

#!/usr/bin/env node
/**
 * deckhand — build a deck from HTML fragments.
 *
 *   node scripts/build.mjs [srcDir=slides] [outDir=dist]
 *
 * Outputs: <outDir>/deck.html, <outDir>/deck.pdf, <outDir>/png/NN.png
 * No dependency. Needs a Chromium-family browser on the machine.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const CSS = readFileSync(join(ROOT, 'assets', 'fonts.css'), 'utf8') + '\n' + readFileSync(join(ROOT, 'assets', 'deck.css'), 'utf8');

const srcDir = resolve(process.argv[2] || 'slides');
const outDir = resolve(process.argv[3] || 'dist');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync);

if (!CHROME) {
  console.error('✗ no Chromium-family browser found. Install Chrome/Chromium/Edge.');
  process.exit(1);
}

const files = readdirSync(srcDir).filter(f => extname(f) === '.html').sort();
if (!files.length) {
  console.error(`✗ no .html fragments in ${srcDir}`);
  process.exit(1);
}

const fragments = files.map(f => readFileSync(join(srcDir, f), 'utf8').trim());

const page = (body, extraHead = '') => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deckhand</title>
<style>
${CSS}
</style>
${extraHead}
</head>
<body>
${body}
</body>
</html>`;

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'png'), { recursive: true });

// 1. full deck
const deckPath = join(outDir, 'deck.html');
writeFileSync(deckPath, page(fragments.join('\n')));
console.log(`✓ ${files.length} slides → ${deckPath}`);

// 2. assets next to the deck (images referenced relatively)
for (const f of readdirSync(srcDir)) {
  if (['.html', '.md'].includes(extname(f))) continue;
  copyFileSync(join(srcDir, f), join(outDir, f));
  copyFileSync(join(srcDir, f), join(outDir, 'png', f));
}

const chrome = (args) => {
  try {
    execFileSync(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      ...args,
    ], { stdio: 'pipe', timeout: 60000 });
    return true;
  } catch (e) {
    console.error('  chrome:', (e.stderr || '').toString().slice(0, 300));
    return false;
  }
};

// 3. one PNG per slide (crisp 1600×900)
let ok = 0;
fragments.forEach((frag, i) => {
  const n = String(i + 1).padStart(2, '0');
  const single = join(outDir, 'png', `${n}.html`);
  writeFileSync(single, page(frag));
  const shot = join(outDir, 'png', `${n}.png`);
  if (chrome([
    '--window-size=1600,900',
    `--screenshot=${shot.replace(/\\/g, '/')}`,
    '--virtual-time-budget=1500',
    pathToFileURL(single).href,
  ]) && existsSync(shot)) ok++;
});
console.log(`✓ ${ok}/${fragments.length} PNG → ${join(outDir, 'png')}`);

// 4. PDF
const pdf = join(outDir, 'deck.pdf');
if (chrome([
  `--print-to-pdf=${pdf.replace(/\\/g, '/')}`,
  '--no-pdf-header-footer',
  '--virtual-time-budget=2500',
  pathToFileURL(deckPath).href,
]) && existsSync(pdf)) {
  console.log(`✓ PDF → ${pdf}`);
} else {
  console.log('· PDF skipped');
}

#!/usr/bin/env node
/**
 * deckhand audit — vérifie qu'aucune slide ne déborde et que le texte n'est pas coupé.
 *   node scripts/audit.mjs [outDir=dist]
 * Sortie : JSON + code retour 1 si débordement.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const outDir = resolve(process.argv[2] || join(ROOT, 'dist'));
const deckPath = join(outDir, 'deck.html');
if (!existsSync(deckPath)) { console.error('✗ deck.html introuvable'); process.exit(2); }

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser', '/usr/bin/chromium',
].find(existsSync);

const probe = `<script>
window.addEventListener('load', () => setTimeout(() => {
  const out = [];
  document.querySelectorAll('.slide').forEach((s, i) => {
    const r = s.getBoundingClientRect();
    const bad = [...s.querySelectorAll('*')].filter(el => {
      const b = el.getBoundingClientRect();
      return b.bottom > r.bottom + 0.5 || b.right > r.right + 0.5 ||
             b.top < r.top - 0.5 || b.left < r.left - 0.5;
    }).map(el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
    const clipped = [...s.querySelectorAll('*')].filter(el =>
      !el.classList.contains('sr-only') &&
      el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible'
    ).map(el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
    out.push({ n: i + 1, overflow: [...new Set(bad)].slice(0, 8), clipped: [...new Set(clipped)].slice(0, 8) });
  });
  const pre = document.createElement('pre'); pre.id = 'audit-out';
  pre.textContent = JSON.stringify(out);
  document.body.innerHTML = ''; document.body.appendChild(pre);
}, 120));
</script>`;

const html = readFileSync(deckPath, 'utf8').replace('</body>', probe + '\n</body>');
const tmp = join(outDir, '_audit.html');
writeFileSync(tmp, html);

const dom = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--window-size=1600,900', '--virtual-time-budget=4000',
  '--dump-dom', pathToFileURL(tmp).href,
], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'] });

const m = dom.match(/<pre id="audit-out">([\s\S]*?)<\/pre>/);
if (!m) { console.error('✗ sonde non exécutée'); process.exit(2); }
const data = JSON.parse(m[1]);
let bad = 0;
for (const s of data) {
  const ok = !s.overflow.length && !s.clipped.length;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} slide ${String(s.n).padStart(2, '0')}` +
    (ok ? '' : `  overflow=[${s.overflow.join(', ')}] clipped=[${s.clipped.join(', ')}]`));
}
console.log(bad ? `\n✗ ${bad} slide(s) en défaut` : '\n✓ aucun débordement');
process.exit(bad ? 1 : 0);

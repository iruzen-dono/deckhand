#!/usr/bin/env node
/**
 * deckhand audit — vérifie qu'aucune slide ne déborde et que le deck respecte
 * le contrat éditorial (kicker, foliot, titre, thèmes sombres, autonomie).
 *
 *   node scripts/audit.mjs [outDir=dist] [--json]
 *
 * Sortie : rapport lisible (ou JSON avec --json), code retour 1 si défaut.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const outArg = args.find(a => !a.startsWith('--'));
const outDir = resolve(outArg || join(ROOT, 'dist'));
const deckPath = join(outDir, 'deck.html');
if (!existsSync(deckPath)) { console.error('✗ deck.html introuvable'); process.exit(2); }

const MAX_DARK_SLIDES = 3;

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
  const external = (el) => {
    const raw = el.getAttribute('src') || el.getAttribute('href') || '';
    if (/^(https?:)?\\/\\//i.test(raw.trim())) return el.tagName.toLowerCase() + '=' + raw.trim().slice(0, 60);
    const style = el.getAttribute('style') || '';
    const m = style.match(/url\\(\\s*['"]?((?:https?:)?\\/\\/[^)'"]+)/i);
    return m ? 'style-url=' + m[1].slice(0, 60) : null;
  };
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
    const kickers = s.querySelectorAll('.kicker').length;
    const themes = [...s.classList].filter(c => c === 'theme-ink' || c === 'theme-night');
    const allow = (s.getAttribute('data-allow') || '').split(/\\s+/).filter(Boolean);
    const externals = [...new Set([...s.querySelectorAll('[src],[href],[style]')].map(external).filter(Boolean))];
    const emoji = /\\p{Extended_Pictographic}/u.test(s.innerText || '');
    out.push({
      n: i + 1,
      dataN: s.getAttribute('data-n'),
      kickers,
      heading: !!s.querySelector('h1, h2, h3'),
      themes,
      allow,
      externals,
      emoji,
      overflow: [...new Set(bad)].slice(0, 8),
      clipped: [...new Set(clipped)].slice(0, 8),
    });
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
const slides = JSON.parse(m[1]);

// Document-level autonomy: the assembled deck must not fetch anything.
const docExternals = (html.match(/(?:src|href)\s*=\s*["'](?:https?:)?\/\//gi) || [])
  .concat(html.match(/url\(\s*['"]?https?:\/\//gi) || []);

// PDF sanity: one 16:9 page per slide. A silent change in Chromium's print
// defaults would otherwise produce A4 pages nobody notices until the talk.
const pdfPath = join(outDir, 'deck.pdf');
let pdfPages = 0;
let pdfRatio = null;
if (existsSync(pdfPath)) {
  const pdf = readFileSync(pdfPath, 'latin1');
  const boxes = [...pdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)]
    .map(m => [parseFloat(m[1]), parseFloat(m[2])]);
  pdfPages = boxes.length;
  if (pdfPages) pdfRatio = boxes[0][0] / boxes[0][1];
}

const seenFolios = new Set();
let contentDefects = 0;
let layoutDefects = 0;
const darkSlides = [];

for (const s of slides) {
  const issues = [];

  if (!s.dataN) issues.push('data-n manquant');
  else if (seenFolios.has(s.dataN)) issues.push(`data-n "${s.dataN}" dupliqué`);
  else seenFolios.add(s.dataN);

  if (!s.kickers) issues.push('kicker manquant');
  if (s.kickers > 1) issues.push(`${s.kickers} kickers`);
  if (!s.heading) issues.push('aucun titre');
  if (s.externals.length) issues.push(`ressource externe: ${s.externals.join(', ')}`);
  if (s.emoji && !s.allow.includes('emoji')) issues.push('emoji dans le texte');
  if (s.themes.length) darkSlides.push(s.n);

  s.issues = issues;
  const layoutBad = s.overflow.length || s.clipped.length;
  if (layoutBad) layoutDefects++;
  if (issues.length) contentDefects++;
}

const globalIssues = [];
if (darkSlides.length > MAX_DARK_SLIDES) {
  globalIssues.push(`${darkSlides.length} slides sombres (max ${MAX_DARK_SLIDES}) : ${darkSlides.join(', ')}`);
}
if (docExternals.length) {
  globalIssues.push(`${docExternals.length} référence(s) externe(s) dans deck.html — le deck doit être autonome`);
}

const TARGET_RATIO = 16 / 9;
if (!pdfPages) {
  globalIssues.push('deck.pdf absent ou sans page mesurable');
} else {
  if (pdfPages !== slides.length) {
    globalIssues.push(`deck.pdf a ${pdfPages} page(s) pour ${slides.length} slide(s)`);
  }
  if (Math.abs(pdfRatio - TARGET_RATIO) > 0.01) {
    globalIssues.push(`deck.pdf en ${pdfRatio.toFixed(3)}:1 (attendu 16:9)`);
  }
}

if (asJson) {
  console.log(JSON.stringify({
    ok: contentDefects === 0 && layoutDefects === 0 && globalIssues.length === 0,
    slides: slides.map(s => ({
      n: s.n,
      data_n: s.dataN,
      dark: s.themes.length > 0,
      issues: s.issues,
      overflow: s.overflow,
      clipped: s.clipped,
    })),
    pdf: { pages: pdfPages, ratio: pdfRatio ? Number(pdfRatio.toFixed(4)) : null },
    global_issues: globalIssues,
  }, null, 2));
} else {
  slides.forEach((s) => {
    const ok = !s.issues.length && !s.overflow.length && !s.clipped.length;
    const detail = [
      s.issues.length ? s.issues.join(', ') : '',
      s.overflow.length ? `overflow=[${s.overflow.join(', ')}]` : '',
      s.clipped.length ? `clipped=[${s.clipped.join(', ')}]` : '',
    ].filter(Boolean).join('  ');
    console.log(`${ok ? '✓' : '✗'} slide ${String(s.n).padStart(2, '0')}` + (ok ? '' : `  ${detail}`));
  });

  globalIssues.forEach(g => console.log(`✗ ${g}`));

  if (!contentDefects && !layoutDefects && !globalIssues.length) {
    console.log('\n✓ aucun débordement, contrat éditorial respecté');
  } else {
    const parts = [];
    if (layoutDefects) parts.push(`${layoutDefects} slide(s) en débordement`);
    if (contentDefects) parts.push(`${contentDefects} slide(s) hors contrat`);
    if (globalIssues.length) parts.push(`${globalIssues.length} défaut(s) global(aux)`);
    console.log(`\n✗ ${parts.join(', ')}`);
  }
}

process.exit(contentDefects || layoutDefects || globalIssues.length ? 1 : 0);

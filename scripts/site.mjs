#!/usr/bin/env node
/**
 * deckhand site — prépare la page de démo statique pour GitHub Pages (/docs).
 *   node scripts/site.mjs
 * Copie le deck autonome en docs/index.html et ses assets, puis laisse
 * GitHub Pages servir docs/ tel quel.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const dist = join(ROOT, 'dist');
const docs = join(ROOT, 'docs');

if (!existsSync(join(dist, 'deck.html'))) {
  console.error('✗ dist/deck.html absent — lance `node bin/deckhand.js build examples/pitch dist` d’abord');
  process.exit(1);
}
mkdirSync(docs, { recursive: true });

let html = readFileSync(join(dist, 'deck.html'), 'utf8');

// petite barre de navigation propre à la version web (le PDF/PNG n'en ont pas)
html = html.replace('</body>', `
<div class="site-nav">
  <span>deckhand</span>
  <span><a href="https://github.com/iruzen-dono/deckhand">github</a> · <a href="deck.pdf">pdf</a></span>
</div>
<style>
  .site-nav{position:fixed;left:0;right:0;bottom:0;display:flex;justify-content:space-between;
    gap:12px;padding:12px 16px;font:13px/1 "JetBrains Mono",Consolas,monospace;letter-spacing:.1em;
    text-transform:uppercase;color:#6b6459;background:#f7f4ee;border-top:1px solid #918675;z-index:99}
  .site-nav a{color:#b4451f;text-decoration:none}
  html,body{background:#3a3a3a;max-width:100%;overflow-x:hidden}
  body{display:flex;flex-direction:column;align-items:center}
  .fit{overflow:hidden;flex:none;margin:0 0 24px}
  .fit>.slide{margin:0;transform-origin:top left}
  @media screen and (min-width:1700px){.fit>.slide{box-shadow:0 24px 80px rgba(0,0,0,.35)}}
</style>
</body>
<script>
(function(){
  document.querySelectorAll('.slide').forEach(function(s){
    var w=document.createElement('div'); w.className='fit';
    s.parentNode.insertBefore(w,s); w.appendChild(s);
  });
  function fit(){
    var s=Math.min(1,(document.documentElement.clientWidth-24)/1600);
    document.querySelectorAll('.fit').forEach(function(w){
      var sl=w.firstElementChild;
      w.style.width=(1600*s)+'px';
      w.style.height=(900*s)+'px';
      sl.style.transform='scale('+s+')';
    });
  }
  window.addEventListener('resize',fit);
  window.addEventListener('load',fit);
  fit();
})();
</script>`);

writeFileSync(join(docs, 'index.html'), html);
for (const a of ['plate.svg']) {
  if (existsSync(join(dist, a))) copyFileSync(join(dist, a), join(docs, a));
}
if (existsSync(join(dist, 'deck.pdf'))) copyFileSync(join(dist, 'deck.pdf'), join(docs, 'deck.pdf'));
console.log('✓ docs/index.html + assets prêts (GitHub Pages → /docs)');

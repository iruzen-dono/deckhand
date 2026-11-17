#!/usr/bin/env node
/**
 * deckhand site — prépare la page de démo statique pour GitHub Pages (/docs).
 *   node scripts/site.mjs
 * Prend dist/deck.html, ajoute une barre de navigation et un scaling responsive,
 * puis écrit docs/index.html. GitHub Pages sert docs/ tel quel.
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

const nav = `
<header class="site-nav">
  <span class="brand">deckhand</span>
  <nav><a href="https://github.com/iruzen-dono/deckhand">github</a><i>·</i><a href="deck.pdf">pdf</a></nav>
</header>
<style>
  html,body{background:#3a3a3a;max-width:100%;overflow-x:hidden}
  body{display:block}
  .site-nav{
    position:sticky;top:0;z-index:99;width:100%;box-sizing:border-box;
    display:flex;justify-content:space-between;align-items:center;
    padding:12px 20px;background:#f7f4ee;border-bottom:1px solid #918675;
    font:12px/1 "JetBrains Mono",Consolas,monospace;letter-spacing:.12em;
    text-transform:uppercase;color:#6b6459;
  }
  .site-nav a{color:#b4451f;text-decoration:none}
  .site-nav i{font-style:normal;margin:0 10px;color:#918675}
  .site-nav nav{display:flex;align-items:center}
  .fit{overflow:hidden;margin:24px auto 0}
  .fit>.slide{margin:0;transform-origin:top left}
  @media screen and (min-width:1700px){.fit>.slide{box-shadow:0 24px 80px rgba(0,0,0,.35)}}
  @media screen and (max-width:760px){
    .site-nav{font-size:11px;padding:10px 14px}
    .site-nav .brand{letter-spacing:.14em}
  }
</style>
`;

const script = `
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
</script>
`;

html = html.replace('<body>', '<body>' + nav);
html = html.replace('</body>', script + '</body>');
writeFileSync(join(docs, 'index.html'), html);

for (const a of ['plate.svg']) {
  if (existsSync(join(dist, a))) copyFileSync(join(dist, a), join(docs, a));
}
if (existsSync(join(dist, 'deck.pdf'))) copyFileSync(join(dist, 'deck.pdf'), join(docs, 'deck.pdf'));
console.log('✓ docs/index.html + assets prêts (GitHub Pages → /docs)');

# Launch plan

Objectif : la page **GitHub Trending** (daily puis weekly), et un repo qui reste
utile après le pic. Pas de revenu, pas de SaaS. La métrique qui compte : les
stars gagnées dans la première semaine, et le ratio forks/stars (un vrai usage
tourne autour de 10 %).

---

## 1. Positionnement

**Une phrase.** Your agent writes the content. Deckhand makes the layout look
like a studio did it.

**Le méchant.** Le deck généré par défaut : gradient violet, emoji, Arial gras,
deux colonnes identiques.

**La preuve.** Un GIF avant/après de 8 secondes, même contenu, deux rendus.

**Les trois chiffres qui rassurent.** 0 dépendance · 0 requête réseau · 0 erreur W3C.

Ce qu'il ne faut **pas** dire : « révolutionnaire », « game-changer », « 10x ».
Ces mots font fermer l'onglet, et plusieurs communautés les considèrent comme un
signal de texte généré.

---

## 2. Ce qui est prêt

| Élément | État |
|---|---|
| Repo committé, 5 commits, licence MIT | ✅ |
| `SKILL.md` installable (`deckhand install`) | ✅ |
| Démo en ligne (`docs/index.html` → GitHub Pages) | ✅ |
| GIF avant/après (`docs/preview.gif`, 862 Ko) | ✅ |
| Image de partage 1200×630 (`docs/og.png`) | ✅ |
| CI qui casse si une slide déborde | ✅ |
| README avec le hook en première ligne | ✅ |

**Publié le 17/11 à 09:27 UTC.**

- Repo : https://github.com/iruzen-dono/deckhand
- Démo : https://iruzen-dono.github.io/deckhand/
- Release : v0.1.0
- Branche par défaut : `master` (Pages → `master` / `/docs`)
- Langage détecté : JavaScript 55 % / CSS 45 % (le `.gitattributes` exclut les artefacts générés)
- CI : verte au premier run

---

## 3. Le calendrier

Deux vagues. La première ne vise pas le trending : elle vise les 50–100 premières
stars, les premiers retours, et le karma Reddit nécessaire à la seconde.

### Vague 1 — cette semaine (publication + premiers retours)

| Jour | Action | Canal | Règle à respecter |
|---|---|---|---|
| **Mardi 17/11, 12–17 UTC** | Publier le repo + Pages | GitHub | — |
| Mardi 17, 14 UTC | Post court | r/SideProject (453 k) | « I built… » + détails techniques, self-promo autorisée |
| Mardi 17, 15 UTC | Lien + 2 phrases | r/coolgithubprojects (50–95 k) | Juste le lien et une description courte |
| Mardi 17, 16 UTC | Thread 5 tweets | X | GIF en premier tweet |
| Mercredi 18 | Show HN | Hacker News | Titre factuel, pas de superlatif, lien direct, rester dans les commentaires |
| Mercredi–vendredi | Répondre à **tous** les commentaires | partout | C'est là que se joue la conversion |
| En continu | Commenter 3–5 posts/jour | r/ClaudeAI, r/webdev | **Sans jamais mentionner Deckhand** |

Objectif vague 1 : **50–150★**, 5–15 issues, 2–3 contributeurs.

### Vague 2 — J+10 à J+14 (le trending)

À déclencher quand le karma Reddit dépasse **100** (r/ClaudeAI l'exige pour poster
dans le feed) et que les retours de la vague 1 sont intégrés.

| Jour | Action | Canal | Pourquoi |
|---|---|---|---|
| Mardi ou mercredi, 12–17 UTC | Post « Showcase » | r/ClaudeAI (200 k+) | Construit **avec** Claude Code, gratuit à essayer, description détaillée |
| Samedi | Showoff Saturday | r/webdev (2 M+) | Seul créneau promo autorisé |
| Mardi | Post « I built » | r/SideProject | Deuxième passage, nouvel angle |
| Mercredi | Article technique | dev.to + Reddit r/opensource | Licence OSI : OK. **Zéro texte IA.** |
| Jeudi | Product Hunt | PH | Audience non-dev, bonus |

Ne jamais poster le même texte dans 3+ subreddits en 24 h : plusieurs subreddits
bannissent pour ça.

---

## 4. Les canaux, et ce qu'ils exigent vraiment

| Canal | Audience | Ce qu'il faut | Piège |
|---|---|---|---|
| r/SideProject | 453 k | « I built… » + détails | Le plus permissif, commence là |
| r/coolgithubprojects | 50–95 k | Lien + description | Peu d'engagement, mais facile |
| r/ClaudeAI | 200 k+ | Karma > 100, construit avec Claude, gratuit, description détaillée | Langage promo = suppression |
| r/webdev | 2 M+ | Showoff Saturday uniquement | Hors créneau = retiré |
| r/opensource | 120–210 k | Licence OSI, flair promo | Texte IA = ban |
| r/programming | 6 M+ | Write-up technique, pas de « I made this » | Texte IA = ban |
| Hacker News | — | Quelque chose qu'on peut essayer tout de suite | Pas de votes demandés, pas de texte généré |
| X | — | GIF + une phrase | Fonctionne si tu as déjà une audience |

**La règle qui tue la plupart des lancements :** le texte doit être écrit par un
humain. Pas de « delve », pas de « it's not just X, it's Y », pas de triplets
d'adjectifs, pas de conclusion qui résume. Les modérateurs de r/programming et
r/opensource bannissent sur ce seul motif.

---

## 5. Brouillons (à réécrire avec tes mots)

Ces textes sont des squelettes. Garde la structure, change les phrases, ajoute du
vécu : ce que tu as raté, combien de temps ça a pris, ce que tu as jeté. Un
lancement qui raconte une vraie construction convertit mieux qu'un communiqué.

### Show HN

> **Show HN: Deckhand – slides that don't look AI-generated**
>
> I use Claude Code for most of my work. The code is fine, the decks it produces
> are not: purple gradient, emoji in the labels, one font weight, everything
> centered.
>
> Deckhand is a small system of eight slide layouts with fixed typography. You
> write one HTML fragment per slide, the build turns it into a self-contained
> HTML file plus PDF and PNG. The fonts are embedded, so it looks the same
> everywhere. No dependencies, no network at build time.
>
> The demo is the deck itself: [link]. Source: [link]. There is an audit script
> that fails if a slide overflows, which is the mistake I kept making.

### r/SideProject

> **I got tired of my AI-generated decks looking like AI-generated decks**
>
> Every deck I asked Claude for came out the same: gradient hero, white body,
> two identical columns, emoji bullets. The content was right, the layout made it
> look cheap.
>
> So I built Deckhand: eight layouts with fixed typography, one CSS file, no
> dependencies. The agent writes the content into the layout instead of inventing
> the layout.
>
> The before/after in the GIF is the same content. It took me a week of
> iterating on the type scale, and three rounds of design review before I
> accepted the result.
>
> Live demo: [link]. Repo: [link]. MIT. Would love feedback on the contrast in
> the dark theme, I'm not sure it survives a projector.

### X (5 tweets)

1. Your agent writes great content and terrible slides. Same content, two
   layouts. [GIF]
2. Eight layouts, one CSS file, zero dependencies. The fonts are embedded, so it
   renders the same on any machine.
3. One HTML fragment per slide. `deckhand build` gives you a 327 KB file, a PDF,
   and one PNG per slide.
4. There's an audit script that fails when a slide overflows — and when the deck
   breaks its own rules: missing kicker, 4th dark slide, external asset, emoji.
   I needed it more than I expected.
5. MIT, available now: [link]

---

## 6. Les 48 h du lancement

- Répondre à **chaque** commentaire dans l'heure. C'est le seul levier sous ton
  contrôle pendant la fenêtre.
- Ouvrir une issue pour chaque retour utile, même mineur : les visiteurs regardent
  la page Issues pour juger si le projet est vivant.
- Ne pas modifier le README pendant les premières 24 h : chaque édition change
  l'image de partage et casse les liens en circulation.
- Noter les critiques récurrentes. Elles deviennent le contenu de la vague 2.

## 7. Ce qu'on mesure

| Moment | Cible | Signal d'échec |
|---|---|---|
| H+6 | 30-50★ | < 10★ : le hook ne prend pas, changer le tweet 1 |
| J+1 | 100-150★ | < 50★ : passer en vague 2 sans attendre le trending |
| J+7 | 300-600★ | < 200★ : le repo n'est pas le problème, l'audience l'est |
| Forks/stars | > 8 % | < 3 % : les gens starrent sans essayer, le README survend |

Si le trending arrive, il dure 24–48 h. Ce qu'on fait pendant cette fenêtre
compte plus que les semaines précédentes.

---

## 8. Après

- Répondre aux issues en public, avec des commits liés.
- Publier un deuxième deck d'exemple (technique, pas commercial) pour montrer que
  le système ne fait pas que des pitchs.
- Si quelqu'un demande un layout, l'ajouter seulement s'il correspond à une forme
  de contenu que les huit ne couvrent pas. Sinon, refuser et expliquer.

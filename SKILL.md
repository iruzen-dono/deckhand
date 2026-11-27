---
name: deckhand
description: Build editorial slide decks as HTML and export PDF/PNG. Use when asked to create a presentation, pitch deck, slide deck, keynote, or to turn a report into slides.
---

# Deckhand

Build a deck as one HTML fragment per slide, then assemble it into a single
self-contained HTML file plus PDF and PNG exports.

The point of this skill is **typography and restraint**. A deck that follows
the layouts below looks like it came from a design studio instead of a model.
A deck that ignores the content rules does not.

## Workflow

1. `deckhand init slides` — seeds `slides/01.html`.
2. Write one file per slide: `slides/01.html`, `slides/02.html`, …
   Files are assembled in filename order.
3. `deckhand build slides dist` — writes `dist/deck.html`, `dist/deck.pdf`,
   `dist/png/NN.png`.
4. `deckhand audit dist` — fails on a layout overflow **or** a contract break:
   missing `data-n` / kicker / heading, duplicate folio, more than 3 dark slides,
   an external asset, an emoji, or a PDF that is not one 16:9 page per slide. **Run it. Fix what it reports. Do not ship a
   deck that fails audit.** `--json` returns the same report as structured data.

## The contract

- One `<section class="slide …">` per file. Nothing else at the top level.
- Set `data-n` to the slide number (`data-n="03"`). It renders as the foliot.
- Every slide starts with a `.kicker` (a 2-4 word label, uppercase, mono).
  This is the only element allowed outside the normal flow.
- Themes: default is `paper` (warm off-white). Add `theme-ink` (near-black) or
  `theme-night` (deep blue) to the section for a dark slide. Use a dark theme
  for at most 3 slides — a section opener, a quote, the closing slide.
- A slide that deliberately shows slop (the "before" panel, for instance) may
  declare `data-allow="emoji"`. That is the only escape hatch; it never applies
  to a slide that is meant to look designed.

## The 8 layouts

| class | use for | key children |
|---|---|---|
| `slide--cover` | first slide | `.display` title, `.meta` block |
| `slide--section` | part opener | `.num` (01, 02…), `.h1` |
| `slide--list` | 3-4 parallel points | `.h2`, `.items` > `.item` (`.n`, `.t`, `.d`) |
| `slide--two-col` | comparison, before/after | `.h2`, `.cols` > `.col` > `h3` + `.body` |
| `slide--quote` | one sentence that matters | `blockquote`, `.attrib` |
| `slide--data` | one number | `.figure` (+ `.unit`), `.row` > `.lede` + `.notes` |
| `slide--full` | image with a caption | `.media` (background-image), `.caption` |
| `slide--end` | last slide | `.display`, `.contact` |

### cover

```html
<section class="slide slide--cover" data-n="01">
  <div class="kicker">Deckhand</div>
  <h1 class="display">Short, declarative title.</h1>
  <div class="meta">
    <div><strong>Subtitle line</strong>second line</div>
    <div style="text-align:right"><strong>v1.0</strong>November 2026</div>
  </div>
</section>
```

### section

```html
<section class="slide slide--section" data-n="02">
  <div class="kicker">Diagnostic</div>
  <div class="num">01</div>
  <h1 class="h1">One claim.<br>Then its consequence.</h1>
</section>
```

### list

```html
<section class="slide slide--list" data-n="03">
  <div class="kicker">Four symptoms</div>
  <h2 class="h2">What betrays a deck written in thirty seconds.</h2>
  <div class="items">
    <div class="item">
      <span class="n">01</span>
      <span class="t">The white background</span>
      <span class="d">Not a choice. The default.</span>
    </div>
    <!-- 3 more .item -->
  </div>
</section>
```

### two-col

```html
<section class="slide slide--two-col" data-n="06">
  <div class="kicker">Before / After</div>
  <h2 class="h2">Same content. Two levels of credibility.</h2>
  <div class="cols">
    <div class="col"><h3>Before</h3><p class="body">…</p></div>
    <div class="col"><h3>After</h3><p class="body">…</p></div>
  </div>
</section>
```

### quote

```html
<section class="slide slide--quote theme-ink" data-n="05">
  <div class="kicker">Principle</div>
  <h2 class="sr-only">Quote</h2>
  <blockquote>Less, but better.</blockquote>
  <div class="attrib">Dieter Rams</div>
</section>
```

The `.sr-only` heading is required — the validator flags sections without one.

### data

```html
<section class="slide slide--data" data-n="04">
  <div class="kicker">The system</div>
  <h2 class="figure">8<span class="unit">&nbsp;layouts</span></h2>
  <div class="row">
    <p class="lede">One sentence that explains what the number means.</p>
    <div class="notes">
      <p class="small">Supporting fact with a left rule.</p>
      <p class="small">Second supporting fact.</p>
    </div>
  </div>
</section>
```

The figure **is** the slide's heading. Never repeat it in the lede.

### full

```html
<section class="slide slide--full" data-n="07">
  <div class="media" style="background-image:url('plate.svg')"></div>
  <div class="caption">
    <h3>Caption title</h3>
    <p>One line of context. Not a paragraph.</p>
  </div>
</section>
```

The image is referenced relative to the slide directory; the build copies
non-HTML assets next to the output. Use a dark image — the caption is white.

### end

```html
<section class="slide slide--end theme-ink" data-n="08">
  <div class="kicker">Deckhand</div>
  <h1 class="display">Install it.</h1>
  <span class="contact"><span>git clone github.com/iruzen-dono/deckhand</span><span>iruzen-dono.github.io/deckhand</span></div>
</section>
```

## Content rules

These are what separate a designed deck from a generated one.

1. **One idea per slide.** If you need "and", split it.
2. **Titles are claims, not labels.** "Revenue" is a label. "Revenue doubled
   while headcount stayed flat" is a claim.
3. **Six lines maximum** of body text per slide. Count them. Cut.
4. **One accent per slide.** The accent colour appears in the kicker, or in one
   word, or nowhere. Never in three places.
5. **Numbers are specific.** "23%" not "significant". If you don't have the
   number, don't fake it — write the sentence without a figure.
6. **No emoji. No bullet glyphs. No stock-photo gradients.** Ever.
7. **Sentence case for titles.** Not Title Case, not ALL CAPS.
8. **The foliot stays.** Don't hide it with CSS.

## Anti-patterns (the slop signature)

Reject these on sight:

- A gradient hero with a white body and two equal columns.
- A badge pill above the title.
- Emoji used as iconography (🚀 ✅ 📈).
- Three font weights of the same sans-serif, or a heading in bold Arial.
- A "Key insights / Next steps" split where both sides say the same thing.
- Centring everything.
- Filling the page because empty space feels unfinished.

If the source material is thin, produce **fewer slides**, not more decoration.

## Content-to-layout mapping

| You have | Use |
|---|---|
| A single number that changes the argument | `data` |
| Two options being compared | `two-col` |
| A list of 3-4 parallel causes | `list` |
| A sentence you want remembered | `quote` |
| A turning point in the narrative | `section` |
| A full-bleed visual | `full` |

## Checklist before delivering

- [ ] `deckhand audit dist` returns 0 defects (layout **and** contract)
- [ ] Every slide has a kicker
- [ ] No slide exceeds 6 lines of body copy
- [ ] Dark theme used on at most 3 slides
- [ ] The deck opens with a claim, not an agenda
- [ ] The deck ends with an action, not "Thank you"
- [ ] `dist/deck.pdf` exists and has one page per slide

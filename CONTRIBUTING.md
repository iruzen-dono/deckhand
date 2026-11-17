# Contributing

Deckhand is a design system, so the bar for changes is visual, not procedural.

## Before you open a PR

1. `node bin/deckhand.js build examples/pitch dist` — must succeed.
2. `node bin/deckhand.js audit dist` — must report zero overflows.
3. Look at `dist/png/*.png`. If a change alters a slide, attach a before/after image.

## What gets accepted

- Fixes that make an existing layout more robust (overflow, wrapping, contrast).
- New layouts **only** if they answer a content shape the eight existing ones cannot.
  Open an issue first, with an example of the content and why `two-col` or `list` fails.
- Contrast fixes: text must stay ≥ 4.5:1, structural rules ≥ 3:1.
- Anything that removes a dependency is welcome. Anything that adds one is not.

## What gets rejected

- New colours, gradients, shadows, or a second accent.
- A ninth layout that is a variation of an existing one.
- Fonts that require a network request at build or render time.
- Text written by a model and pasted unreviewed. We read what you write.

## Style

- CSS in `assets/deck.css`, French comments are fine, English identifiers.
- One concern per commit. `feat:`, `fix:`, `docs:` prefixes.
- No build step for the CSS. It is hand-written on purpose.

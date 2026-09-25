# HMS post-image spec

The card is a branded text image: HMS crown-and-wordmark, an editorial serif
quote, attribution, and the domain. It must read as the same brand as the site.

## Image sizes (research-backed)

X shows an image **uncropped in the timeline** when its aspect ratio sits between
~16:9 and ~3:4; outside that it center-crops. Replies and embeds may still preview
around 1.91:1, so keep every glyph inside a centered horizontal safe band.

| `{{SIZE}}` | pixels | ratio | use |
|---|---|---|---|
| `4x5` | **1080 × 1350** | 4:5 portrait | **default** — most feed height on mobile, still uncropped |
| `1x1` | 1200 × 1200 | square | safe everywhere; also reusable on the IG account |
| `16x9` | 1600 × 900 | landscape | link-style posts, wide photos, headline lines |

Export **PNG** (text needs it), keep under **5 MB**. Rendering at
`--force-device-scale-factor=2` (a 2× file) is preferred for sharpness.

## Color tokens (mirror of `site.css`)

| role | `paper` (light) | `ink` (dark) |
|---|---|---|
| background | `#EFEDE8` | `#141006` |
| text (`--ink`) | `#141006` | `#EFEDE8` |
| muted (`--muted`) | `#82714A` | `#9A8C6C` |
| hairline (`--rule`) | `rgba(20,16,6,.18)` | `rgba(239,237,232,.18)` |
| accent (`--accent`) | `#1D3263` | `#1D3263` |
| gold emphasis | `#C9A75D` | `#C9A75D` |

- Default to **`paper`**. Use `ink` for verse cards or a somber quote.
- Accent navy is for a thin top rule or nothing — not body text.
- Gold is emphasis only (an italicized word), used at most once per card.

## Type

- Family: `"Baskerville", "Libre Baskerville", "Baskerville Old Face", Georgia, serif`
  (same stack as the site; the card also `<link>`s Libre Baskerville from Google
  Fonts so headless render matches the owner's Mac).
- **Quote / statement / verse body:** italic, weight 400, `line-height: 1.28`,
  centered. Auto-fit shrinks it to fit its box (see below).
- **Attribution name:** roman, weight 400, `--muted`.
- **`@handle`, `REF` line, footer:** weight 700, uppercase, `letter-spacing: .24em`,
  `--muted`, small.

## Card anatomy (proportions; `card.html` sets exact px per size)

```
┌─────────────────────────────┐
│         [ crown + wordmark ] │  logo, centered, ~14% of card width
│                             │
│   PSALM 16:11 · KJV         │  .ref — verse cards only
│                             │
│      “ the quote runs        │  .quote — italic, centered, auto-fit,
│        two or three          │           max-width ~82%
│        lines, centered ”     │
│                             │
│      — Douglas Wilson        │  .attrib-name
│        @douglaswils          │  .attrib-handle
│                             │
│            ───              │  .rule — 48px hairline
│     HISMAJESTYSSONS.COM      │  .footer
└─────────────────────────────┘
```

- **Padding:** ~9% of the shorter edge.
- **Safe band:** keep all text within the centered 1.91:1 slice of the card so a
  reply/embed crop never cuts a word.
- **Statement cards:** no attribution block; the quote sits optically centered.
- **Verse cards:** `.ref` above the quote; prefer `ink` scheme; `cross` background
  is on-brand here.

## Logo

- File: `assets/logo-vertical.svg` (crown mark above the wordmark), passed as
  `{{LOGO_SRC}}` = `../../../assets/logo-vertical.svg` (relative from the post dir).
- It is solid black artwork. In `ink` scheme the card applies `filter: invert(1)`
  to make it paper-white — same trick as the site nav/footer.

## Background

- `plain` — flat paper/ink, the default.
- `cross` — a cross-potent ("Crusader cross") tile in the hairline color at low
  opacity, ported from `social-engine/src/backgrounds/CrossBackground.jsx`. Subtle;
  never competes with the text. Good for verse and Make-War cards.

## Alt text

Write it so a screen-reader user gets everything a sighted user does:

> Text card. "<the full quote>" — <Full Name>, <@handle>. His Majesty's Sons.

Keep under 1000 characters.

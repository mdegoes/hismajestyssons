# His Majesty's Sons — Social Engine

Generates on-brand social video clips (HMS logo + your text, with optional background music) for sharing on Instagram and X.

Standalone Node/[Remotion](https://www.remotion.dev) tooling, same shape as `../stripe-setup/` — its own `package.json`, gitignored `node_modules`, not part of the deployed static site, no build-step impact on the site itself.

## Setup

```bash
cd social-engine
npm install
```

## Preview & edit interactively

```bash
npm run studio
```

Opens Remotion Studio in your browser — this is the interface for entering your own text. Pick the **Square** or **Vertical** composition in the left sidebar, then use the **Properties** panel on the right: `text` is a real textarea field (type your caption there), `track` is a dropdown of the music in `public/music/` (see below), and `background` is a dropdown of CSS backdrop styles (see below). The preview updates live as you type, scrub the timeline to see the animation, and there's a **Render** button in the top right that renders straight from the Studio UI — no CLI needed once you're happy with it.

(This form UI comes from the Zod schema attached to each `<Composition>` in `src/Root.jsx`/`src/schema.js` — without it Remotion would only offer a raw JSON editor for props.)

## Render

```bash
npm run render:square      # 1080x1080, out/square.mp4
npm run render:vertical    # 1080x1920, out/vertical.mp4
```

To render with real props from the command line instead of Studio:

```bash
npx remotion render src/index.jsx Square out/square.mp4 \
  --props='{"text":"Come, let us walk in the light of the Lord.","track":"Hymn of Ascent"}'
```

## Caption text

The `text` prop doesn't just fade onto screen — it types in character-by-character, like someone typing it, with a blinking cursor. Typing speed scales with caption length (`getCharsPerFrame` in `SocialPost.jsx`) so a short and a long caption both finish typing in roughly the same few seconds, instead of a long one dragging on or a short one blipping by instantly. The tagline fades in right after typing finishes, whenever that ends up being.

The first 0.5s of every clip instead shows the whole scene already finished — full caption typed out, tagline visible, no cursor — before hard-cutting into the real animation from the start. This is deliberate: a shared link's static preview thumbnail is usually the video's very first frame, and without this a shared link could preview as blank or mid-animation. These timings (`TARGET_TYPE_FRAMES`, `PREVIEW_HOLD_FRAMES`, etc.) are constants at the top of `SocialPost.jsx` if the pacing ever needs adjusting.

Font size also auto-shrinks as the caption gets longer (`getTextFontScale`), so a long caption wraps to more, smaller-type lines instead of bleeding past the tagline at the bottom of the frame.

## Adding music

Drop an MP3/WAV into `public/music/` and it shows up as an option in the `track` dropdown — no code changes needed. The dropdown label is the filename with its extension stripped (Zod enums have no separate display-name field, so the raw value *is* the label), so name your files the way you want them to read, e.g. `Hymn of Ascent.mp3` rather than `track1.mp3`.

The track list lives in the auto-generated `src/tracks.js`, rebuilt from `public/music/` by `scripts/generate-tracks.js`. That script runs automatically before `npm run studio` and `npm run render:*` (via npm's `pre*` hooks), so dropping in a new file just needs a Studio restart (or a re-render) to appear — you only need to run `npm run sync-tracks` by hand if you want to check the generated list without launching Studio. Don't hand-edit `src/tracks.js`; it's overwritten on the next sync.

Pick `none` for a silent video (the default). Whichever track is selected fades in/out over the first and last second so it doesn't cut abruptly, and playback is automatically bounded to the clip's length.

**You need the rights to use the track** — this only handles the mixing, not licensing. Use royalty-free music or your own recordings; copyrighted music risks the post getting muted or taken down on IG/X.

### Choosing which part of the track plays

By default a track plays from its own beginning. `audioStartSeconds` (a number field in Studio, seconds into the source file) shifts that starting point without changing the clip's own length — e.g. `"audioStartSeconds": 42` plays from the 42-second mark of the track for the clip's usual 8 seconds.

Figure out a good offset by ear in any music player (note the timestamp of the moment you want the clip to start), then type that number into `audioStartSeconds` in Studio (or `--props`).

If that number is too close to (or past) the track's actual end, there isn't enough of the file left to fill the clip — this used to fail silently (the render just came out with no sound and no explanation). `npm run sync-tracks` now also records each track's real duration (via `ffprobe`), and Studio will reject an out-of-range `audioStartSeconds` with a message naming the track's length and the max valid value, instead of quietly rendering silence. This needs `ffprobe` (part of [ffmpeg](https://ffmpeg.org)) on your `PATH` — if it's missing, `sync-tracks` prints a warning and skips this check rather than blocking on it, so no `ffmpeg` install is strictly required, just recommended.

## Backgrounds

The `background` prop picks a CSS-only backdrop, no external image assets involved. Options: `none`, `grid`, `diagonal`, `cross` (a repeating cross-potent / "Crusader cross" tile, drawn as an inline SVG rather than a font glyph — see note in `CrossBackground.jsx`). Defaults to `grid`. Pick one from the dropdown in Remotion Studio's Properties panel, or pass it in `--props`.

Any background built from a tiled raster/SVG `background-image` (like `cross`) needs `imageRendering: 'pixelated'` plus an integer (rounded) `backgroundSize` — without both, Chromium's default image scaling visibly blurs hard edges at most tile sizes. Pure CSS `linear-gradient`/`radial-gradient` backgrounds (like `grid`/`diagonal`) don't have this problem since the browser paints them directly rather than rasterizing-then-scaling an image.

To add a new one: drop a component in `src/backgrounds/` (see `GridBackground.jsx` for the shape — it receives `width`/`height` and renders an `<AbsoluteFill>`), register it in the `BACKGROUNDS` map in `src/backgrounds/index.jsx`, and add the same key to the `background` enum in `src/schema.js`. Those two spots are the only place the list of variants lives — no shared source of truth beyond keeping the keys matched by hand.

## Formats

| Composition | Ratio | Resolution | Covers |
|---|---|---|---|
| `Square` | 1:1 | 1080×1080 | IG feed, X feed |
| `Vertical` | 9:16 | 1080×1920 | IG Stories/Reels, X (accepts up to 1:3) |

Both render at 30fps, 8s by default (`DURATION_IN_FRAMES` in `src/tokens.js`).

4:5 (IG feed) and 16:9 (X landscape) can be added later as additional `<Composition>` entries in `src/Root.jsx` — the `SocialPost` component already sizes everything off `width`/`height`, so no layout changes should be needed.

## Brand tokens

`src/tokens.js` mirrors the light-mode color tokens from `../site.css` (`:root`). There's no shared build step between the site and this tool, so if the site's palette changes, update `tokens.js` by hand. Typeface is Libre Baskerville, loaded via `@remotion/google-fonts` so it renders correctly in the headless-Chromium render environment (which won't have it installed as a system font).

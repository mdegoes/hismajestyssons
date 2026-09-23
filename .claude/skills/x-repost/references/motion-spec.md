# HMS motion clips — `social-engine` integration

An optional animated alternative (or companion) to the static card in
`visual-spec.md`: an 8s video of the HMS logo popping in, the post text typing
out character-by-character, then the tagline fading in — with an optional
music bed. Built with `social-engine/`, the repo's standalone
Node/Remotion tool (see `social-engine/README.md` for the full mechanics —
this file only covers how `x-repost` drives it).

**Always ask before building one.** Unlike the static card (cheap, always
built for a full package), a render takes real wall-clock time and — the
first time in a session — an `npm install`. Ask once the post text is locked:
*"Want an animated clip too, or just the static card?"*

## Setup (once per session, if not already done)

```bash
cd social-engine
[ -d node_modules ] || npm install
npm run sync-tracks   # regenerates src/tracks.js — cheap, safe to always run
```

`sync-tracks` needs `ffmpeg`/`ffprobe`; if neither is on `PATH` it falls back
to the copy Remotion already downloaded into
`node_modules/@remotion/compositor-*/`, so this works out of the box after
`npm install` with no separate `brew install ffmpeg`.

## Choosing text, background, and track

- **Text** — the same chosen post variant from `post.md` (the caption typing
  animation handles anything up to ~280 characters; font auto-shrinks for
  longer captions). Don't add the source link or @-credit into `text` — this
  clip is a standalone visual, not a quote-post embed.
- **Background** — `none`, `grid` (default), `diagonal`, `cross`. Same
  four options as the static card's `{{BG}}` conceptually, but the motion
  tool's enum is only `none`/`grid`/`diagonal`/`cross` (no `plain` — use
  `none`).
- **Track** — `none` (silent) or one of the files in `public/music/`, read
  live from `src/tracks.js`'s `TRACKS` export (don't hand-maintain a copy of
  the list here — it changes as tracks are added).

**Suggest a pairing, then let the owner override.** Starting points by pillar
— these are illustrative, not binding; read the actual post's tone before
picking:

| Pillar | Background | Track starting points |
|---|---|---|
| **Lead** (family worship, headship, fatherhood) | `none` or `grid` — calm, undistracting | *A Mighty Fortress Is Our God* · *Am I a Soldier of the Cross* |
| **Learn** (books, steady minds) | `grid` | *Canticle of the Turning* · *Watchman's Balad* |
| **Make War** (spiritual warfare, courage, the fight) | `cross` or `diagonal` — more charged | *King Alfred's War Song* · *The Son of God Goes Forth to War* · *War Song* |
| **Build** (home, work, craft, the long view) | `grid` or `diagonal` | *Rise Again Ye Lion-Hearted* · *Canticle of the Turning* |

A somber/hard-teaching post (cf. the Foster idolatry-reframe post) can still
suit a quieter Lead-pillar hymn even if the content is heavier — match the
music's register to the post's tone, not just its pillar.

## `audioStartSeconds` — don't default to 0

A track's first ~30–90s is often a sparse instrumental intro — starting an 8s
clip at `0` frequently produces a clip with no melody or vocals at all (this
was the original bug: an *A Mighty Fortress* clip that only ever played the
intro). `src/tracks.js` exports `TRACK_SUGGESTED_START`, a per-track offset
computed by `scripts/generate-tracks.js`: the first point where the mix's RMS
loudness sustains at least 6dB above the track's own opening baseline for 3+
seconds — i.e. the first place it gets meaningfully fuller/busier than the
cold open.

**This is a loudness heuristic, not lyric or vocal detection** — nothing in
this toolchain listens for words. Treat it as "probably past the intro," not
"guaranteed to have singing." A `null` value means no clear rise was found
(a consistently-loud track) or duration/ffmpeg wasn't available — pass `0`
in that case.

**Once the owner has actually listened and picked an exact second**, record
it in `scripts/track-start-overrides.json` (`{"<track key>": <seconds>}`) and
rerun `npm run sync-tracks` — an override there wins over the heuristic on
every future regeneration and shows up in `TRACK_SUGGESTED_START` with an
`// owner-confirmed by ear` comment (also listed in the new
`TRACK_START_CONFIRMED` export). Don't hand-edit `src/tracks.js` itself, it's
overwritten on the next sync same as always.

Always look up and pass `TRACK_SUGGESTED_START[track]` explicitly in
`--props` rather than omitting `audioStartSeconds` (which defaults to `0` in
the schema — Zod can't default one field off another, so the smarter value
only applies if the caller supplies it). All 8 are now owner-confirmed by ear
(`scripts/track-start-overrides.json` — see `TRACK_START_CONFIRMED` in
`src/tracks.js`), current as of this file's last edit:

| Track | Confirmed start | Duration |
|---|---|---|
| A Mighty Fortress Is Our God | 48s | 187s |
| Am I a Solder of the Cross_ | 39s | 182s |
| Canticle of the Turning | 53s | 235s |
| King Alfred's War Song | 26s | 147s |
| Rise Again Ye Lion-Hearted | 18s | 185s |
| The Son of God Goes Forth to War | 80s | 193s |
| War Song | 34s | 214s |
| Watchman's Balad | 26s | 514s — long file, possibly a multi-song compilation |

If the owner has a specific moment in mind (e.g. a track's chorus), they can
always give a timestamp directly — that overrides the suggested default.

## Rendering — both formats, no extra cost

Render **both** `Square` (1080×1080 — IG feed, X feed) and `Vertical`
(1080×1920 — IG Stories/Reels, X) by default once a clip is wanted; it's just
two CLI calls, not two rounds of drafting, and lets the owner pick the better
fit for wherever they're posting:

```bash
cd social-engine
SLUG="<post-slug>"
PROPS='{"text":"<post text>","track":"<track key>","audioStartSeconds":<n>,"background":"<bg>"}'

npx remotion render src/index.jsx Square   "posts/$SLUG/video-square.mp4"   --props="$PROPS"
npx remotion render src/index.jsx Vertical "posts/$SLUG/video-vertical.mp4" --props="$PROPS"
```

(Render straight into the post's package folder — no separate copy step.)

## Reviewing before handing off

Video can't be read/viewed the way `Read` shows a PNG. Spot-check with a
still frame instead — same composition, a `--frame` near the end (fully
typed caption, tagline visible, cursor at rest) is the most informative:

```bash
npx remotion still src/index.jsx Square "posts/$SLUG/video-square-preview.png" \
  --props="$PROPS" --frame=239
```

Read that PNG, check the same things as the static card (nothing clipped,
centered, contrast holds), then delete the preview PNG — it's a review aid,
not a deliverable (don't leave stray preview stills in the package folder).

**Audio content itself can't be verified this way** — there's no tool in
this environment to listen to or transcribe the rendered clip's audio.
Flag the chosen track/offset to the owner in `post.md` and let them do a
final by-ear check before publishing, same as any other claim this skill
can't independently verify.

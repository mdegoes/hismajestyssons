---
name: x-repost
description: >-
  Research a topic, curate content to amplify on the His Majesty's Sons X account
  (@HisMajestysSons), and draft the post plus a matching on-brand image. Use for
  "research this topic", "x post", "repost", "quote tweet", "twitter", "what should
  we post", "amplify", "social post". Sources from the Worthy Men roster AND
  discovers new brand-synergizing voices. Produces a local (gitignored)
  package under social-engine/posts/ — it never posts to X directly.
---

# x-repost — curate, draft, and package on-brand X posts

Runs the whole pre-publish workflow for the His Majesty's Sons X account
(**@HisMajestysSons**): research a topic, find things worth amplifying, draft the
post in HMS voice, build a branded image, and drop a ready-to-post package into
`social-engine/posts/`.

**This skill never publishes.** It hands the owner a package they post by hand.

## Reference files (read the ones a run needs)

- `references/brand-voice.md` — voice, lexicon, theology guardrails, sample posts. **Read before drafting any text.**
- `references/visual-spec.md` — colors, type, card anatomy, image sizes. **Read before building an image.**
- `references/sourcing.md` — topic research + candidate discovery + the scoring rubric.
- `references/vetting.md` — checklist for judging a non-roster account before amplifying it.

## Workflow

### 1. Intake

Figure out the mode from what the owner gave you:

| Owner gave… | Mode |
|---|---|
| a topic/theme (incl. `/x-repost <topic>`) | **topic** — research, then source, then draft |
| "check the roster" / nothing | **roster** — skip deep research, scan roster + this week |
| an X link / article URL / a pasted quote | **link** — skip research, go straight to draft |

Then ask two things (one message):
- How far to take it: **brief only** · **through drafting** (text, no image) · **full package**.
- Any constraints (pillar to favor, a specific person, tone, deadline).

Confirm the target account is **@HisMajestysSons**.

### 2. Topic research  *(topic mode only)*

Follow `references/sourcing.md`. Produce a brief at
`social-engine/posts/research/<YYYY-MM-DD>-<topic-slug>.md` with this structure:

```
# <Topic> — research brief (<date>)

## Summary
3–5 sentences: what the conversation is right now, why it matters to HMS.

## What's being said
Positions in play and who holds them. Note where the Reformed / aligned take
diverges from the mainstream one.

## Key voices
- **Roster:** <name> (@handle) — <what they've said on this>
- **Newly discovered:** <name> (@handle) — <why brand-synergizing> — vetting: <amplify | with-care | pass>

## Notable posts / threads / articles
- <linked item> — <author> — <one-line gist> — <engagement if from X>

## HMS angles
2–4 angles, each tagged to a pillar (Lead / Learn / Make War / Build).

## Candidate posts
Things HMS could amplify or write, feeding step 4.
```

If the owner asked for **brief only**, stop here and show them the brief path.

### 3. Source candidates

Follow `references/sourcing.md`. Two lanes, **both required** in topic/roster mode:

1. **Roster** — read the live handle list from `worthy-men.html` (each
   `<article class="person">` has `data-categories`, `data-tier`, and
   `.person-links a[href*="x.com"]`). Open the relevant members' profiles via
   Claude-in-Chrome (the owner's logged-in Chrome), collect recent posts.
2. **Discovery beyond the roster** — do **not** source only from known accounts.
   Find brand-synergizing voices via (a) top authors on the topic, (b) accounts
   the roster is quote-posting / replying to / reposting, (c) authors the aligned
   outlets cite. **Vet each** against `references/vetting.md` before recommending.

Fragility guard: if X scraping fails 2–3 times, stop and ask the owner to paste
links (per the repo's rabbit-hole convention in `CLAUDE.md`).

### 4. Shortlist & score

Present one markdown table:

| # | source | @handle | roster/NEW | link | gist | pillar | fit | treatment | risk flags |

- `treatment` ∈ *straight repost* · *quote-post + commentary* · *original post inspired by*.
- Scoring rubric is in `references/sourcing.md`; put the scores in `source.md` later.
- Flag every non-roster row as **NEW — needs your eyeball** and give its vetting verdict.
- For a strong NEW voice, optionally suggest adding them to `worthy-men.html`.

Let the owner pick one or more. If they picked **brief only** earlier, you're done.

### 5. Draft the post

Read `references/brand-voice.md` first.

- Choose post type. Prefer **quote-post with commentary** over a screenshot with
  no link. Always @-credit the original author.
- Write **2–3 text variants**, each **≤ 280 characters**, in HMS voice. Check the
  "Published posts" section of `brand-voice.md` for the current register.
  - Verb-first imperative lists, not noun fragments. Offer one variant using the
    hard-negation device ("Not ___, not ___, not the state. [answer].").
  - No hashtags unless the owner asks.
  - `Deus vult.` is an occasional sign-off, not a default — at most one variant.
- Write **alt text** for the image (≤ 1000 chars): the full quote + who said it +
  "text card" so a screen reader conveys everything.
- List any **claims to verify** and a one-line **tone check**.

If the owner asked for **through drafting**, write `post.md` + `source.md` and stop.

### 6. Build the image  *(full package only)*

Read `references/visual-spec.md` first. Pick a card type:

- **quote** — someone else's words (attribution + @handle)
- **statement** — an HMS line (manifesto register, no attribution)
- **verse** — a KJV scripture block (adds a `PSALM 16:11 · KJV` ref line)

Then:

1. Copy `assets/card.html` → `social-engine/posts/<slug>/card.html` and replace
   every `{{TOKEN}}`:

   | token | value |
   |---|---|
   | `{{CARD_TYPE}}` | `quote` \| `statement` \| `verse` |
   | `{{SIZE}}` | `4x5` (default) \| `1x1` \| `16x9` |
   | `{{SCHEME}}` | `paper` (default) \| `ink` |
   | `{{BG}}` | `plain` (default) \| `cross` |
   | `{{REF}}` | verse ref like `Psalm 16:11 · KJV`, else empty |
   | `{{QUOTE}}` | the quote / statement / verse text (HTML-escape `& < >`) |
   | `{{ATTRIB_NAME}}` | `Doug Wilson`, else empty (statement/verse) |
   | `{{ATTRIB_HANDLE}}` | `@douglaswils`, else empty |
   | `{{LOGO_SRC}}` | `../../../assets/logo-vertical.svg` (relative from the post dir) |

2. Render it to PNG with the installed Chrome (no new install — this is the
   binary Claude-in-Chrome already uses):

   ```bash
   DIR="$(pwd)/social-engine/posts/<slug>"
   # dims per {{SIZE}}: 4x5 → 1080x1350 · 1x1 → 1200x1200 · 16x9 → 1600x900
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless=new --disable-gpu --hide-scrollbars \
     --force-device-scale-factor=2 --virtual-time-budget=2500 \
     --window-size=1080,1350 \
     --screenshot="$DIR/image.png" \
     "file://$DIR/card.html"
   ```

   The `--force-device-scale-factor=2` gives a 2× file (e.g. 2160×2700) — keep it,
   it's sharper and well under X's 5 MB cap. To force an exact 1× size instead:
   `sips -s format png -z 1350 1080 "$DIR/image.png" --out "$DIR/image.png"`.

3. **Look at `image.png`** (Read it). Check: nothing clipped, quote centered in
   the safe band, attribution present, contrast holds, logo inverted correctly in
   `ink`. If the quote is too long for the box even after auto-fit, shorten it or
   move to a bigger `{{SIZE}}` and re-render.

   *(Alternative for statement/verse cards: `social-engine` can render a still —
   `cd social-engine && npx remotion still src/index.jsx Square out/still.png
   --props='{"text":"…","background":"cross"}'` — frame 0 is already fully
   composed. Use only if the HTML card is fighting you.)*

### 7. Assemble the package

Write `social-engine/posts/<YYYY-MM-DD>-<slug>/`:

| file | contents |
|---|---|
| `post.md` | chosen variant (marked), all variants, **alt text as a ready-to-paste block** (the owner tends to skip adding it — make it copy-paste trivial), post type, credit @handle, source URL, claims-to-verify, tone check |
| `image.png` | the final card (skip for text-only runs) |
| `card.html` | the filled template (reproducible) |
| `source.md` | source link · snapshot of what's being amplified · fit rationale · rubric scores · NEW-account vetting notes · link to the research brief if any |
| `PUBLISH.md` | the numbered checklist below, filled in |

`PUBLISH.md` template:

```
# Publish checklist — <slug>

1. Sign in to x.com as @HisMajestysSons.
2. <if quote-post> Open <source URL>, click Repost → Quote.
   <if standalone> Click Post.
3. Paste the post text from post.md (the ✅ variant).
4. Attach image.png.
5. Click the image → "Add description" → paste the alt text from post.md.
6. Review the preview on mobile width. Post.
```

Finally, print the checklist to the owner and stop. Do not post.

### 8. Record a posted result  *(when the owner comes back with a live URL)*

If the owner says "I posted this: <x.com URL>" — analyze and record it:

- Fetch the tweet without the browser via
  `https://api.fxtwitter.com/<handle>/status/<id>` (returns JSON: exact text,
  quote/reply status + parent, media dims, alt text, engagement).
- Write `POSTED.md` into the matching package folder: URL, timestamp, post type,
  whether this package's `image.png` was used (compare media dimensions), whether
  alt text was added, the **final text as published**, and a diff vs. the draft
  (what the owner changed and what that teaches about their voice).
- Add a `→ POSTED <date>: <url>` line to the research brief's candidate table.
- If the final text is a good calibration sample, append it to the "Published
  posts" section of `references/brand-voice.md`.
- If it's an unplanned post with no package folder, create one from the URL alone
  (`<date>-<slug>/POSTED.md` + a stub `source.md`).

## Guardrails

- Never publish to X, never DM, never follow/like/repost from the account.
- Never amplify an account that failed vetting; when unsure, `pass` and say why.
- Quote people's exact words; link back; credit by @handle.
- Keep everything ≤ 280 chars and in voice — check against `brand-voice.md`.
- `social-engine/posts/` is gitignored (local-only). Don't put secrets or
  unpublished drafts you were told to keep private there.

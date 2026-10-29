---
name: song
description: >-
  Compose and refine songs and hymns for His Majesty's Sons — rich in biblical
  imagery, masculine in voice, Reformed in theology, with strict meter, true rhyme,
  and tight internal cohesion — then run sequential line-by-line reviews until the
  piece is ready to publish. Use whenever the owner wants to write, finish, revise,
  tighten, or review a song, hymn, anthem, ballad, psalm setting, chorus, bridge, or
  verse; turns a theme, a scripture passage, an idea, rough starting text, or
  complete lyrics into a finished song. Triggers on "song", "hymn", "lyrics",
  "verse", "chorus", "bridge", "psalm setting", "metrical psalm", "rhyme", "meter",
  "write a song about", "tighten these lyrics", "review my song", "/song".
---

# song — write it, then review it until it's ready

The owner brings raw material: a theme, a passage, an idea, a few lines, or a
full draft. You work with them to turn it into a finished song, then keep
running full line-by-line reviews until one comes back clean and the owner
approves it.

The target sound is roughly **John Donne + Tennyson + John Wesley**:
- Donne's paradox and conceit, where one image turns inside out (sun / Son).
- Tennyson's music and clean meter.
- Wesley's doctrine carried by strong, singable hymn lines.

The voice is **masculine**. God is King, Commander, Rock, and Judge. His Word is a
sword and bedrock. A man's answer is to stand, march, hold the line, and bow.

## Reference files

Read these before your first draft or review in a session. Each one is distilled
from real misses, so they are worth the time.

- `references/craft.md` covers meter, rhyme, imagery, cohesion, and arc:
  syllable rules, hymn meters, what counts as a forced rhyme, and mixed metaphors.
- `references/voice-and-theology.md` covers masculine register, Reformed
  guardrails, how to handle Scripture, and phrases that sound soft.
- `references/review.md` describes the review passes, the table format, the
  failure taxonomy (with examples of each), and the publish-ready checklist.

## Files

Each song lives in `songs/<slug>/`. The folder is gitignored and local-only;
the Pages deploy never sees it.

- `song.md` holds the **current** lyric sheet, using the format below. Overwrite
  it every round so it always holds the latest agreed version.
- `review-log.md` is append-only. Each round adds a dated entry covering what
  changed, why, and the open questions. It lets a later session pick up without
  re-deriving decisions the owner already made.

`song.md` format (the scanner script parses it):

```
# <Title>

<!-- meter: verses 8.8.8.8 D iambic ABAB CDCD · chorus 8.7.8.7 D trochaic · bridge 6.6.6.6 D -->
<!-- form: V1 V2 C V3 C V4 B V5 FC -->
<!-- tune: new composition | existing tune name(s) -->
<!-- source: Psalm 19 (KJV) -->

[Verse 1: Valor] (unison, steady)
The warrior stands, to valor sworn;
...

[Chorus] (full)
...
```

Write each repeated chorus out in full only the first time. After that, use a
bare header such as `[Chorus]`. Write a variant chorus out in full, e.g.
`[Final Chorus]`. A parenthetical after a header gives the performance note:
dynamics and who sings it, e.g. `(fathers alone)` or `(key lift, everyone)`.
The scanner ignores these notes.

Check syllable counts mechanically with the scanner. It's heuristic, so treat
what it flags as leads to verify by ear, not verdicts:

```bash
python3 .claude/skills/song/scripts/scan.py songs/<slug>/song.md
```

## Workflow

### 1. Intake

Start by working out what the owner handed you:

| Owner gave… | Start at |
|---|---|
| a theme, idea, or passage | **2. Plan**, then draft from scratch |
| starting text (a few lines, a code, a prayer) | **2. Plan** around it. Keep their lines as anchors wherever they are sound. |
| full lyrics | **4. Review** straight away. Their draft is the baseline. |
| an edit to a song already in `songs/` | read `song.md` and `review-log.md`, then **4. Review** |

If the owner specified a form ("one verse per virtue", "with a bridge and
crescendo"), that form is a requirement. Honor it exactly.

If it's unclear who will sing it, ask one short question: congregation, solo, or
band. The answer changes how complex the meter and vocabulary can be. Otherwise,
don't interview the owner. Draft, and let the draft be the question.

### 2. Plan

Settle these before writing lines, and show the owner the plan in two or three
lines above the first draft:

- **The source's own structure.** Psalm 19, for example, moves heavens → law →
  heart. The song should follow that movement, not a generic verse/chorus
  template.
- **Meter per section, and a tune plan.** Use a real hymn meter from `craft.md`
  for every section, and give the chorus and bridge a contrasting meter, because
  the contrast is what makes them feel like arrivals. Be aware that a song with
  two or three meters needs a **newly composed tune**. Existing hymn tunes then
  work only as stand-ins for trying out single sections. If the owner wants a
  congregation to sing it to a tune people already know, drop the verse/chorus
  form and write strophic stanzas in one meter. Record the choice in the
  `tune:` comment.
- **Parts.** When the song has groups (fathers and sons, pastor and
  congregation, solo and choir), decide who sings each section. Check every "I"
  and "my" against every voice that sings it: "my father's hands" means
  something different in a father's mouth. Follow the source's own shifts,
  such as Ps. 144:12 moving from "I" to "our sons".
- **Rhyme scheme per section**, applied consistently.
- **Two or three threads**: images or key words that recur and develop. Examples
  are fire, running, voice, and rock. Threads are what make a song feel whole
  instead of listed.
- **The hinge and the crescendo.** Decide where the song turns (usually the
  bridge) and what the last line lands on. The last line should land on God, not
  on the man.

### 3. Draft

Write the full song. Then review it yourself (step 4) before you show any of it.
A first draft with forced rhymes and mixed metaphors wastes one of the owner's
review rounds. **Don't show the owner the tables from that self-review.**
Record the changes in `review-log.md` as round 0 and present the improved draft.
The line-by-line tables start with the first round the owner responds to.

When you present the draft, include:
- the lyric sheet;
- a short "how it's built" note covering the source structure, threads, and
  crescendo;
- no more than three **judgment calls**: places where you made a choice the
  owner might reasonably make differently.

### 4. Review (repeat until a pass is clean)

Follow `references/review.md`. In brief:

1. Audit **every line**, not just the ones that look suspicious. For each line,
   check sense, syntax, meter, rhyme, imagery, theology, voice, and whether it
   connects to the next line and section.
2. Run `scan.py` and confirm every flag by ear.
3. Present the review section by section as tables (line | verdict), using ✓ to
   keep a line and ✎ to change it. Every ✎ gives the reason in bold first, then
   the fix. Give one recommended fix per problem, not a menu.
4. Follow with the **clean lyric sheet**, then at most three open judgment calls.
5. Save `song.md` and append to `review-log.md`.

When the owner sends back an edited version:

- **Diff it against the last `song.md` first.** Name which edits improve the song,
  plainly and without flattery. Owners often fix things you missed, so their
  improvements stay.
- **Re-audit the whole song, not just the changed lines.** A single edit can
  break a rhyme partner several lines away (for example, changing "meek" to
  "sheep" left "weak" without a rhyme) or collide with a word used in another
  verse.
- If an edit introduces a problem that can't be fixed without losing what the
  owner wanted, say so. Lay out the trade-off, recommend one option, and let the
  owner decide.

### 5. Publish-ready

A song is ready when:
- a full review pass produces **zero ✎** from you;
- every item on the publish checklist in `review.md` passes;
- the owner says it's done.

Then:
- write the final `song.md`;
- add a closing `review-log.md` entry marked **READY**;
- give the owner the clean lyric sheet;
- add a short **sources** list of the scripture references behind the key
  images, which is useful for liner notes or a post.

**Rights flag:** if the owner's starting text quotes a copyrighted work (film,
book, or modern hymn), note it once and point to which lines stay closest to the
original. Paraphrase is usually fine, but that's the owner's decision.

## Principles that matter most

These are summaries. The reference files explain why and give examples.

- **Every line earns its place.** It makes sense on its own, sits in natural word
  order, and leads into the next line. If a line exists only to reach a rhyme,
  cut it.
- **Scripture's image first.** Prefer the text's own picture over a clever
  substitute. "Sweeter than the lion's comb" failed. "Sweeter than the honeycomb"
  was right all along.
- **One image per figure.** Don't have a sun leaving a tent, a womb, and a tomb in
  the same four lines.
- **True rhymes on stressed syllables.** No forced word order, no rhyming a word
  with its own root, no rhyme where one side is unstressed.
- **Keep God's role and man's role distinct.** Christ ends the devil's works; the
  warrior *wars* until God slays the dragon.
- **Masculine is about stance, not volume.** Cut therapeutic and romantic phrasing
  ("make me whole", "I run to You", "musings"). Use command, oath, duty, and
  worship.

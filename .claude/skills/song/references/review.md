# Review: the sequential pass

A review is a **full audit of every line**. Each round produces a verdict for
every line, a clean lyric sheet, and a log entry. Keep running rounds until one
comes back clean.

## What to check on each line

Test each line against all of these, in this order. The first failure you find
is usually the root cause. Fixing it often fixes the failures after it.

1. **Sense.** Does the line mean something clear and true when read on its own?
   Would a man singing it understand it the first time he hears it?
2. **Syntax.** Is the word order natural, the grammar complete, and every
   pronoun tied to a clear antecedent? Is it consistent in person, tense, and
   singular/plural?
3. **Meter.** Does it have the right syllable count for its section, with
   stresses falling on strong words? Run `scan.py`, then check by ear.
4. **Rhyme.** Is the rhyme true and stressed? Watch for inversion, filler words,
   and same-root or slant rhymes. After any edit, re-check the rhyme partner.
5. **Imagery.** Does the image stay coherent and concrete? Is it clever for its
   own sake? Does it repeat an image already used nearby?
6. **Theology.** Is it accurate to Scripture? Does it keep God's role and man's
   role distinct? Does it paraphrase faithfully?
7. **Voice.** Is it masculine in stance, free of therapeutic or romantic
   phrasing, and in the brand register?
8. **Cohesion.** Does it lead into the next line and the next section? Does it
   pick up or set up a thread? Does it spend the climax too early?

## Output format

Open with a sentence or two of honest summary. Say how many problems you found,
what kind they are, and whether the owner's edits improved the song. When a
problem was your own earlier miss, say so plainly and don't apologize at
length.

Then give one table per section:

```markdown
## Verse 2: Virtue

| Line | Verdict |
|---|---|
| His heart knows only virtue; | ✎ **Breaks meter and rhyme.** 7 syllables where the verse needs 8, and the unstressed "-tue" can't rhyme with stressed "sub-DUE." **Fix: "His heart knows virtue through and through,"** which keeps your meaning ("only virtue" means entirely virtue) and makes a true rhyme. |
| He binds his eyes by solemn vow, | ✓ |
| With Christ the King enthroned within; | ✓ **Better than my version.** "Enthroned" is stronger than "sits throned." |
```

Rules for the table:
- ✓ keeps the line and ✎ changes it. For a line that was unchanged and already
  passed a previous round, a bare ✓ is enough. If a whole section is unchanged
  and clean, say so in one line instead of repeating the table.
- Each ✎ gives: **the problem in bold, stated in one sentence**, a short
  explanation if one is needed, and then **one recommended fix, also in bold**.
  Give a single fix. Only when every fix costs the owner something they asked
  for, lay out the trade-off and make one recommendation.
- Cite the scripture behind a fix when it is the reason for the fix.
- Put structural issues in their own short section after the tables. These are
  things like the tag order, the section order, or how a crescendo is marked.

After the tables:
1. **The clean lyric sheet**, in full, ready to copy.
2. **At most 3 open judgment calls.** These are choices you made that the owner
   could reasonably make differently. Word each one as a decision the owner has
   to make.

Then save `songs/<slug>/song.md` and append the log entry.

## review-log.md entry

```markdown
## Round N: YYYY-MM-DD
- Input: <owner draft | owner edits to round N-1 | first draft>
- Changes: <one bullet per ✎, "old → new (reason)">
- Kept from owner: <their edits that improved it>
- Open: <judgment calls awaiting owner>
- Status: IN REVIEW | READY
```

## Common failures

These are all real misses from past sessions. Scan for them on every round.

| Failure | Example | Fix |
|---|---|---|
| Slant rhyme left in | weak / sheep; bribe / side; plans / man; Lord / Word | Change the pair, not just one word |
| Stress-mismatch rhyme | confess / faithfulNESS; bless / righteousNESS | Move the rhyme onto stressed syllables |
| Same-root rhyme | sound / resound; side / aside | Pick a new partner |
| Inversion to reach a rhyme | "him subdue"; "His craft displays"; "faults I cannot find" | Rewrite in natural order |
| Filler rhyme word | yonder; untold; the prophets told; true as day | Delete the word and restate the line |
| Coined compound | Kinsman-Lord | Use the plain scriptural title |
| Miscounted syllables | "champion" as 2; "The Champion bore my shame" as 6 | Recount, and run scan.py |
| Mixed metaphor | pouring flame; tent + womb + room + tomb | One image per figure |
| Too clever | "lion's comb" | Go back to the text's image |
| Vague simile | "true as ordered skies" | Make it concrete and apt, or cut it |
| Redundant pair | "end to end" + "east to west" | Make the second line add something |
| Dangling grammar | comparisons with no verb; "Who" whose antecedent is unclear | Complete the clause and restate the subject |
| Person shift | "O Rock…" then "Jehovah's name" | Hold one addressee |
| Contradiction | "speech of flame" … "there is no speech" | Signpost the paradox |
| Theological overclaim | "He lives to end the devil's reign" | Keep God's role and man's role distinct |
| Category error | Christ called "Perfect Law" | Christ fulfills the law |
| Soft register | make me whole; run to You; musings | See voice-and-theology.md |
| Early climax | resurrection image in Verse 2 | Save it for the bridge |
| Reference across the chorus | "that fire" at the start of a post-chorus verse | Make each verse stand on its own |
| Spelling | "yay" for "yea"; "un-does" | KJV spelling, no stray hyphens |
| Ending on the man, or on death | tag ends "till death shall take you" | End on God |
| Filler tic | "upon" ×4 in one song, used to fix the meter | Vary the verb, or recast the line |
| Speaker mismatch | "my father's hands" sung by fathers and sons alike | Assign parts, or rephrase the line so it's true for every voice |
| Awkward body image | "Now lays His hand upon my hand" | Picture it literally. If it looks odd staged, recast it |
| Couplet halves unrelated | "Taught my fingers how to fight, / Set my feet upon the height" (two psalm phrases, one rhyme) | A couplet is one thought: "fight → how to grip and how to smite" |
| Verb on the wrong subject | "His strength goes down to death" (strength fails; men die) | Attach each verb to the subject that actually does it |
| Nonsense compression | "He trains from son to son" | Say it in plain prose first; if the prose is odd, so is the line |
| Literal source idiom | "Touch mountains", "shoot arrows", "right hand of falsehood" | Render what the idiom means, or pick a different image from the text. Ask why the detail is there |
| Wrong narrative facts | Christ "felt the sword" (He was scourged, crowned with thorns, nailed, then pierced by a spear) | Check the Gospel account before writing Passion lines |
| Image outside the song's world | "drew me from the sea" in a song about shepherds and giants | Drop source images that break the song's world, and pay off one of its own (lion → the lion's prey is free) |
| Weak comparison | sons "like plants" | Reach for scripture's stronger form: cedars (Ps. 92:12), trees by the rivers (Ps. 1:3) |
| Wrong feeling | daughters "as stones that grace the gate" (scriptural, but it wishes her to be an ornament) | Ask whether a father would want this for his child. Pick an image that is beautiful in itself: fairest in the land (Job 42:15), wise as Abigail |
| Mechanical verb | "how to grip and how to smite" | Choose the vivid moment, not the procedure: "Sped my stone in whistling flight" |
| Vague setting | "Goes before me to the field" (which field?) | Place the scene in the song's story (1 Sam. 17:45, "take the field") |
| Symbol that doesn't land | a lion quietly meant to stand for the devil | When the turn is doctrinal, name it plainly: "The devil's prey is free!" |
| Mixed pronouns for God | "Your" in one line, "Thy" in another | Use "You/Your" throughout, except in verbatim KJV quotes |

## Publish checklist

A song is ready only when all of these hold:

- [ ] Every line passed a full round with no ✎.
- [ ] Syllable counts match within each section type, and scan.py flags are
      resolved or confirmed by ear.
- [ ] Every end rhyme is true and stressed. Any mosaic rhyme has been approved
      by the owner.
- [ ] No inversion or filler used to reach a rhyme.
- [ ] One image per figure, with no image repeated carelessly.
- [ ] Pronouns, person, and tense are consistent throughout.
- [ ] Theology checked: God's role and man's role are distinct, paraphrase is
      accurate, and the song ends on God.
- [ ] Voice is masculine, with no therapeutic or romantic phrasing.
- [ ] Threads are set up and paid off. The bridge turns the song, and the
      crescendo is marked.
- [ ] Spelling: KJV forms, elisions written in (heav'n, ev'ry), and grave
      accents where "-èd" is sounded.
- [ ] Rights: any borrowed source text has been flagged to the owner.
- [ ] Owner has approved.

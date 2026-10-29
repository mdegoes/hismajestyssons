# Craft: meter, rhyme, imagery, cohesion, arc

## Meter

### Counting syllables

Count the syllables as a singer would actually sing them. These words are the usual traps:

| Word | Syllables | Note |
|---|---|---|
| heaven / heavens | 2, or 1 as *heav'n* | Pick one count per line and write the elision into the lyric ("heav'n") so the singer isn't guessing. |
| every | 2 (*ev'ry*) | Most singers say "ev'ry". Count it as 2. |
| fire, hour, power | 1 or 2 | These float. Choose a count and mark it. |
| champion | **3** | cham-pi-on. This slip once put a 9-syllable line into an 8-syllable verse. |
| reverent | 3, or 2 as *rev'rent* | |
| wandering | 3, or 2 as *wand'ring* | |
| righteous, righteousness | 2 / 3 | |
| testimony | 4 | Too heavy for a 7-syllable trochaic line. |
| bruisèd | 2 | Mark the grave accent when the *-ed* is sounded. |
| warrior | 2 as sung (*war-yer*), 3 when spoken | State which one you mean. |
| aged (adjective) | 1 as *ayjd* in "aged arms", 2 in "the a-ged" | |

`scripts/scan.py` counts syllables heuristically and flags lines that don't match the section's usual count. Confirm each flag yourself, because the script misses some errors and flags some lines that are fine.

### Hymn meters

Use a real meter, so the song can borrow an existing tune and a congregation can sing it.

| Name | Syllables per line | Foot | Feel | Example |
|---|---|---|---|---|
| Common Meter (CM) | 8.6.8.6 | iambic | ballad-like, very singable | "Amazing Grace" |
| Long Meter (LM) | 8.8.8.8 | iambic | stately, dense | "Old Hundredth" |
| Short Meter (SM) | 6.6.8.6 | iambic | terse | "Blest Be the Tie" |
| CMD / LMD / SMD | the above, doubled | | room to develop an idea | |
| 8.7.8.7 (D) | 8.7.8.7 | trochaic | lifting; a strong chorus | "Come, Thou Fount" |
| 7.7.7.7 | 7s | trochaic | driving, hammered | "Jesus Christ Is Risen Today" |
| 6.6.6.6 (D) | 6s | iambic | a compressed bridge that builds | |
| 8.7.8.7 with feminine endings | 8 lines end on an unstressed syllable ("VIR-tue", "HURT you") | trochaic | | |

Give the chorus and the bridge a meter that contrasts with the verses. In the songs so far this has meant iambic LM verses, a trochaic chorus, and a bridge in iambic 6s. Within any one section type, keep the meter the same in every repetition. Verse 3 must scan like Verse 1.

### Where the stresses fall

A line can have the right syllable count and still stumble. In each line, check that the metrical beats land on words that carry weight.

- **Weak beats.** What matters is *where* a function word (*of, the, and, in, to, for, from, by, on*) lands on a beat. On **the final beat of a line, or the beat that carries the line's climax**, it's a real fault: "Declare the glory OF Your Name" wastes the song's last strong beat on "of". **Inside a line** it's a normal variation, and hymns do it constantly ("FOR the BEAUty OF the EARTH"). Don't discard a good line just because a preposition lands mid-line. Also don't solve the problem with a two-syllable filler: "upon" four times in one song is a tic of its own.
- **Trochaic first foot.** Starting an iambic line on a stress ("DRAG every hidden thing to light") is a legitimate variation. Two in a row reads as a meter change.
- **Contractions.** "He's" and "I'll" sound conversational. Use them sparingly, and only where the register allows it.

## Rhyme

### Scale of rhyme quality

Only the first two are acceptable by default.

1. **True, stressed rhyme.** From the stressed vowel onward, the sounds match exactly: *torn/sworn, sure/endure, reed/need*. This is the default.
2. **Mosaic or feminine rhyme that is true when sung.** *virtue / hurt you*. Allowed, but name it for the owner as a judgment call.
3. **Slant rhyme.** Only the consonants or only the vowels differ: *weak/sheep, bribe/side, plans/man, Lord/Word, tongue/sung*. Fix it.
4. **Stress-mismatch rhyme.** One side of the pair is unstressed: *confess/faithful-NESS, bless/righteous-NESS, virtue/subDUE*. It forces the singer to stress the wrong syllable. Fix it.
5. **Identical or same-root rhyme.** *sound/resound, side/aside, fire/afire*. It reads as lazy. Fix it.

### A forced rhyme is more than a sound problem

A rhyme is also forced when the rhyming word is there only because it rhymes. The tests:

- **Inversion.** "My secret faults I cannot find", "lets no passion him subdue", "His craft displays". If the line wouldn't be phrased that way in plain speech, the rhyme is dictating the syntax. Rewrite until the word order is natural. Solemn formulas such as "To valor sworn" are the exception, because they are already natural in oath language.
- **Filler words.** "yonder", "untold", "e'er", "true as day", "a thousandfold", "the prophets told" (in a psalm of David). If you can delete the word and the line means the same thing, it was there for the rhyme.
- **Made-up compounds.** "Kinsman-Lord" was coined to rhyme with "accord". "Redeemer, Lord" says the same thing without inventing a word.
- **Invented idioms.** "True as day" is not a real phrase. Real idioms, such as "clear as day", "had their run", "hold the line", and "stand against the tide", sound natural. Invented ones sound like padding.

When one fix creates another problem, change the rhyme pair. Don't bend the line. You have more rhyme words available than you think.

### When the key scripture phrase won't rhyme

Sometimes the anchor verse ends on a word that has almost no rhymes ("strength", "LORD" in some positions, "Amen"). In order of preference:

1. **Place it where it rhymes.** Put the quoted line in a slot whose partner already rhymes, even if it's a different slot from the one you planned. For example, "Blessèd be the LORD, our Strength!" works as the song's final line against "…falls at length."
2. **Use scripture's own reordering.** A phrasing Scripture uses elsewhere counts as natural word order, not inversion: "Blessed be my rock" (Ps. 18:46) justifies "Blessèd be my Strength, the LORD." Cite that parallel in the judgment calls.
3. **Leave it unrhymed as a refrain.** A verbatim KJV line can stand unrhymed as a refrain or tag, set apart from the rhyme scheme. A quotation is allowed to break the pattern in a way a composed line isn't. Mark it clearly so it doesn't read as a rhyme miss.

### Across the whole song

- Don't repeat an end-word within a verse. Avoid reusing the same rhyme pair in adjacent sections, unless the repetition is a deliberate callback and the owner knows it.
- After any edit, re-check its rhyme partner. Changing one word often breaks a rhyme four lines away.

## Imagery

### Mixed metaphors

Each figure of speech gets one controlling image. Examples of failures:

- **"Day pours to day the speech of flame."** Pouring is liquid and flame is fire. The fix was "tongues of flame" (Acts 2), because tongues are both speech and fire, so the image holds together.
- **A sun that leaves a tent, then a womb, then a room, then a tomb.** That is four enclosures in four lines. The fix: the Psalm's tent *is* the bridegroom's chamber, so there is one enclosure.
- **"Midnight watches of my heart."** Night watches belong to the clock, not to a heart. The fix was the Psalm's own phrase, "the meditations of my heart".

### Too clever

Donne's conceits work because the surprising link is *true*: the sun and the Son both rise. A conceit fails when the cleverness is the point:

- **"Sweeter than the lion's comb."** It alludes to Samson's riddle. It is technically biblical, but it jars the ear and needs a footnote before anyone understands it. The Psalm's "honeycomb" was better.

The test: will a man singing this in the pew understand it the first time? If the image needs an explanation, it had better be worth one.

### Similes

A simile must be concrete, and it must be apt on the point being compared.

- **Weak:** "true as ordered skies", "true as day". These are vague and don't illuminate anything.
- **Strong:** "like bedrock, shall endure" (concrete, and it sets up "O Rock"). "Like Aaron at his side he stands" (a specific scene, Ex. 17:12). "Firmer than the starry dome" (the word firmament means "firm thing").

### Redundancy

Two lines that say the same thing cost the song a line. Examples: "from heaven's end to heaven's end" followed by "from east to west". "Judgments" followed by "verdicts". "Lifts him" followed by "bears him up". Make the second line add something new.

## Cohesion

### Line to line

- **Each couplet is one thought.** A rhymed pair that joins two unrelated phrases, even two genuine psalm phrases ("fingers to fight / feet upon the height"), reads like a list that happens to rhyme. The second line should extend, answer, or sharpen the first ("Taught my fingers how to fight, / How to grip and how to smite").
- **The prose test.** Restate the line or couplet as a plain English sentence. If the prose is nonsense ("He trains from son to son") or pins the verb on the wrong subject ("his strength goes down to death"), the line is broken, however good it sounds.
- **The picture test.** Stage any physical image in your head. "He lays His hand upon my hand" looks odd when you picture it. "Now puts the sling into my hand" is an action you can see.
- **Grammar holds across line breaks.** Every clause needs a subject and a verb. "Sweeter than honeycomb, dearer than gold, / Lord, Your Word has brought me home" left the comparisons with nothing to attach to. The fix was "…*Is* Your Word…".
- **Pronouns have clear antecedents.** "God pitched a tent to house the sun, / Who…" is ambiguous: *who* could be God or the sun. Watch "he/his" in verses about both God and a man, and singular/plural agreement ("the wicked man… their plans").
- **Person stays consistent.** If a verse addresses God ("O Rock… who bought me"), don't slide into the third person ("Jehovah's name"). In the chorus, don't address the law, then a witness, then the Lord in successive lines. Unify the chorus with a repeated verb ("Speak… Speak… Speak").
- **Tense stays consistent.** "He kept… and bursts" switches tense in the middle of the thought.
- **No contradictions.** "Day pours forth speech" followed two lines later by "there is no speech" reads as a mistake unless it is signposted ("They speak, and yet no voice is heard").

### Section to section

- A verse that follows the chorus can't point back past it: "that fire" has nothing to refer to once the chorus has intervened.
- **Threads** are words or images that come back changed. For example, Psalm 19 used:
  - blaze → flame → searching heat → law more searching than fire → the heart blazing
  - the sun that runs → the champion → the forfeited race Christ ran → my race
  - no voice is heard → Speak ×3 → the Word made flesh

  Plan two or three threads and pay each one off.
- **Set up before you pay off.** "Bedrock" in Verse 3 makes "O Rock" in Verse 5 land. An image that appears only once at the climax lands weakly.
- **Don't spend the climax early.** Resurrection imagery in Verse 2 ("rolls the stone from night's dark tomb") stole the bridge's reveal.

### The anchor story

When a song has a story frame (David and Goliath, the Exodus, the Passion), take the song's images from that story all the way through, not just in the first verse. Stock battle words ("the field", "my shield", "the foe") are where a frame goes vague. Replace them with what actually happened in the story:
- Elah and the five stones
- Saul's armor refused
- "Thou comest to me with a sword… but I come to thee in the name of the LORD" (1 Sam. 17:45)
- the harp
- Abigail
- the mighty men

Specific detail is what gives a song its character. Generic battle language makes it sound like any other song.

## Arc and crescendo

- **Follow the source's structure.** A psalm setting should keep the psalm's own movement. A "one verse per virtue" song should keep the owner's order.
- **The bridge is the hinge.** It is the place for the Donne move, where the song's controlling image turns and reveals Christ. Examples: the sun becomes the Son, the champion becomes the one who ran my race, the law I couldn't keep is kept for me.
- **Mark the dynamics** for the singers: confession or quiet verse → the bridge building line by line → a key lift (up a half step or a whole step) → the final chorus sung full.
- **A final chorus can change its words**, with the second half shifting to a cosmic scope. For example: "Speak, O King, and I will stand" becomes "Reign, O King, o'er sea and land… / Bow and cry that Christ is Lord!"
- **The last line lands on God.** It should not land on the singer or on death. "Keep the code till death shall take you" is a strong line inside the chorus, but as the final word of the song it leaves the listener at the grave. Flip the order so the song ends on "He, your sword; and He, your shield!"

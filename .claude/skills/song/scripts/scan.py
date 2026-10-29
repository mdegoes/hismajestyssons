#!/usr/bin/env python3
"""Heuristic meter/rhyme scanner for songs/<slug>/song.md.

Rhyme keys are spelling-based: true rhymes spelled differently (war/more,
height/might, stones/groans) print different keys. Use them to spot pairs to
check, not as a verdict.

Counts syllables per line, groups lines by section type (Verse, Chorus, Bridge,
Tag, ...), and flags any line whose count differs from the count at the same
line position in the other sections of that type, or that is a lone outlier
within its own section. Also prints each section's
end words with a rough rhyme key so ABAB / AABB mismatches stand out.

Heuristic only: English spelling doesn't map cleanly to syllables. Treat
every flag as a lead to check by ear, never as a verdict. Add words it gets
wrong to OVERRIDES.

Usage: python3 scan.py songs/<slug>/song.md
"""
import re
import sys
from collections import Counter, defaultdict

# Sung syllable counts for words the heuristic gets wrong or that are ambiguous.
OVERRIDES = {
    "people": 2, "heaven": 2, "heavens": 2, "heaven's": 2, "heav'n": 1, "heav'ns": 1,
    "every": 2, "ev'ry": 2, "everything": 3, "everyone": 3,
    "fire": 1, "fires": 1, "desire": 2, "desires": 2, "hour": 1, "power": 2,
    "our": 1, "flower": 2,
    "champion": 3, "champions": 3,
    "warrior": 2, "warriors": 2, "warrior's": 2,
    "reverent": 3, "rev'rent": 2, "wandering": 3, "wand'ring": 2,
    "righteous": 2, "righteousness": 3,
    "testimony": 4, "glorious": 3, "glory": 2,
    "bruisèd": 2, "bruised": 1,
    "o'er": 1, "e'er": 1, "ne'er": 1, "'tis": 1,
    "being": 2, "lion": 2, "lion's": 2, "zion": 2,
    "jehovah's": 3, "jehovah": 3, "israel": 3,
    "crucified": 3, "firmament": 3, "meditations": 4, "meditation": 4,
    "whose": 1, "yea": 1, "fury": 2, "every": 2,
    "aged": 1, "the": 1, "fathers": 2, "wicked": 2, "sacred": 2, "naked": 2,
    "beloved": 3, "crooked": 2, "bridegroom": 2, "bridegroom's": 2,
    "somewhere": 2, "evermore": 3, "forevermore": 4, "whole": 1, "blessed": 1, "blessèd": 2,
    "idea": 3, "create": 2, "created": 3, "creation": 3, "creation's": 3,
    "science": 2, "quiet": 2, "poem": 2, "poet": 2,
    "hundred": 2, "yielded": 2, "squarely": 2, "mitre": 2, "dungeon": 2, "dungeon's": 2, "nicaea": 3, "nicaea's": 3, "dying": 2, "beyond": 2,
}

VOWELS = "aeiouyàèéìòù"


def syllables(word):
    w = word.lower().strip("'’")
    w = w.replace("’", "'")
    if not w:
        return 0
    if w in OVERRIDES:
        return OVERRIDES[w]
    base = w[:-2] if w.endswith("'s") else w
    if base in OVERRIDES:
        return OVERRIDES[base]
    w = base.replace("'", "")
    groups = re.findall(r"[aeiouyàèéìòù]+", w)
    n = len(groups)
    if w.startswith("y") and len(w) > 1 and w[1] in VOWELS:
        n -= 1  # consonant y: yea, yonder
    # silent final e — but not "-le" after a consonant ("table") and not a sounded
    # "-ue" ("virtue", "pursue"; "tongue"/"plague" stay silent)
    if (w.endswith("e") and n > 1 and not re.search(r"[^aeiou]le$", w)
            and not re.search(r"[^gq]ue$", w)):
        n -= 1
    # -ed / -es add no syllable when the e stands alone after a consonant
    # ("robed", "flames"), unless after t/d ("wanted") or a sibilant ("places").
    # "-ied"/"-oes" (carried, undoes) are already one vowel group, so untouched.
    if re.search(r"[^aeiouy]ed$", w) and n > 1 and not re.search(r"[td]ed$", w):
        n -= 1
    elif re.search(r"[gq]ues$", w) and n > 1:  # tongues, plagues
        n -= 1
    elif re.search(r"[^aeiouy]es$", w) and n > 1 and not re.search(r"(s|x|z|ch|sh|c|g)es$", w):
        n -= 1
    # hiatus inside the word (lion, champion, giant, create): -ia-/-io-/-eo-/-iu-
    # split unless after s/t/c/x, where -ion/-ial/-ious are one syllable
    # ("passion", "nation", "special"); -ua- splits unless after g/q, where u is
    # a glide ("guard", "quake")
    n += len(re.findall(r"(?<=[^aeiousctx])(ia|io|eo|iu)(?=[^aeiou]|$)", w))
    n += len(re.findall(r"(?<=[^aeiougq])ua(?=[^aeiou]|$)", w))
    return max(1, n)


def line_syllables(line):
    words = re.findall(r"[A-Za-zàèéìòù'’]+", line)
    return sum(syllables(w) for w in words), words


def rhyme_key(word):
    """Crude rhyme key: the last vowel group plus the trailing consonants."""
    w = word.lower().replace("’", "'").strip("'")
    w = re.sub(r"'s$", "s", w).replace("'", "")
    if w.endswith("e") and len(w) > 2 and w[-2] not in VOWELS:
        w = w[:-1]  # silent e: "shone" vs "none" still differ, but "name/flame" match
    m = re.search(r"[aeiouy]+[^aeiouy]*$", w)
    return m.group(0) if m else w


def section_type(header):
    h = header.lower()
    for t in ("pre-chorus", "chorus", "verse", "bridge", "tag", "intro", "outro", "refrain"):
        if t in h:
            return t
    return h.split(":")[0].strip()


def parse(path):
    sections, cur = [], None
    for raw in open(path, encoding="utf-8"):
        line = raw.rstrip("\n")
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("<!--"):
            continue
        m = re.match(r"^\*{0,2}\[(.+?)\]\*{0,2}(\s+[*_(].*)?$", s)
        if m:
            cur = {"header": m.group(1), "type": section_type(m.group(1)), "lines": []}
            sections.append(cur)
            continue
        if cur is not None:
            cur["lines"].append(s)
    return sections


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sections = [s for s in parse(sys.argv[1]) if s["lines"]]
    if not sections:
        sys.exit("No [Section] headers with lyrics found.")

    # Expected count per (section type, line index) = most common across that type.
    by_pos = defaultdict(Counter)
    for s in sections:
        for i, l in enumerate(s["lines"]):
            by_pos[(s["type"], i)][line_syllables(l)[0]] += 1

    flags = 0
    for s in sections:
        pattern = ".".join(str(line_syllables(l)[0]) for l in s["lines"])
        print(f"\n[{s['header']}]  {pattern}")
        keys = [rhyme_key(re.findall(r"[A-Za-zàèéìòù'’]+", l)[-1]) for l in s["lines"]]
        for i, l in enumerate(s["lines"]):
            n, _ = line_syllables(l)
            counts = by_pos[(s["type"], i)]
            expected = counts.most_common(1)[0][0]
            # Flag (a) a mismatch with the same line position in other sections of
            # this type, or (b) a lone outlier within the section (a 9 among 8s, a 7
            # among 6s) — alternating patterns like 8.7.8.7 have no lone counts.
            own = Counter(line_syllables(x)[0] for x in s["lines"])
            # only trust the cross-section count when it's a clear winner, not a tie
            top = counts.most_common(2)
            clear = top[0][1] >= 2 and (len(top) == 1 or top[0][1] > top[1][1])
            cross = clear and n != expected
            lone = len(s["lines"]) >= 4 and own[n] == 1
            ref = expected if cross else own.most_common(1)[0][0]
            mark = "!!" if cross or lone else "  "
            if mark == "!!":
                flags += 1
            print(f"  {mark} {n:>2}  {keys[i]:<8} {l}" + (f"   (expected ~{ref})" if mark == "!!" else ""))
    print(f"\n{flags} line(s) flagged. Heuristic: confirm each by ear; check rhyme keys by eye.")


if __name__ == "__main__":
    main()

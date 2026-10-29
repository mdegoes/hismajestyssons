(() => {
  const $ = id => document.getElementById(id);
  const SVGNS = "http://www.w3.org/2000/svg";
  const mod12 = x => ((x % 12) + 12) % 12;
  const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

  // =====================================================================
  // Syllables and stress (heuristic; hyphens in a word set syllables by hand)
  // =====================================================================
  const OVERRIDES = {
    people: 2, heaven: 2, heavens: 2, "heav'n": 1, every: 2, "ev'ry": 2, everything: 3, everyone: 3,
    fire: 1, fires: 1, desire: 2, desires: 2, hour: 1, hours: 1, power: 2, our: 1, flower: 2,
    champion: 3, warrior: 2, warriors: 2, reverent: 3, wandering: 3, righteous: 2, righteousness: 3,
    glorious: 3, glory: 2, "o'er": 1, "e'er": 1, "ne'er": 1, "'tis": 1, being: 2, lion: 2, zion: 2,
    jehovah: 3, israel: 3, crucified: 3, firmament: 3, whose: 1, yea: 1, fury: 2, aged: 1, the: 1,
    fathers: 2, wicked: 2, sacred: 2, naked: 2, beloved: 3, crooked: 2, somewhere: 2, evermore: 3,
    forevermore: 4, whole: 1, blessed: 1, "blessèd": 2, idea: 3, create: 2, created: 3, creation: 3,
    science: 2, quiet: 2, poem: 2, poet: 2, hundred: 2, dying: 2, beyond: 2, iron: 2, sire: 1,
    eyes: 1, ire: 1, ayre: 1, gathsrier: 3, paltyne: 2, maudrim: 2, crying: 2, marbled: 2, kaftoralim: 4, baladin: 3,
    barathrim: 3, unbending: 3, prayer: 1, prayers: 1, toward: 1, towards: 1, christ: 1, lord: 1,
  };
  const FUNCTION_WORDS = new Set(("a an the and or but nor of to in on at by for from with as is was be are were am his her its my " +
    "your our their him them me us it he she we they that which who whom whose than so if shall will would can could has have had " +
    "do does did should may might must there these those this o thy thee thine ye upon unto into through 'tis i").split(" "));
  const STRESS_LAST = /(?:ee|eer|oon|ique|ade|ain|ose|ere)$/;
  const PREFIXES = /^(?:a|be|de|re|un|en|em|in|im|con|com|for|fore|per|pre|pro|ab|ad|ob|sub|dis|mis|with|up|al|ac|ap|as|at)(?=[a-z])/;

  function sylCount(word) {
    let w = word.toLowerCase().replace(/’/g, "'").replace(/^'+|'+$/g, "");
    if (!w) return 0;
    if (w in OVERRIDES) return OVERRIDES[w];
    let base = w.endsWith("'s") ? w.slice(0, -2) : w;
    if (base in OVERRIDES) return OVERRIDES[base];
    w = base.replace(/'/g, "");
    const groups = w.match(/[aeiouyàèéìòù]+/g) || [];
    let n = groups.length;
    if (/^y[aeiou]/.test(w)) n--;
    if (w.endsWith("e") && n > 1 && !/[^aeiou]le$/.test(w) && !/[^gq]ue$/.test(w)) n--;
    if (/[^aeiouy]ed$/.test(w) && n > 1 && !/[td]ed$/.test(w)) n--;
    else if (/[gq]ues$/.test(w) && n > 1) n--;
    else if (/[^aeiouy]es$/.test(w) && n > 1 && !/(s|x|z|ch|sh|c|g)es$/.test(w) && !/[^aeiou]les$/.test(w)) n--;
    n += (w.match(/(?<=[^aeiousctx])(ia|io|eo|iu)(?=[^aeiou]|$)/g) || []).length;
    n += (w.match(/(?<=[^aeiougq])ua(?=[^aeiou]|$)/g) || []).length;
    return Math.max(1, n);
  }
  const CLUSTERS = new Set(["bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "tr", "sc", "sk", "sp", "st", "sw", "tw", "wr", "th", "sh", "ch", "ph", "wh", "qu"]);
  // Split a word's letters into n chunks at sensible places.
  function splitWord(word, n) {
    if (n <= 1) return [word];
    const lw = word.toLowerCase();
    const isV = (i) => /[aeiouàèéìòù]/.test(lw[i]) || (lw[i] === "y" && i > 0 && !/[aeiou]/.test(lw[i + 1] || ""));
    let groups = [];
    for (let i = 0; i < lw.length; i++) {
      if (isV(i)) { const s = i; while (i + 1 < lw.length && isV(i + 1)) i++; groups.push([s, i + 1]); }
    }
    while (groups.length > n) { const g = groups.pop(); groups[groups.length - 1][1] = g[1]; }
    while (groups.length < n) {
      const k = groups.findIndex(g => g[1] - g[0] >= 2);
      if (k < 0) break;
      const g = groups[k]; groups.splice(k, 1, [g[0], g[0] + 1], [g[0] + 1, g[1]]);
    }
    if (groups.length < n) {
      // y between vowels (crying, praying) still starts a syllable
      const g2 = []; for (let i = 0; i < lw.length; i++) { if (/[aeiouyàèéìòù]/.test(lw[i])) { const s0 = i; while (i + 1 < lw.length && /[aeiouàèéìòù]/.test(lw[i + 1]) && lw[i] !== "y") i++; g2.push([s0, i + 1]); } }
      if (g2.length === n) groups = g2;
    }
    if (groups.length < n) {
      const size = Math.max(1, Math.round(word.length / n)), out = [];
      for (let k = 0; k < n; k++) out.push(word.slice(k * size, k === n - 1 ? undefined : (k + 1) * size));
      return out.filter(Boolean).length === n ? out : [word];
    }
    if (groups.length < 2) return [word];
    const cuts = [];
    for (let k = 0; k + 1 < groups.length; k++) {
      const a = groups[k][1], b = groups[k + 1][0], c = lw.slice(a, b).replace(/'/g, "");
      let cut;
      if (b === a) cut = b;
      else if (c.length === 1) cut = a;
      else if (CLUSTERS.has(c.slice(-2)) && !(c.length === 2 && /^(st|sk|sp)$/.test(c))) cut = b - 2;
      else if (CLUSTERS.has(c.slice(0, 2))) cut = a + 2;
      else cut = a + 1;
      cuts.push(Math.max(a, Math.min(b, cut)));
    }
    const out = []; let p = 0;
    cuts.forEach(c => { out.push(word.slice(p, c)); p = c; });
    out.push(word.slice(p));
    const clean = out.filter(Boolean);
    return clean.length === n ? clean : [word];
  }
  function stressOf(core, n) {
    const w = core.toLowerCase().replace(/’/g, "'");
    if (n === 1) return [FUNCTION_WORDS.has(w) ? 0.25 : 0.85];
    const out = Array(n).fill(0.1);
    let p = 0;
    if (/(tion|sion|cian|tious|cious)s?$/.test(w)) p = n - 2;
    else if (/(ity|ical|ically)$/.test(w) && n >= 3) p = n - 3;
    else if (STRESS_LAST.test(w) && n === 2) p = 1;
    else if (PREFIXES.test(w) && n >= 2 && !/^(ever|every|under|over|after|enter|evil|any|many|open|other|mother|father|brother|altar|anger|answer|army|arrow|ashes|honor|ancient|angel|alien)/.test(w)) p = 1;
    out[Math.max(0, Math.min(n - 1, p))] = 1;
    if (n >= 4) out[(p + 2) % n] = Math.max(out[(p + 2) % n], 0.45);
    return out;
  }
  // One lyric line → syllables {d: display, a: ABC text, w: stress weight, sp: space after}
  function analyzeLine(text) {
    const syls = [];
    text.split(/\s+/).filter(Boolean).forEach(tok => {
      const parts = tok.split(/-(?=.)/);
      parts.forEach((part, pi) => {
        const m = part.match(/^([^A-Za-zÀ-ÿ']*)([A-Za-zÀ-ÿ'’]+)([^A-Za-zÀ-ÿ]*)$/);
        const lastPart = pi === parts.length - 1;
        if (!m) { if (syls.length && part) syls[syls.length - 1].d += part; return; }
        const [, lead, core, trail] = m;
        const n = sylCount(core) || 1;
        const chunks = splitWord(core, n), st = stressOf(core, chunks.length);
        chunks.forEach((ch, ci) => {
          const first = ci === 0, last = ci === chunks.length - 1;
          syls.push({
            d: (first ? lead : "") + ch + (last ? trail : "") + (last && !lastPart ? "-" : ""),
            a: (ch).replace(/[~_*|\\"]/g, ""),
            w: st[ci],
            sp: last && lastPart,
            join: !last || !lastPart,
          });
        });
      });
    });
    return { text, syls };
  }
  // Fit a regular meter to a stanza: binary (iambic/trochaic) or ternary (anapest/dactyl/amphibrach), phase per line.
  function fitMeter(st) {
    const fam = period => {
      let cost = 0;
      const lines = st.lines.map(l => {
        let best = null;
        for (let ph = 0; ph < period; ph++) {
          let c = 0;
          const pat = l.syls.map((s, i) => ((i + ph) % period === period - 1 ? 1 : 0));
          // never start a line with 3 weak syllables; forbid lines with no strong syllable
          if (!pat.includes(1)) c += 5;
          l.syls.forEach((s, i) => { c += pat[i] ? (1 - s.w) : s.w; });
          if (!best || c < best.c) best = { c, pat, ph };
        }
        cost += best.c; return best;
      });
      return { cost, lines };
    };
    const b = fam(2), t = fam(3);
    const pick = t.cost < b.cost * 0.85 ? { kind: "ternary", ...t } : { kind: "binary", ...b };
    st.meter = pick.kind;
    st.lines.forEach((l, i) => { l.pat = pick.lines[i].pat; });
    const firstStrong = st.lines.map(l => l.pat.indexOf(1));
    const avg = firstStrong.reduce((a, b) => a + b, 0) / firstStrong.length;
    st.meterName = pick.kind === "binary" ? (avg >= 0.5 ? "iambic" : "trochaic") : (avg >= 1.5 ? "anapestic" : avg >= 0.5 ? "amphibrachic" : "dactylic");
    const totalCost = pick.lines.reduce((a, x) => a + x.c, 0), nSyl = st.lines.reduce((a, l) => a + l.syls.length, 0);
    st.fit = nSyl ? 1 - totalCost / nSyl : 1;
  }
  function parseLyrics(text) {
    const stanzas = []; let label = null, cur = null, pendingHeader = false;
    const counts = {};
    const nameFor = lab => { const base = lab || "Stanza"; counts[base] = (counts[base] || 0) + 1; return /\d/.test(base) ? base : base + " " + counts[base]; };
    const repeatOf = lab => { for (let i = stanzas.length - 1; i >= 0; i--) if (stanzas[i].base === lab) return stanzas[i]; return null; };
    const flushBare = () => { if (pendingHeader && label) { const r = repeatOf(label); if (r) stanzas.push({ ...r, name: nameFor(label), repeat: true }); } pendingHeader = false; };
    text.replace(/\r/g, "").split("\n").forEach(raw => {
      const s = raw.trim();
      const m = s.match(/^\*{0,2}\[(.+?)\]\*{0,2}\s*(\(.*\))?$/);
      if (m) { flushBare(); label = m[1].trim(); cur = null; pendingHeader = true; return; }
      if (!s) { cur = null; return; }
      if (s.startsWith("<!--") || /^#\s/.test(s)) return;
      if (!cur) { cur = { base: label || "Stanza", name: nameFor(label), lines: [] }; stanzas.push(cur); label = null; pendingHeader = false; }
      cur.lines.push(analyzeLine(s));
    });
    flushBare();
    stanzas.forEach(st => { if (!st.repeat) { st.shape = st.lines.map(l => l.syls.length); fitMeter(st); } });
    return stanzas;
  }
  // Flattened syllables of a stanza for display/ABC.
  function stanzaSyls(st) {
    const out = [], lineOf = [];
    st.lines.forEach((l, li) => l.syls.forEach(s => { out.push(s); lineOf.push(li); }));
    return { syls: out, lineOf };
  }

  // =====================================================================
  // Keys, spelling, ABC writing
  // =====================================================================
  const LET = "CDEFGAB", NAT = [0, 2, 4, 5, 7, 9, 11];
  const MODES = { "": ["Major", 0], m: ["Minor", -3], dor: ["Dorian", -2], phr: ["Phrygian", -4], lyd: ["Lydian", 1], mix: ["Mixolydian", -1] };
  const MAJ5 = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, F: -1 };
  function keyInfo(t) {
    const k = t.abcHead.find(h => h.startsWith("K:")).slice(2).split(" ")[0];
    const [, L, acc, mode] = k.match(/^([A-G])([#b]?)(.*)$/);
    const a = acc === "#" ? 1 : acc === "b" ? -1 : 0;
    return { f0: MAJ5[L] + 7 * a + MODES[mode][1], tonic: mod12(NAT[LET.indexOf(L)] + a), mode };
  }
  function fifthsFor(f0, sh) { let f = mod12(f0 + 7 * sh); return f > 6 ? f - 12 : f; }
  function keyAlts(f) {
    const al = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
    for (let i = 0; i < Math.abs(f); i++) al[(f > 0 ? "FCGDAEB" : "BEADGCF")[i]] = f > 0 ? 1 : -1;
    return al;
  }
  function inKey(m, f) { const al = keyAlts(f); return [...LET].some((L, i) => mod12(NAT[i] + al[L]) === mod12(m)); }
  // lt = the leading tone's pitch class: spelled sharp even in flat keys (C♯ in D minor).
  function spell(m, f, lt) {
    const al = keyAlts(f), pc = mod12(m);
    const mk = (i, a) => ({ i, L: LET[i], a, oct: Math.round((m - a - NAT[i]) / 12) - 1 });
    for (let i = 0; i < 7; i++) if (mod12(NAT[i] + al[LET[i]]) === pc) return mk(i, al[LET[i]]);
    for (let i = 0; i < 7; i++) if (NAT[i] === pc) return mk(i, 0);
    for (const a of (f < 0 && pc !== lt ? [-1, 1] : [1, -1])) for (let i = 0; i < 7; i++) if (mod12(NAT[i] + a) === pc) return mk(i, a);
  }
  const accSym = a => a > 0 ? "♯".repeat(a) : a < 0 ? "♭".repeat(-a) : "";
  function keyLabel(t, sh) {
    const ki = keyInfo(t), f = fifthsFor(ki.f0, sh), sp = spell(60 + ki.tonic + sh, f);
    return { name: sp.L + accSym(sp.a) + " " + MODES[ki.mode][0], abc: sp.L + (sp.a > 0 ? "#" : sp.a < 0 ? "b" : "") + ki.mode, f };
  }
  function abcPitch(sp) {
    const L = sp.oct >= 5 ? sp.L.toLowerCase() : sp.L;
    return L + (sp.oct >= 6 ? "'".repeat(sp.oct - 5) : sp.oct <= 3 ? ",".repeat(4 - sp.oct) : "");
  }
  function chordName(name, sh, f) {
    if (!sh) return name;
    const m = name.match(/^([A-G])([#b]?)(.*)$/); if (!m) return name;
    const [, L, acc, rest] = m;
    const pc = NAT[LET.indexOf(L)] + (acc === "#" ? 1 : acc === "b" ? -1 : 0) + sh;
    const sp = spell(60 + mod12(pc), f);
    return sp.L + (sp.a > 0 ? "#" : sp.a < 0 ? "b" : "") + rest;
  }
  const barLen = t => { const [n, d] = t.abcHead.find(h => h.startsWith("M:")).slice(2).split("/").map(Number); return n * 8 / d; };
  // Bar boundaries: an optional partial pickup bar [0, pickup), then full bars.
  function barStarts(t) {
    const bar = barLen(t), pk = t.pickup || 0, out = [0];
    for (let b = pk || bar; b < t.total; b += bar) out.push(b);
    return out;
  }
  function lineBarsFromOnsets(t, lineOnsets) {
    const starts = barStarts(t), idxAt = x => { let k = 0; while (k + 1 < starts.length && starts[k + 1] <= x) k++; return k; };
    const first = lineOnsets.map((x, i) => i === 0 ? 0 : (starts.includes(x) ? idxAt(x) : idxAt(x) + 1));
    return first.map((b, i) => Math.max(1, (i + 1 < first.length ? first[i + 1] : starts.length) - b));
  }
  // Write ABC from notes (used for composed tunes, edits, or a moved key).
  function genLines(t, sh) {
    const ki = keyInfo(t), f = fifthsFor(ki.f0, sh), al = keyAlts(f), lt = mod12(ki.tonic + sh - 1);
    const total = t.total, starts = barStarts(t), startSet = new Set(starts);
    const ns = t.notes.slice().sort((a, b) => a.t - b.t), onsets = new Set(ns.map(n => n.t));
    const segs = []; let pos = 0;
    ns.forEach(n => { if (n.t > pos) segs.push({ t: pos, d: n.t - pos, m: null }); segs.push({ t: n.t, d: n.d, m: n.m + sh }); pos = n.t + n.d; });
    if (pos < total) segs.push({ t: pos, d: total - pos, m: null });
    const restCuts = starts.concat(t.chords.map(c => c.t));
    const chordAt = new Map(t.chords.map(c => [c.t, chordName(c.name, sh, f)]));
    const pieces = [];
    segs.forEach(sg => {
      let a = sg.t; const end = sg.t + sg.d;
      (sg.m === null ? restCuts : starts).filter(x => x > a && x < end).sort((x, y) => x - y).concat([end]).forEach(b => {
        let d = b - a;
        while (d > 0) { const v = [12, 8, 6, 4, 3, 2, 1].find(v => v <= d); pieces.push({ t: a, d: v, m: sg.m }); a += v; d -= v; }
      });
    });
    pieces.forEach((p, i) => { const q = pieces[i + 1]; p.tie = p.m !== null && q && q.m === p.m && q.t === p.t + p.d && !onsets.has(q.t); });
    const breaks = []; let acc0 = 0; (t.lineBars || []).forEach(n => { acc0 += n; breaks.push(acc0); });
    const lines = []; let cur = "", cnt = 0, barIdx = 0, acc = {};
    pieces.forEach(p => {
      if (p.t > 0 && startSet.has(p.t)) {
        cur += " |"; acc = {}; barIdx++;
        if (breaks.includes(barIdx)) { lines.push([cur.trim(), cnt]); cur = ""; cnt = 0; }
      }
      let tok = " ";
      if (chordAt.has(p.t)) { tok += '"' + chordAt.get(p.t) + '"'; chordAt.delete(p.t); }
      if (p.m === null) tok += "z";
      else {
        const sp = spell(p.m, f, lt), k = sp.L + sp.oct, now = k in acc ? acc[k] : al[sp.L];
        if (sp.a !== now) { tok += sp.a === 0 ? "=" : sp.a > 0 ? "^".repeat(sp.a) : "_".repeat(-sp.a); acc[k] = sp.a; }
        tok += abcPitch(sp);
        if (onsets.has(p.t)) cnt++;
      }
      tok += p.d === 1 ? "" : p.d;
      if (p.tie) tok += "-";
      cur += tok;
    });
    if (cur.trim()) lines.push([(cur + " |]").trim(), cnt]);
    else if (lines.length) lines[lines.length - 1][0] = lines[lines.length - 1][0].replace(/\|$/, "|]");
    return lines;
  }

  // =====================================================================
  // The built-in composer: rhythm from the stanza's stresses, then harmony, then melody
  // =====================================================================
  const SCALES = {
    ion: [0, 2, 4, 5, 7, 9, 11], dor: [0, 2, 3, 5, 7, 9, 10], phr: [0, 1, 3, 5, 7, 8, 10],
    lyd: [0, 2, 4, 6, 7, 9, 11], mix: [0, 2, 4, 5, 7, 9, 10], aeo: [0, 2, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11],
  };
  const KMODE = { ion: "", dor: "dor", phr: "phr", lyd: "lyd", mix: "mix", aeo: "m", harm: "m" };
  const MODE_NAME = { ion: "major", dor: "Dorian", phr: "Phrygian", lyd: "Lydian", mix: "Mixolydian", aeo: "minor", harm: "harmonic minor" };
  // M: meter; B: eighths per beat (one stressed syllable per beat); bpb: beats per bar;
  // sub: how a beat splits for 2 or 3 syllables; pu: pickup note length; hold: beats added at a line end.
  const STYLES = [
    { id: "hymn", name: "Hearth Hymn", M: "4/4", B: 4, bpb: 2, sub: { 2: [2, 2], 3: [2, 1, 1] }, pu: 2, hold: 1, breath: 0, mode: "ion", tonic: 67, home: 2, peak: 6, low: -3, high: 7, leap: .12, rep: .15, motif: .5, hr: 2, bpm: 84, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Plain four-square hymn: one note a syllable, stepwise, chords on every half bar." },
    { id: "ballad", name: "Sea Ballad", M: "6/8", B: 3, bpb: 2, sub: { 2: [2, 1], 3: [1, 1, 1] }, pu: 1, hold: 1, breath: 2, mode: "dor", tonic: 62, home: 4, peak: 9, low: -1, high: 10, leap: .25, rep: .1, motif: .8, hr: 1, bpm: 62, tempoBeat: 3, beatName: "dotted-quarter",
      blurb: "Rocking 6/8 in Dorian, long held line ends, a hook that comes back a step higher." },
    { id: "waltz", name: "Border Waltz", M: "3/4", B: 6, bpb: 1, sub: { 2: [4, 2], 3: [2, 2, 2] }, pu: 2, hold: 1, breath: 2, mode: "mix", tonic: 62, home: 4, peak: 9, low: -1, high: 10, leap: .25, rep: .1, motif: .6, hr: 1, bpm: 112, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Lilting 3/4 with the flat seventh of Mixolydian. Climbs to the octave in the third line." },
    { id: "shanty", name: "Capstan Shanty", M: "4/4", B: 4, bpb: 2, sub: { 2: [3, 1], 3: [2, 1, 1] }, pu: 1, hold: 1, breath: 2, mode: "mix", tonic: 57, home: 8, peak: 11, low: 4, high: 12, leap: .2, rep: .35, motif: .7, hr: 1, bpm: 96, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Dotted work-song drive with repeated notes, made for hauling and stamping." },
    { id: "lament", name: "Highland Lament", M: "3/4", B: 6, bpb: 1, sub: { 2: [4, 2], 3: [2, 2, 2] }, pu: 2, hold: 2, breath: 2, mode: "aeo", tonic: 62, home: 3, peak: 9, low: -2, high: 10, leap: .3, rep: .05, motif: .5, hr: 1, bpm: 84, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Slow minor waltz with wide climbs and long holds at every line end." },
    { id: "anthem", name: "Anthem", M: "4/4", B: 4, bpb: 2, sub: { 2: [2, 2], 3: [2, 1, 1] }, pu: 2, hold: 1, breath: 2, mode: "ion", tonic: 62, home: 4, peak: 9, low: -1, high: 10, leap: .38, rep: .1, motif: .7, hr: 2, bpm: 92, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Broad major-key singalong with bold leaps and a high climax." },
    { id: "jig", name: "Deck Jig", M: "6/8", B: 3, bpb: 2, sub: { 2: [2, 1], 3: [1, 1, 1] }, pu: 1, hold: 1, breath: 1, mode: "ion", tonic: 67, home: 2, peak: 6, low: -3, high: 7, leap: .3, rep: .15, motif: .7, hr: 1, bpm: 104, tempoBeat: 3, beatName: "dotted-quarter",
      blurb: "Quick, bright 6/8 for a ship's deck or a pub. Easy to clap to." },
    { id: "march", name: "War March", M: "4/4", B: 4, bpb: 2, sub: { 2: [3, 1], 3: [2, 1, 1] }, pu: 1, hold: 1, breath: 2, mode: "dor", tonic: 64, home: 2, peak: 7, low: -2, high: 8, leap: .2, rep: .3, motif: .8, hr: 1, bpm: 100, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Dotted marching rhythm in Dorian, tight range, built to be shouted by a column of men." },
    { id: "chant", name: "Host Chant", M: "4/4", B: 4, bpb: 2, sub: { 2: [2, 2], 3: [2, 1, 1] }, pu: 2, hold: 1, breath: 2, mode: "aeo", tonic: 64, home: 1, peak: 5, low: -2, high: 6, leap: .08, rep: .4, motif: .9, hr: 1, bpm: 80, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Low, narrow and droning, close to a monotone. Lifts only for the last line." },
    { id: "air", name: "Slow Air", M: "4/4", B: 4, bpb: 2, sub: { 2: [3, 1], 3: [2, 1, 1] }, pu: 2, hold: 2, breath: 2, mode: "aeo", tonic: 64, home: 3, peak: 9, low: -2, high: 9, leap: .4, rep: .05, motif: .4, hr: 1, bpm: 60, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Solo-voice lament with wide intervals and long holds. Best sung alone, then joined." },
    { id: "chorale", name: "Chorale", M: "4/4", B: 4, bpb: 2, sub: { 2: [2, 2], 3: [2, 1, 1] }, pu: 2, hold: 1, breath: 0, mode: "harm", tonic: 62, home: 3, peak: 8, low: -1, high: 9, leap: .1, rep: .1, motif: .4, hr: 2, bpm: 72, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Stepwise, hymn-like minor with a sharpened leading tone pulling home." },
    { id: "veils", name: "Dark Veils", M: "4/4", B: 4, bpb: 2, sub: { 2: [2, 2], 3: [2, 1, 1] }, pu: 2, hold: 1, breath: 2, mode: "phr", tonic: 64, home: 2, peak: 6, low: -1, high: 7, leap: .15, rep: .25, motif: .7, hr: 1, bpm: 72, tempoBeat: 2, beatName: "quarter-note",
      blurb: "Phrygian and narrow, leaning on the half step above the tonic. Grave and strange." },
  ];
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pickW = (r, items) => { const tot = items.reduce((a, x) => a + x[1], 0); let x = r() * tot; for (const [v, w] of items) { if ((x -= w) <= 0) return v; } return items[items.length - 1][0]; };

  function rhythmFor(st, S) {
    const bar = S.B * S.bpb;
    const events = []; // {s, t, d, strong, line}
    const lineOnsets = [];
    const pk0 = st.lines[0].pat.indexOf(1);
    const pickupLen = Math.max(0, pk0) * S.pu;
    let D = pickupLen; // first downbeat
    let s = 0;
    st.lines.forEach((l, li) => {
      const pat = l.pat, first = Math.max(0, pat.indexOf(1));
      // pickups sit just before the downbeat
      const pick = [];
      for (let i = 0; i < first; i++) pick.push(s + i);
      pick.forEach((si, k) => events.push({ s: si, t: D - (first - k) * S.pu, d: S.pu, strong: false, line: li }));
      lineOnsets.push(first ? D - first * S.pu : D);
      // beats: each strong syllable starts a beat, following weak ones share it
      const beats = [];
      for (let i = first; i < pat.length; i++) { if (pat[i] || !beats.length) beats.push([i]); else beats[beats.length - 1].push(i); }
      beats.forEach((b, bi) => {
        const T = D + bi * S.B;
        let durs = b.length === 1 ? [S.B] : (S.sub[b.length] || Array(b.length).fill(0).map((_, k) => k < b.length - 1 ? 1 : S.B - (b.length - 1)));
        if (durs.reduce((a, x) => a + x, 0) !== S.B) durs = Array(b.length).fill(Math.max(1, Math.floor(S.B / b.length)));
        let x = T;
        b.forEach((i, k) => { events.push({ s: s + i, t: x, d: durs[k], strong: k === 0, line: li }); x += durs[k]; });
      });
      // line end: hold the last note, round up to a bar, leave room for the next line's pickups
      const nb = beats.length + S.hold;
      let E = D + Math.ceil(nb / S.bpb) * bar;
      const next = st.lines[li + 1];
      const nextPick = next ? Math.max(0, next.pat.indexOf(1)) * S.pu : 0;
      const last = events[events.length - 1];
      while (E - nextPick - last.t < S.B) E += bar;
      let end = E - nextPick;
      if (S.breath && end - last.t >= S.B + S.breath + 1) end -= S.breath;
      last.d = end - last.t;
      last.end = true;
      s += pat.length;
      D = E;
    });
    return { events, total: D, pickup: pickupLen, bar, lineOnsets };
  }
  function triad(scale, r) {
    const pcs = [0, 2, 4].map(k => scale[(r + k) % 7] + 12 * Math.floor((r + k) / 7));
    const i1 = pcs[1] - pcs[0], i2 = pcs[2] - pcs[0];
    const q = i1 === 4 && i2 === 7 ? "" : i1 === 3 && i2 === 7 ? "m" : i1 === 3 && i2 === 6 ? "dim" : "aug";
    return { r, pcs, q };
  }
  function harmonyFor(rh, st, S, r) {
    const scale = SCALES[S.mode], chords = [];
    const ok = [0, 1, 2, 3, 4, 5, 6].filter(d => { const q = triad(scale, d).q; return q === "" || q === "m"; });
    const has = d => ok.includes(d);
    const domToI = [has(4) && triad(scale, 4).q === "" ? [4, 5] : null, has(6) ? [6, 3] : null, has(3) ? [3, 2] : null, has(4) ? [4, 2] : null, has(1) && S.mode === "phr" ? [1, 4] : null].filter(Boolean);
    const span = S.B * S.bpb / S.hr;
    const nLines = st.lines.length;
    // cadence per line: last line → I, others alternate half (V or modal substitute) and full/relative
    const cad = st.lines.map((_, li) => {
      if (li === nLines - 1) return 0;
      if (li % 2 === 0) return pickW(r, [[has(4) ? 4 : 6, 3], [has(3) ? 3 : 4, 1], [has(6) ? 6 : 4, S.mode === "ion" ? .2 : 1]]);
      return pickW(r, [[0, 2], [has(5) ? 5 : 0, .7], [has(2) ? 2 : 0, .4]]);
    });
    const slots = [];
    for (let t = rh.pickup; t < rh.total; t += span) slots.push(t);
    const slotAt = x => Math.max(0, Math.floor((x - rh.pickup) / span));
    // each line's cadence chord holds from its last note until the next line's first downbeat
    const evsOf = li => rh.events.filter(e => e.line === li);
    const cadFrom = st.lines.map((_, li) => slotAt(evsOf(li).slice(-1)[0].t));
    const cadTo = st.lines.map((_, li) => li + 1 < nLines ? slotAt(evsOf(li + 1).find(e => e.strong).t) : slots.length);
    let prev = 0;
    slots.forEach((t, k) => {
      const li = cadFrom.findIndex((c, i) => k >= c && k < cadTo[i]);
      const pre = cadFrom.findIndex(c => c === k + 1);
      let d;
      if (li >= 0) d = cad[li];
      else if (k === 0) d = 0;
      else if (pre >= 0) d = cad[pre] === 0 ? pickW(r, domToI) : pickW(r, [[0, 2], [has(3) ? 3 : 0, 1.5], [has(1) ? 1 : 0, 1]]);
      else {
        const cand = ok.map(c => {
          const step = (c - prev + 7) % 7;
          let w = c === 0 ? 1.6 : 1;
          if (step === 3) w *= 2.2; else if (step === 4) w *= 1.5; else if (step === 1 || step === 6) w *= 1.2; else if (step === 0) w *= .35;
          if (S.mode === "mix" && c === 6) w *= 1.8;
          if (S.mode === "dor" && c === 3) w *= 1.6;
          if (S.mode === "phr" && c === 1) w *= 2;
          if (c === 2 && S.mode === "ion") w *= .5;
          return [c, w];
        });
        d = pickW(r, cand);
      }
      if (chords.length && chords[chords.length - 1].deg === d) chords[chords.length - 1].d += span;
      else chords.push({ t, d: span, deg: d });
      prev = d;
    });
    const last = chords[chords.length - 1]; last.d = rh.total - last.t;
    return { chords, cad };
  }
  function melodyFor(rh, harm, st, S, r) {
    const scale = SCALES[S.mode];
    const d7 = d => ((d % 7) + 7) % 7;
    const pitch = deg => S.tonic + 12 * Math.floor(deg / 7) + scale[d7(deg)];
    const chordAt = t => { if (t < rh.pickup) return null; let c = harm.chords[0]; for (const x of harm.chords) if (x.t <= t) c = x; return c; };
    const toneSet = c => c ? [c.deg, c.deg + 2, c.deg + 4].map(d7) : [0, 2, 4];
    const clamp = d => Math.max(S.low, Math.min(S.high, Math.round(d)));
    const nLines = st.lines.length;
    const peakLine = nLines >= 3 ? Math.min(nLines - 1, Math.floor(nLines * 0.6)) : nLines - 1;
    const plan = st.lines.map((_, li) => ({
      start: S.home + (li === 0 ? 0 : Math.round((r() - .3) * 2)),
      peak: li === peakLine ? S.peak : S.home + 1 + Math.round((r() - .5) * 2),
      end: harm.cad[li],
    }));
    const contour = (p, x, li) => {
      const endH = li === nLines - 1 ? (S.home <= 4 ? 0 : 7) : p.end + 7 * Math.round((S.home - p.end) / 7);
      return x < 0.6 ? p.start + (p.peak - p.start) * (x / 0.6) : p.peak + (endH - p.peak) * ((x - 0.6) / 0.4);
    };
    const out = rh.events.map(e => ({ ...e, deg: undefined }));
    const lineEvents = st.lines.map((_, li) => out.filter(e => e.line === li));
    const motifSrc = {};
    let prev = S.home;
    lineEvents.forEach((evs, li) => {
      const p = plan[li], n = evs.length, isLast = li === nLines - 1, half = Math.ceil(n / 2);
      const sig = evs.slice(0, half).map(e => e.d + (e.strong ? "s" : "w")).join(",");
      const src = motifSrc[sig];
      const useMotif = src !== undefined && r() < S.motif;
      if (src === undefined) motifSrc[sig] = li;
      const shiftM = useMotif ? (li === peakLine ? 2 : pickW(r, [[0, 1], [2, 1], [-1, .4]])) : 0;
      const copy = k => useMotif && k < half && lineEvents[src][k] ? clamp(lineEvents[src][k].deg + shiftM) : undefined;
      // 1. skeleton: stressed notes and the line's last note
      let last1 = prev, last2 = null, dir = 0;
      evs.forEach((e, k) => {
        if (!(e.strong || k === n - 1)) return;
        const x = n > 1 ? k / (n - 1) : 1, target = contour(p, x, li), tones = toneSet(chordAt(e.t));
        let deg = copy(k);
        if (deg === undefined && k === n - 1) {
          if (isLast) deg = [0, 7, 14, -7].filter(d => d >= S.low && d <= S.high).reduce((b, d) => Math.abs(d - last1) < Math.abs(b - last1) ? d : b, S.home <= 4 ? 0 : 7);
          else {
            const cands = []; for (let d = S.low; d <= S.high; d++) if (tones.includes(d7(d))) cands.push(d);
            const want = d7(p.end);
            deg = cands.reduce((b, d) => {
              const sc = Math.abs(d - target) + .5 * Math.abs(d - last1) + (d7(d) === want ? 0 : 1.2);
              const sb = Math.abs(b - target) + .5 * Math.abs(b - last1) + (d7(b) === want ? 0 : 1.2);
              return sc < sb ? d : b;
            }, cands[0]);
          }
        } else if (deg === undefined) {
          const maxLeap = r() < S.leap ? 5 : 3;
          let best = null, bs = 1e9;
          for (let d = S.low; d <= S.high; d++) {
            if (!tones.includes(d7(d)) || Math.abs(d - last1) > maxLeap) continue;
            let sc = Math.abs(d - target) + .35 * Math.abs(d - last1) + r() * .8;
            if (d === last1) sc += r() < S.rep ? -.4 : 1.3;
            if (last2 !== null && d === last2 && d !== last1) sc += .9;           // no see-saw
            if (dir && Math.sign(d - last1) === -dir && Math.abs(d - last1) >= 3) sc += .6; // keep momentum
            if (sc < bs) { bs = sc; best = d; }
          }
          deg = best ?? last1;
        }
        deg = clamp(deg);
        if (deg !== last1) dir = Math.sign(deg - last1);
        e.deg = deg; last2 = last1; last1 = deg;
      });
      // 2. pickups and weak syllables fill the gaps between skeleton notes
      for (let k = 0; k < n; k++) {
        if (evs[k].deg !== undefined) continue;
        let j = k; while (j < n && evs[j].deg === undefined) j++;
        const L = j - k, B = evs[j].deg, A = k === 0 ? null : evs[k - 1].deg;
        const run = [];
        for (let q = 0; q < L; q++) { const c = copy(k + q); if (c !== undefined) run.push(c); }
        if (run.length !== L) {
          run.length = 0;
          if (A === null) {
            // pickups: rise into the first stressed note, sometimes from a fourth below
            if (L === 1) run.push(r() < .35 && pitch(B) - pitch(B - 3) === 5 ? B - 3 : B - 1);
            else for (let q = 0; q < L; q++) run.push(B - (L - q));
          } else if (L === 1) {
            const gap = B - A;
            if (Math.abs(gap) >= 2) run.push(A + Math.sign(gap) * Math.max(1, Math.floor(Math.abs(gap) / 2)));
            else if (gap === 0) run.push(r() < S.rep ? A : A + (r() < .65 ? 1 : -1));
            else run.push(r() < .5 ? A : B + gap);
          } else {
            let x = A;
            for (let q = 0; q < L; q++) {
              const left = L - q, gap = B - x;
              if (Math.abs(gap) > left) x += Math.sign(gap);
              else if (gap === 0 && q === 0) x += (r() < .6 ? 1 : -1);
              else if (Math.abs(gap) === left) x += Math.sign(gap);
              else x = r() < S.rep ? x : x + (gap ? Math.sign(gap) : (r() < .5 ? 1 : -1));
              run.push(x);
            }
          }
        }
        run.forEach((d, q) => { evs[k + q].deg = clamp(d); });
        k = j;
      }
      // the final note is approached by step where the line allows it
      if (isLast && n >= 3) {
        const f = evs[n - 1].deg, pv = evs[n - 2], before = evs[n - 3].deg;
        if (Math.abs(pv.deg - f) > 2 && !pv.strong) {
          const opts = [f + 1, f - 1].filter(x => Math.abs(x - before) <= 2);
          if (opts.length) pv.deg = opts[0];
        }
      }
      prev = evs[n - 1].deg;
    });
    out.forEach(e => { e.m = pitch(e.deg); });
    return out;
  }
  function compose(st, S, seed) {
    const r = rng(seed);
    const rh = rhythmFor(st, S);
    const harm = harmonyFor(rh, st, S, r);
    const evs = melodyFor(rh, harm, st, S, r);
    const scale = SCALES[S.mode];
    const L = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"][mod12(S.tonic)];
    const kStr = L + KMODE[S.mode];
    const t = {
      id: "c-" + S.id + "-" + seed, styleId: S.id, seed, source: "composed",
      name: S.name, tag: L.replace("#", "♯").replace("b", "♭") + " " + MODE_NAME[S.mode] + " · " + S.M,
      blurb: S.blurb, bpm: S.bpm, beat: S.tempoBeat, beatName: S.beatName,
      abcHead: ["X:1", "M:" + S.M, "L:1/8", "K:" + kStr + " clef=treble-8"],
      total: rh.total, pickup: rh.pickup, shape: st.shape.slice(), meter: st.meterName,
      notes: evs.map(e => ({ t: e.t, d: e.d, m: e.m, s: e.s })),
    };
    const ki = keyInfo(t), f = ki.f0;
    t.chords = harm.chords.map(c => {
      const tr = triad(scale, c.deg), root = S.tonic + scale[c.deg];
      const nm = spell(60 + mod12(root), f, mod12(ki.tonic - 1));
      return { t: c.t, d: c.d, name: nm.L + (nm.a > 0 ? "#" : nm.a < 0 ? "b" : "") + tr.q, v: voicing(mod12(root), tr.q) };
    });
    t.lineBars = lineBarsFromOnsets(t, rh.lineOnsets);
    return t;
  }
  function voicing(rootPc, q) {
    const bass = 36 + mod12(rootPc - 0);
    const b = bass < 38 ? bass + 12 : bass;
    const third = q === "m" || q === "dim" ? 3 : 4, fifth = q === "dim" ? 6 : q === "aug" ? 8 : 7;
    const top = [0, third, fifth].map(x => 48 + mod12(rootPc + x)).map(x => x < 50 ? x + 12 : x).sort((a, b) => a - b);
    return [b].concat(top);
  }
  function voicingFromName(name) {
    const m = name.match(/^([A-G])([#b]?)(.*)$/); if (!m) return [38, 50, 53, 57];
    const pc = mod12(NAT[LET.indexOf(m[1])] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0));
    const rest = m[3];
    const q = /^dim/.test(rest) ? "dim" : /^m(?!aj)/.test(rest) ? "m" : /^aug|\+/.test(rest) ? "aug" : "";
    const v = voicing(pc, q);
    if (/7/.test(rest)) v.push(48 + mod12(pc + (/maj7/.test(rest) ? 11 : 10)) + (mod12(pc + 10) < 2 ? 12 : 0));
    return v;
  }

  // =====================================================================
  // Claude composer (sample capability)
  // =====================================================================
  const NOTE_RE = /^([A-Ga-g])([#b♯♭]?)(-?\d)$/;
  function noteToMidi(s) {
    const m = String(s).trim().match(NOTE_RE); if (!m) return null;
    const a = m[2] === "#" || m[2] === "♯" ? 1 : m[2] === "b" || m[2] === "♭" ? -1 : 0;
    return 12 * (+m[3] + 1) + NAT[LET.indexOf(m[1].toUpperCase())] + a;
  }
  const MODE_CODES = { major: "", ionian: "", minor: "m", aeolian: "m", "harmonic minor": "m", dorian: "dor", mixolydian: "mix", phrygian: "phr", lydian: "lyd" };
  function claudePrompt(st, direction) {
    const lines = st.lines.map((l, li) => {
      const s0 = st.lines.slice(0, li).reduce((a, x) => a + x.syls.length, 0);
      return "Line " + (li + 1) + " (" + l.syls.length + " syllables): " + l.text + "\n   " +
        l.syls.map((s, i) => (s0 + i) + ":" + s.a + (l.pat[i] ? "*" : "")).join(" ");
    }).join("\n");
    return [
      "You are a gifted composer of memorable, singable melodies (hymns, ballads, folk songs, anthems) for men's voices.",
      "Compose 3 contrasting, original melodies for the stanza below. Each melody sets every syllable to exactly one note (no melismas). The same tune will be sung to every stanza of this shape, so it must work for the meter, not only for these words.",
      "",
      "STANZA (meter guessed as " + st.meterName + ", shape " + st.shape.join(".") + "). Syllables are numbered from 0; * marks the syllables my analysis thinks are stressed. Trust your own ear if it disagrees.",
      lines,
      "",
      "MUSICAL RULES",
      "- Stressed syllables fall on strong beats; unstressed ones on weak beats or pickups.",
      "- Hold the last note of each line; let line ends cadence (half cadence mid-stanza, the tonic at the very end).",
      "- A real hook: a memorable opening motif that returns or is answered. Avoid aimless wandering; give the melody one clear high point.",
      "- Mostly stepwise with a few purposeful leaps; a range of at most a twelfth; men sing it.",
      "- Pitches are WRITTEN pitch for treble clef with an 8 below (men sing an octave lower than written). Keep written pitches between C4 and G5. Use names like D4, F#4, Bb4.",
      "- Make the three tunes clearly different in meter, mode and character.",
      direction ? "- The songwriter asks: " + direction.slice(0, 500) : "",
      "",
      "TIMING",
      "- Times are integers counted in EIGHTH notes. t=0 is the first sung note.",
      "- meter is one of \"4/4\", \"6/8\", \"3/4\". A bar is 8 eighths in 4/4, 6 in 6/8 and 3/4.",
      "- pickup = how many eighths come before the first bar line (0 if the first syllable is on a downbeat). Bar lines then fall at pickup, pickup+bar, ...",
      "- Notes must not overlap: each start >= previous start + previous dur. Gaps are rests. A note may cross a bar line.",
      "",
      "HARMONY",
      "- chords: simple triads (and an occasional 7th), changing on bar lines or half bars, covering from the first bar line to the end. Name them like D, Dm, F#m, Bb, G7.",
      "",
      "Respond with JSON only, no prose, in exactly this shape:",
      '{"tunes":[{"name":"short evocative title","blurb":"one sentence on its character","meter":"6/8","tonic":"D","mode":"dorian","bpm":66,"pickup":0,"notes":[{"s":0,"start":0,"dur":3,"pitch":"A4"}],"chords":[{"start":0,"dur":6,"name":"Dm"}]}]}',
      "mode is one of major, minor, harmonic minor, dorian, mixolydian, phrygian, lydian. bpm counts dotted quarters in 6/8 and quarters otherwise. notes must contain exactly one entry for every syllable number from 0 to " + (st.shape.reduce((a, b) => a + b, 0) - 1) + ", in order.",
    ].filter(x => x !== "").join("\n");
  }
  function tuneFromClaude(obj, st, k, stamp) {
    const n = st.shape.reduce((a, b) => a + b, 0);
    const meter = ["4/4", "6/8", "3/4"].includes(obj.meter) ? obj.meter : "4/4";
    const [mn, md] = meter.split("/").map(Number), bar = mn * 8 / md;
    const tm = String(obj.tonic || "D").match(/^([A-Ga-g])([#b♯♭]?)/);
    if (!tm) throw new Error("no tonic");
    const tonic = tm[1].toUpperCase() + (tm[2] === "#" || tm[2] === "♯" ? "#" : tm[2] === "b" || tm[2] === "♭" ? "b" : "");
    const mode = MODE_CODES[String(obj.mode || "major").toLowerCase()] ?? "";
    const notes = (obj.notes || []).map(x => ({ s: +x.s, t: Math.round(+x.start), d: Math.round(+x.dur), m: noteToMidi(x.pitch) }))
      .filter(x => Number.isInteger(x.s) && x.m !== null && x.d > 0 && x.t >= 0).sort((a, b) => a.s - b.s);
    if (notes.length !== n || notes.some((x, i) => x.s !== i)) throw new Error("wrong number of notes");
    for (let i = 1; i < n; i++) {
      if (notes[i].t < notes[i - 1].t + 1) notes[i].t = notes[i - 1].t + 1;
      if (notes[i - 1].t + notes[i - 1].d > notes[i].t) notes[i - 1].d = notes[i].t - notes[i - 1].t;
    }
    if (notes.some(x => x.m < 40 || x.m > 88)) throw new Error("pitch out of range");
    const pickup = Math.max(0, Math.min(bar - 1, Math.round(+obj.pickup || 0)));
    const lastEnd = notes[n - 1].t + notes[n - 1].d;
    const total = pickup + Math.ceil(Math.max(1, lastEnd - pickup) / bar) * bar;
    const tag = tonic.replace("#", "♯").replace("b", "♭") + " " + (obj.mode || "major") + " · " + meter;
    const t = {
      id: "ai-" + stamp + "-" + k, source: "claude", name: String(obj.name || "Claude tune " + (k + 1)).slice(0, 40),
      tag, blurb: String(obj.blurb || "").slice(0, 200), bpm: Math.max(30, Math.min(200, Math.round(+obj.bpm || 80))),
      beat: meter === "6/8" ? 3 : 2, beatName: meter === "6/8" ? "dotted-quarter" : "quarter-note",
      abcHead: ["X:1", "M:" + meter, "L:1/8", "K:" + tonic + mode + " clef=treble-8"],
      total, pickup, shape: st.shape.slice(), notes,
    };
    keyInfo(t); // throws on a bad key
    t.chords = (obj.chords || []).map(c => ({ t: Math.round(+c.start), d: Math.round(+c.dur), name: String(c.name || "").replace(/[♯]/g, "#").replace(/[♭]/g, "b").trim() }))
      .filter(c => c.d > 0 && c.t >= 0 && c.t < total && /^[A-G][#b]?/.test(c.name)).sort((a, b) => a.t - b.t)
      .map(c => ({ ...c, d: Math.min(c.d, total - c.t), v: voicingFromName(c.name) }));
    const onsets = []; let s0 = 0; st.shape.forEach(c => { onsets.push(notes[s0].t); s0 += c; });
    t.lineBars = lineBarsFromOnsets(t, onsets);
    return t;
  }

  // =====================================================================
  // State
  // =====================================================================
  const BUILTIN = TUNES;
  BUILTIN.forEach(t => {
    t.source = "baladin"; t.shape = [10, 10, 10, 10]; t.pickup = 0;
    const nBars = t.total / barLen(t); t.lineBars = t.abcLines.map(() => nBars / t.abcLines.length);
  });
  const STORE = "composer-v1";
  let composed = [];      // tunes made by the built-in composer or Claude
  let stanzas = [], stanzaIdx = 0, tune = null;
  let octave = -12, shift = 0;
  let lyricText = DEFAULT_TEXT;
  const prepTune = t => { if (!t.orig) t.orig = t.notes.map(n => n.m); return t; };
  BUILTIN.forEach(prepTune);
  const allTunes = () => BUILTIN.concat(composed);
  const isEdited = t => t.notes.some((n, i) => n.m !== t.orig[i]);
  const cur = () => stanzas[stanzaIdx];
  const fits = (t, st) => st && same(t.shape, st.shape);

  function snapshot() {
    const edits = {};
    allTunes().forEach(t => { if (isEdited(t)) edits[t.id] = t.notes.map(n => n.m); });
    return {
      v: 1, text: lyricText, stanza: stanzaIdx, tune: tune && tune.id, shift, octave,
      composed: composed.map(t => ({ ...t, notes: t.notes.map((n, i) => ({ ...n, m: t.orig[i] })), orig: undefined })), edits,
    };
  }
  function applySnapshot(s) {
    if (!s || typeof s !== "object") return;
    if (typeof s.text === "string") lyricText = s.text;
    composed = Array.isArray(s.composed) ? s.composed.filter(t => t && Array.isArray(t.notes) && Array.isArray(t.abcHead) && Array.isArray(t.shape)).map(t => prepTune({ ...t, orig: null })) : [];
    allTunes().forEach(t => { t.notes.forEach((n, i) => n.m = t.orig[i]); });
    const e = s.edits || {};
    allTunes().forEach(t => { const a = e[t.id]; if (Array.isArray(a) && a.length === t.notes.length) a.forEach((m, i) => { if (Number.isFinite(m)) t.notes[i].m = m; }); });
    if (Number.isInteger(s.shift) && Math.abs(s.shift) <= 6) shift = s.shift;
    if (s.octave === 0 || s.octave === -12) octave = s.octave;
    stanzas = parseLyrics(lyricText);
    stanzaIdx = Number.isInteger(s.stanza) && s.stanza < stanzas.length ? s.stanza : 0;
    tune = allTunes().find(t => t.id === s.tune) || null;
  }
  let saveTimer = 0;
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(snapshot())); } catch (e) {} }, 250); }
  try { const raw = localStorage.getItem(STORE); if (raw) applySnapshot(JSON.parse(raw)); } catch (e) {}
  if (!stanzas.length) stanzas = parseLyrics(lyricText);
  if (!tune) {
    const ci = stanzas.findIndex(s => /chorus/i.test(s.name));
    if (ci >= 0) stanzaIdx = ci;
    tune = allTunes().find(t => fits(t, cur())) || null;
  }

  // =====================================================================
  // Lyrics panel
  // =====================================================================
  const lyricsBox = $("lyricsText");
  lyricsBox.value = lyricText;
  let parseTimer = 0;
  lyricsBox.addEventListener("input", () => {
    clearTimeout(parseTimer);
    parseTimer = setTimeout(() => {
      lyricText = lyricsBox.value;
      const prevName = cur() && cur().name;
      stanzas = parseLyrics(lyricText);
      const k = stanzas.findIndex(s => s.name === prevName);
      stanzaIdx = k >= 0 ? k : Math.min(stanzaIdx, Math.max(0, stanzas.length - 1));
      if (playing) stop();
      refreshAll(); save();
    }, 450);
  });
  $("clearLyrics").addEventListener("click", () => {
    lyricsBox.value = ""; lyricText = ""; stanzas = []; stanzaIdx = 0; if (playing) stop(); refreshAll(); save(); lyricsBox.focus();
  });
  $("sampleLyrics").addEventListener("click", () => {
    lyricsBox.value = DEFAULT_TEXT; lyricText = DEFAULT_TEXT; stanzas = parseLyrics(lyricText);
    const ci = stanzas.findIndex(s => /chorus/i.test(s.name)); stanzaIdx = ci >= 0 ? ci : 0;
    if (playing) stop(); refreshAll(); save();
  });
  function renderMeter() {
    const box = $("meterInfo"); box.innerHTML = "";
    if (!stanzas.length) { box.textContent = "Type or paste lyrics above. Separate stanzas with a blank line; a line like [Chorus] names the stanza below it."; return; }
    const groups = new Map();
    stanzas.forEach(st => { const k = st.shape.join("."); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(st); });
    const p = document.createElement("p");
    p.textContent = stanzas.length + " stanza" + (stanzas.length > 1 ? "s" : "") + " · " + [...groups.keys()].map(k => k + " (" + groups.get(k).length + "×)").join(", ");
    box.appendChild(p);
    const st = cur(); if (!st) return;
    const d = document.createElement("div"); d.className = "meter-lines";
    st.lines.forEach(l => {
      const row = document.createElement("div"); row.className = "meter-line";
      const c = document.createElement("span"); c.className = "mcount"; c.textContent = l.syls.length; row.appendChild(c);
      const txt = document.createElement("span");
      l.syls.forEach((s, i) => {
        const sp = document.createElement("span"); sp.className = "ms" + (l.pat[i] ? " st" : "");
        sp.textContent = s.d.replace(/-$/, ""); txt.appendChild(sp);
        txt.appendChild(document.createTextNode(s.sp ? " " : s.d.endsWith("-") ? "-" : "·"));
      });
      row.appendChild(txt); d.appendChild(row);
    });
    const meta = document.createElement("p"); meta.className = "meter-meta";
    meta.textContent = st.name + ": " + st.shape.join(".") + ", " + st.meterName + ". Stressed syllables are underlined; dots show syllable breaks. If a count is off, write the word with hyphens (Bal-a-din) or elide it (heav'n).";
    box.appendChild(meta); box.appendChild(d);
  }
  function fillStanzas() {
    const sel = $("stanza"); sel.innerHTML = "";
    stanzas.forEach((st, i) => { const o = document.createElement("option"); o.value = i; o.textContent = st.name + " · " + st.shape.join("."); sel.appendChild(o); });
    sel.value = stanzaIdx; sel.disabled = !stanzas.length;
  }
  $("stanza").addEventListener("change", () => {
    stanzaIdx = +$("stanza").value; if (playing) stop();
    const st = cur();
    if (tune && !fits(tune, st)) tune = allTunes().find(t => fits(t, st)) || tune;
    refreshAll(); save();
  });

  // =====================================================================
  // Lyric lamp
  // =====================================================================
  const lyricEl = $("lyric");
  let sylEls = [], lineEls = [], lineOf = [];
  function renderLyric() {
    lyricEl.innerHTML = ""; sylEls = []; lineEls = [];
    const st = cur();
    if (!st) { lyricEl.innerHTML = '<p class="empty">No lyrics yet.</p>'; return; }
    const fl = stanzaSyls(st); lineOf = fl.lineOf;
    let k = 0;
    st.lines.forEach(l => {
      const div = document.createElement("div"); div.className = "line";
      l.syls.forEach(s => {
        const span = document.createElement("span"); span.className = "syl"; span.textContent = s.d;
        div.appendChild(span); if (s.sp) div.appendChild(document.createTextNode(" "));
        sylEls[k++] = span;
      });
      lyricEl.appendChild(div); lineEls.push(div);
    });
  }

  // =====================================================================
  // Tune picker and composing
  // =====================================================================
  const tunesEl = $("tunes"), presetEl = $("presets");
  function tuneCard(t, label) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tune"; b.dataset.id = t.id;
    b.setAttribute("aria-pressed", String(tune && t.id === tune.id));
    b.innerHTML = '<span class="tn"><small></small></span><span class="tt"></span><span class="tb"></span>';
    b.querySelector("small").textContent = label;
    b.querySelector(".tn").appendChild(document.createTextNode(t.name + (isEdited(t) ? " ✎" : "")));
    b.querySelector(".tt").textContent = t.tag; b.querySelector(".tb").textContent = t.blurb || "";
    b.addEventListener("click", () => selectTune(t, true));
    return b;
  }
  function renderTunes() {
    const st = cur();
    tunesEl.innerHTML = ""; presetEl.innerHTML = "";
    const shapeKey = st ? st.shape.join(".") : "";
    $("shapeName").textContent = st ? shapeKey + " (" + st.meterName + ")" : "—";
    const mine = st ? composed.filter(t => fits(t, st)) : [];
    mine.forEach((t, i) => tunesEl.appendChild(tuneCard(t, t.source === "claude" ? "Claude" : String(i + 1).padStart(2, "0"))));
    $("noTunes").hidden = mine.length > 0 || !st;
    $("compose").disabled = !st; $("askClaude").disabled = !st || !sampleFn;
    $("clearComposed").hidden = !mine.length;
    const presets = st ? BUILTIN.filter(t => fits(t, st)) : [];
    $("presetWrap").hidden = !presets.length;
    presets.forEach((t, i) => presetEl.appendChild(tuneCard(t, i === 0 ? "Orig" : String(i).padStart(2, "0"))));
  }
  $("compose").addEventListener("click", () => {
    const st = cur(); if (!st) return;
    const base = (Date.now() & 0xffffff);
    const fresh = STYLES.map((S, i) => prepTune(compose(st, S, base + i * 7919)));
    composed = composed.filter(t => !(fits(t, st) && t.source === "composed")).concat(fresh);
    selectTune(fresh[0], false);
    renderTunes(); save();
    $("composeStatus").textContent = "Composed 12 tunes for " + st.shape.join(".") + ". Press again for a new set.";
  });
  $("clearComposed").addEventListener("click", () => {
    const st = cur(); if (!st) return;
    composed = composed.filter(t => !fits(t, st));
    if (tune && !allTunes().includes(tune)) tune = allTunes().find(t => fits(t, st)) || null;
    $("composeStatus").textContent = "";
    refreshAll(); save();
  });
  let sampleFn = null, askCtl = null;
  if (window.claude && claude.use) claude.use("sample").then(s => { sampleFn = s; $("claudeWrap").hidden = !s; renderTunes(); }).catch(() => {});
  $("askClaude").addEventListener("click", async () => {
    const st = cur(); if (!st || !sampleFn) return;
    const btn = $("askClaude"), status = $("composeStatus");
    btn.disabled = true; $("stopClaude").hidden = false;
    askCtl = new AbortController();
    status.textContent = "Asking Claude… (this can take a minute)";
    try {
      const { text } = await sampleFn(claudePrompt(st, $("claudeDirection").value.trim()), {
        signal: askCtl.signal, cache: false, modelTier: "default",
        onText: ({ text }) => { status.textContent = "Claude is writing… " + text.length + " characters"; },
      });
      const j = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const obj = JSON.parse(j);
      const stamp = Date.now().toString(36), made = [], bad = [];
      (obj.tunes || []).forEach((x, k) => { try { made.push(prepTune(tuneFromClaude(x, st, k, stamp))); } catch (e) { bad.push((x && x.name) || "tune " + (k + 1)); } });
      if (!made.length) throw { code: "unusable" };
      composed = composed.concat(made);
      selectTune(made[0], false); renderTunes(); save();
      status.textContent = "Claude wrote " + made.length + " tune" + (made.length > 1 ? "s" : "") + (bad.length ? " (" + bad.length + " didn't fit the lyrics and were skipped)" : "") + ".";
    } catch (e) {
      const c = e && e.code;
      status.textContent = c === "cancelled" ? "Stopped." : c === "not_granted" ? "Claude wasn't allowed for this page." :
        c === "rate_limited" ? "Too many requests right now; try again in a minute." : c === "unusable" || e instanceof SyntaxError ? "Claude's answer didn't come back in a usable form. Try again." :
        "Couldn't reach Claude" + (e && e.message ? " (" + e.message + ")" : "") + ".";
      if (c === "not_granted" || c === "sampling_disabled" || c === "not_declared") { $("claudeWrap").hidden = true; sampleFn = null; }
    } finally { btn.disabled = !sampleFn; $("stopClaude").hidden = true; askCtl = null; }
  });
  $("stopClaude").addEventListener("click", () => askCtl && askCtl.abort());

  // =====================================================================
  // Sheet music
  // =====================================================================
  function renderSheet() {
    const st = cur(), t = tune;
    if (!t) { $("sheet").textContent = ""; $("abcText").value = ""; return; }
    const abc = t.abcHead.slice();
    if (shift) abc[abc.findIndex(h => h.startsWith("K:"))] = "K:" + keyLabel(t, shift).abc + " clef=treble-8";
    const custom = shift !== 0 || isEdited(t) || !t.abcLines;
    const syl = fits(t, st) ? stanzaSyls(st).syls.map(s => s.a + (s.join ? "-" : "")) : null;
    let k = 0;
    (custom ? genLines(t, shift) : t.abcLines).forEach(([m, n]) => {
      abc.push(m);
      if (syl) { const w = syl.slice(k, k + n); k += n; abc.push("w:" + w.map((s, i) => s + (s.endsWith("-") || i === w.length - 1 ? "" : " ")).join("")); }
    });
    try {
      if (window.ABCJS) ABCJS.renderAbc("sheet", abc.join("\n"), { responsive: "resize", staffwidth: 700, paddingtop: 4, paddingbottom: 4 });
      else $("sheet").textContent = abc.join("\n");
    } catch (e) { $("sheet").textContent = abc.join("\n"); }
    $("abcText").value = abc.join("\n");
  }

  // =====================================================================
  // Audio
  // =====================================================================
  let ctx = null, master = null, playing = false, stopTimers = [], raf = 0, startT = 0, sylTimes = [];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.8;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  // A sung "ah": sawtooth through two vowel formants, with gentle late vibrato.
  function voice(midi, t, dur, C = ctx, out = master) {
    const f = hz(midi);
    const osc = C.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = f;
    const osc2 = C.createOscillator(); osc2.type = "triangle"; osc2.frequency.value = f; osc2.detune.value = 5;
    const vib = C.createOscillator(); vib.frequency.value = 5.2;
    const vibG = C.createGain(); vibG.gain.setValueAtTime(0, t); vibG.gain.linearRampToValueAtTime(0, t + Math.min(.35, dur * .5)); vibG.gain.linearRampToValueAtTime(f * .006, t + Math.min(.8, dur));
    vib.connect(vibG); vibG.connect(osc.frequency); vibG.connect(osc2.frequency);
    const mix = C.createGain();
    const f1 = C.createBiquadFilter(); f1.type = "bandpass"; f1.frequency.value = 730; f1.Q.value = 5;
    const f2 = C.createBiquadFilter(); f2.type = "bandpass"; f2.frequency.value = 1090; f2.Q.value = 6;
    const lp = C.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
    const g1 = C.createGain(); g1.gain.value = 1.1; const g2 = C.createGain(); g2.gain.value = .6; const g3 = C.createGain(); g3.gain.value = .35;
    osc.connect(f1); osc.connect(f2); osc.connect(lp); osc2.connect(lp);
    f1.connect(g1); f2.connect(g2); lp.connect(g3); g1.connect(mix); g2.connect(mix); g3.connect(mix);
    const env = C.createGain(); env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(.32, t + .05);
    env.gain.setValueAtTime(.3, t + Math.max(.06, dur - .09));
    env.gain.linearRampToValueAtTime(0, t + dur + .06);
    mix.connect(env); env.connect(out);
    [osc, osc2, vib].forEach(o => { o.start(t); o.stop(t + dur + .1); });
  }
  function pad(midis, t, dur, C = ctx, out = master) {
    midis.forEach((m, i) => {
      const o = C.createOscillator(); o.type = i === 0 ? "triangle" : "sine"; o.frequency.value = hz(m + octave + 12 + shift);
      const lp = C.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
      const g = C.createGain(); const peak = i === 0 ? .16 : .055;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .12);
      g.gain.setValueAtTime(peak * .8, t + Math.max(.15, dur - .15)); g.gain.linearRampToValueAtTime(0, t + dur + .05);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .1);
    });
  }
  const canPlay = () => tune && fits(tune, cur());
  function play() {
    if (!canPlay()) return;
    ensureCtx();
    const bpm = +$("bpm").value, e = 60 / bpm / tune.beat;
    startT = ctx.currentTime + .12; sylTimes = [];
    tune.notes.forEach(n => { voice(n.m + octave + shift, startT + n.t * e, n.d * e * .97); sylTimes.push([startT + n.t * e, startT + (n.t + n.d) * e, n.s]); });
    if ($("chords").checked) tune.chords.forEach(c => pad(c.v, startT + c.t * e, c.d * e));
    const total = tune.total * e;
    playing = true; $("play").textContent = "Stop";
    stopTimers.push(setTimeout(() => { if ($("loop").checked && playing) { clearState(); play(); } else stop(); }, (total + .15) * 1000));
    tick();
  }
  function clearState() { stopTimers.forEach(clearTimeout); stopTimers = []; cancelAnimationFrame(raf); sylEls.forEach(s => s.classList.remove("on")); lineEls.forEach(l => l.classList.remove("on")); rollRects.forEach(g => g.classList.remove("on")); }
  function stop() {
    playing = false; clearState(); $("play").textContent = "Play";
    if (master) { const old = master; old.gain.setTargetAtTime(0, ctx.currentTime, .05); master = ctx.createGain(); master.gain.value = .8; const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination); setTimeout(() => old.disconnect(), 400); }
  }
  function tick() {
    const now = ctx.currentTime; let active = -1;
    for (const [a, b, i] of sylTimes) if (now >= a && now < b) active = i;
    sylEls.forEach((s, i) => s.classList.toggle("on", i === active));
    rollBySyl.forEach((g, i) => g && g.classList.toggle("on", i === active));
    if (active >= 0) lineEls.forEach((l, i) => l.classList.toggle("on", i === lineOf[active]));
    if (playing) raf = requestAnimationFrame(tick);
  }
  $("play").addEventListener("click", () => playing ? stop() : play());
  function setPressed(a, b) { $(a).setAttribute("aria-pressed", "true"); $(b).setAttribute("aria-pressed", "false"); }
  $("o-men").addEventListener("click", () => { octave = -12; setPressed("o-men", "o-high"); save(); if (playing) { stop(); play(); } });
  $("o-high").addEventListener("click", () => { octave = 0; setPressed("o-high", "o-men"); save(); if (playing) { stop(); play(); } });
  $("bpm").addEventListener("input", () => { $("bpmOut").textContent = $("bpm").value; });
  $("bpm").addEventListener("change", () => { if (playing) { stop(); play(); } });

  // =====================================================================
  // Note editor (piano roll)
  // =====================================================================
  const EW = 20, RH = 13, GW = 38, LYR = 22;
  let rollRects = [], rollBySyl = [], rollRange = null, drag = null, sel = 0;
  const curFifths = () => fifthsFor(keyInfo(tune).f0, shift);
  const ltOf = sh => mod12(keyInfo(tune).tonic + sh - 1);
  const noteName = (m, f) => { const sp = spell(m, f, ltOf(shift)); return sp.L + accSym(sp.a); };
  function svgEl(tag, attrs, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function renderRoll() {
    const svg = $("roll"), gut = $("rollGut");
    svg.innerHTML = ""; gut.innerHTML = ""; rollRects = []; rollBySyl = [];
    const t = tune;
    $("editor").hidden = !t;
    if (!t) return;
    const f = curFifths(), tonic = mod12(keyInfo(t).tonic + shift);
    const ms = t.notes.map(n => n.m).concat(t.orig);
    const lo = Math.min(...ms) - 4, hi = Math.max(...ms) + 4;
    rollRange = { lo, hi };
    const H = (hi - lo + 1) * RH, W = t.total * EW + 4;
    svg.setAttribute("width", W); svg.setAttribute("height", H + LYR);
    gut.setAttribute("width", GW); gut.setAttribute("height", H + LYR);
    const yOf = m => (hi - m) * RH;
    for (let m = lo; m <= hi; m++) {
      const d = m + shift, cls = mod12(d) === tonic ? "row-tonic" : inKey(d, f) ? "row-in" : "row-out";
      svgEl("rect", { x: 0, y: yOf(m), width: W, height: RH, class: cls }, svg);
      if (inKey(d, f)) svgEl("text", { x: GW - 6, y: yOf(m) + RH - 3, "text-anchor": "end", class: "gl" + (cls === "row-tonic" ? " tonic" : "") }, gut).textContent = noteName(d, f);
    }
    const starts = new Set(barStarts(t)), pk = t.pickup || 0;
    for (let x = pk % t.beat; x <= t.total; x += t.beat) if (!starts.has(x)) svgEl("line", { x1: x * EW + .5, x2: x * EW + .5, y1: 0, y2: H, class: "beat" }, svg);
    [...starts, t.total].forEach(x => svgEl("line", { x1: x * EW + .5, x2: x * EW + .5, y1: 0, y2: H, class: "bar" }, svg));
    const st = cur(), syl = fits(t, st) ? stanzaSyls(st).syls : [];
    t.notes.forEach((n, i) => {
      const g = svgEl("g", { class: "rn", tabindex: -1, "data-i": i, role: "button" }, svg);
      svgEl("rect", { x: n.t * EW + 1.5, width: Math.max(4, n.d * EW - 3), height: RH - 2 }, g);
      svgEl("text", { x: n.t * EW + 5 }, g);
      rollRects[i] = g; rollBySyl[n.s] = g;
      placeNote(i);
      svgEl("text", { x: n.t * EW + 2, y: H + 15, class: "lyr" }, svg).textContent = syl[n.s] ? syl[n.s].d.replace(/-$/, "") : "";
    });
    $("editedFlag").hidden = !isEdited(t); $("resetNotes").disabled = !isEdited(t);
    if (sel >= t.notes.length) sel = 0;
    selectNote(sel, false, false);
  }
  function placeNote(i) {
    const n = tune.notes[i], g = rollRects[i], f = curFifths(), y = (rollRange.hi - n.m) * RH;
    const [r, tx] = g.children;
    r.setAttribute("y", y + 1); tx.setAttribute("y", y + RH - 3.5);
    const name = noteName(n.m + shift, f);
    tx.textContent = n.d * EW >= 16 ? name : "";
    g.classList.toggle("changed", n.m !== tune.orig[i]);
    g.setAttribute("aria-label", "Note " + (i + 1) + ": " + name);
  }
  function selectNote(i, focus, sound) {
    if (!rollRects[i]) return;
    rollRects.forEach((g, j) => { g.classList.toggle("sel", j === i); g.setAttribute("tabindex", j === i ? 0 : -1); });
    sel = i;
    const sc = $("rollScroll"), n = tune.notes[i], x = n.t * EW, w = n.d * EW;
    if (x < sc.scrollLeft + 20) sc.scrollLeft = Math.max(0, x - 40);
    else if (x + w > sc.scrollLeft + sc.clientWidth - 20) sc.scrollLeft = x + w - sc.clientWidth + 40;
    if (focus) rollRects[i].focus({ preventScroll: true });
    if (sound) preview(n.m);
  }
  function preview(m) { ensureCtx(); voice(m + shift + octave, ctx.currentTime + .01, .32); }
  function snapTo(raw) {
    if ($("chromatic").checked) return Math.round(raw);
    const f = keyInfo(tune).f0; let best = null;
    for (let m = Math.floor(raw) - 2; m <= Math.ceil(raw) + 2; m++) if (inKey(m, f) && (best === null || Math.abs(m - raw) < Math.abs(best - raw))) best = m;
    return best;
  }
  function stepNote(m, dir, big) {
    if (big) return m + 12 * dir;
    if ($("chromatic").checked) return m + dir;
    const f = keyInfo(tune).f0; let x = m + dir; while (!inKey(x, f)) x += dir; return x;
  }
  function setNote(i, m) {
    const { lo, hi } = rollRange; m = Math.max(lo, Math.min(hi, m));
    if (tune.notes[i].m === m) return false;
    tune.notes[i].m = m; placeNote(i); preview(m); return true;
  }
  function commitEdits() { save(); renderSheet(); $("editedFlag").hidden = !isEdited(tune); $("resetNotes").disabled = !isEdited(tune); markCard(); }
  function markCard() { document.querySelectorAll('.tune[data-id="' + CSS.escape(tune.id) + '"] .tn').forEach(el => { el.lastChild.textContent = tune.name + (isEdited(tune) ? " ✎" : ""); }); }
  $("roll").addEventListener("pointerdown", e => {
    const g = e.target.closest(".rn"); if (!g) return;
    e.preventDefault();
    try { g.setPointerCapture(e.pointerId); } catch (_) {}
    const i = +g.dataset.i; selectNote(i, true, false);
    drag = { i, g, start: tune.notes[i].m }; g.classList.add("drag"); preview(tune.notes[i].m);
  });
  $("roll").addEventListener("pointermove", e => {
    if (!drag) return;
    const top = $("roll").getBoundingClientRect().top;
    const m = snapTo(rollRange.hi - (e.clientY - top - RH / 2) / RH);
    if (m !== null) setNote(drag.i, m);
  });
  $("rollScroll").addEventListener("pointerdown", e => { if (!e.target.closest(".rn") && rollRects[sel]) rollRects[sel].focus({ preventScroll: true }); });
  function endDrag() { if (!drag) return; drag.g.classList.remove("drag"); const changed = tune.notes[drag.i].m !== drag.start; drag = null; if (changed) commitEdits(); }
  $("roll").addEventListener("pointerup", endDrag);
  $("roll").addEventListener("pointercancel", endDrag);
  $("editor").addEventListener("keydown", e => {
    if (!e.target.closest(".roll") || !tune || !tune.notes[sel]) return;
    const i = sel;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const m = stepNote(tune.notes[i].m, e.key === "ArrowUp" ? 1 : -1, e.shiftKey);
      if (m < rollRange.lo || m > rollRange.hi) { tune.notes[i].m = m; renderRoll(); selectNote(i, true, false); preview(m); commitEdits(); }
      else if (setNote(i, m)) commitEdits();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); const j = i + (e.key === "ArrowRight" ? 1 : -1);
      if (rollRects[j]) selectNote(j, true, true);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault(); selectNote(e.key === "Home" ? 0 : rollRects.length - 1, true, true);
    }
  });
  $("resetNotes").addEventListener("click", () => { tune.notes.forEach((n, i) => n.m = tune.orig[i]); save(); renderRoll(); renderSheet(); markCard(); });

  // =====================================================================
  // Key
  // =====================================================================
  function fillKeys() {
    const sel = $("key"); sel.innerHTML = ""; sel.disabled = !tune;
    if (!tune) return;
    for (let sh = 6; sh >= -6; sh--) {
      const o = document.createElement("option"); o.value = sh;
      o.textContent = keyLabel(tune, sh).name + (sh === 0 ? " (original)" : " (" + (sh > 0 ? "+" : "−") + Math.abs(sh) + ")");
      sel.appendChild(o);
    }
    sel.value = shift;
  }
  const tagFor = t => shift ? keyLabel(t, shift).name + " · " + t.tag.split("·").slice(1).join("·").trim() : t.tag;
  $("key").addEventListener("change", () => {
    shift = +$("key").value; save();
    $("nowTag").textContent = tagFor(tune);
    renderRoll(); renderSheet(); if (playing) { stop(); play(); }
  });

  // =====================================================================
  // MP3 (rendered offline, encoded with LAME, delivered inside a .zip) and project files
  // =====================================================================
  let downloads = null, lameP = null;
  if (window.claude && claude.use) claude.use("downloads").then(d => { downloads = d; $("saveMp3").hidden = !d; $("saveProject").hidden = !d; }).catch(() => {});
  function loadLame() {
    if (window.lamejs) return Promise.resolve();
    return lameP || (lameP = new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js";
      sc.onload = () => window.lamejs ? res() : rej(new Error("encoder missing"));
      sc.onerror = () => { lameP = null; rej(new Error("encoder failed to load")); };
      document.head.appendChild(sc);
    }));
  }
  async function renderOffline() {
    const bpm = +$("bpm").value, e = 60 / bpm / tune.beat, rate = 44100;
    const C = new OfflineAudioContext(1, Math.ceil((tune.total * e + 1.6) * rate), rate);
    const out = C.createGain(); out.gain.value = .8;
    const comp = C.createDynamicsCompressor(); out.connect(comp); comp.connect(C.destination);
    tune.notes.forEach(n => voice(n.m + octave + shift, .1 + n.t * e, n.d * e * .97, C, out));
    if ($("chords").checked) tune.chords.forEach(c => pad(c.v, .1 + c.t * e, c.d * e, C, out));
    return C.startRendering();
  }
  function encodeMp3(buf) {
    const pcm = buf.getChannelData(0); let peak = 0;
    for (let i = 0; i < pcm.length; i++) peak = Math.max(peak, Math.abs(pcm[i]));
    const g = peak > 0 ? .89 / peak : 1, n = pcm.length, i16 = new Int16Array(n);
    for (let i = 0; i < n; i++) i16[i] = Math.max(-32768, Math.min(32767, Math.round(pcm[i] * g * 32767)));
    const enc = new lamejs.Mp3Encoder(1, buf.sampleRate, 192), parts = [];
    for (let i = 0; i < n; i += 1152) { const b = enc.encodeBuffer(i16.subarray(i, i + 1152)); if (b.length) parts.push(new Uint8Array(b)); }
    const end = enc.flush(); if (end.length) parts.push(new Uint8Array(end));
    return parts;
  }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function zipOne(name, parts) {
    let size = 0, crc = 0xFFFFFFFF;
    parts.forEach(p => { size += p.length; for (let i = 0; i < p.length; i++) crc = CRC[(crc ^ p[i]) & 255] ^ (crc >>> 8); });
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    const nm = new TextEncoder().encode(name), d = new Date();
    const dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const hdr = central => {
      const h = new DataView(new ArrayBuffer((central ? 46 : 30) + nm.length)); let o = 0;
      const u32 = v => { h.setUint32(o, v, true); o += 4; }, u16 = v => { h.setUint16(o, v, true); o += 2; };
      u32(central ? 0x02014b50 : 0x04034b50); if (central) u16(20); u16(20); u16(0); u16(0); u16(tm); u16(dt); u32(crc); u32(size); u32(size); u16(nm.length); u16(0);
      if (central) { u16(0); u16(0); u16(0); u32(0); u32(0); }
      new Uint8Array(h.buffer).set(nm, o); return new Uint8Array(h.buffer);
    };
    const local = hdr(false), central = hdr(true), eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true); eocd.setUint16(8, 1, true); eocd.setUint16(10, 1, true);
    eocd.setUint32(12, central.length, true); eocd.setUint32(16, local.length + size, true);
    return new Blob([local, ...parts, central, new Uint8Array(eocd.buffer)]);
  }
  const slug = s => s.toLowerCase().replace(/♯/g, "-sharp").replace(/♭/g, "-flat").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function saveError(err, st) {
    const c = err && err.code;
    st.textContent = c === "declined" ? "Not saved." : c === "rate_limited" ? "A save is already waiting; try again in a moment." : "Couldn't save" + (err && err.message ? " (" + err.message + ")" : "") + ".";
  }
  $("saveMp3").addEventListener("click", async () => {
    const btn = $("saveMp3"), st = $("saveStatus");
    if (!downloads || !canPlay()) { st.textContent = "Pick a tune that fits this stanza first."; return; }
    btn.disabled = true; st.textContent = "Rendering…";
    try {
      await loadLame();
      const buf = await renderOffline();
      st.textContent = "Encoding…"; await new Promise(r => setTimeout(r, 30));
      const parts = encodeMp3(buf);
      const base = [slug(lyricTitle()), slug(cur().name), slug(tune.name), slug(keyLabel(tune, shift).name), $("bpm").value + "bpm", isEdited(tune) ? "edited" : ""].filter(Boolean).join("-");
      st.textContent = "";
      await downloads.save({ filename: base + ".zip", data: zipOne(base + ".mp3", parts) });
      st.textContent = "Saved. Unzip it to get the MP3.";
    } catch (err) { saveError(err, st); } finally { btn.disabled = false; }
  });
  function lyricTitle() { const first = stanzas[0] && stanzas[0].lines[0]; return first ? first.text.split(/\s+/).slice(0, 4).join(" ") : "song"; }
  $("saveProject").addEventListener("click", async () => {
    const st = $("projectStatus");
    try { await downloads.save({ filename: slug(lyricTitle()) + "-composer.json", data: JSON.stringify(snapshot(), null, 1) }); st.textContent = "Project saved."; }
    catch (err) { saveError(err, st); }
  });
  $("openProject").addEventListener("change", async e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const st = $("projectStatus");
    try {
      const s = JSON.parse(await f.text());
      if (!s || s.v !== 1) throw new Error("not a composer project");
      if (playing) stop();
      applySnapshot(s); lyricsBox.value = lyricText;
      if (!tune) tune = allTunes().find(t => fits(t, cur())) || null;
      refreshAll(); save(); st.textContent = "Opened " + f.name + ".";
    } catch (err) { st.textContent = "Couldn't open that file (" + err.message + ")."; }
    e.target.value = "";
  });

  // =====================================================================
  // Wiring it together
  // =====================================================================
  function selectTune(t, autoplay) {
    if (playing) stop();
    tune = t; shownTune = t; sel = 0;
    $("bpm").min = Math.max(20, Math.round(t.bpm * .4)); $("bpm").max = Math.round(t.bpm * 2.2);
    $("bpm").value = t.bpm; $("bpmOut").textContent = t.bpm;
    $("beatName").textContent = t.beatName;
    document.querySelectorAll(".tune").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === t.id)));
    renderNow(); fillKeys(); renderSheet(); renderRoll(); save();
    if (autoplay) play();
  }
  function renderNow() {
    const st = cur(), t = tune;
    $("nowName").textContent = t ? t.name : "No tune yet";
    $("nowTag").textContent = t ? tagFor(t) : "";
    const ok = canPlay();
    $("play").disabled = !ok;
    $("mismatch").hidden = !t || !st || ok;
    if (t && st && !ok) $("mismatch").textContent = "This tune is for " + t.shape.join(".") + " stanzas; " + st.name + " is " + st.shape.join(".") + ". Compose for this stanza or pick another tune.";
  }
  let shownTune = null;
  function refreshAll() {
    const st = cur();
    if (tune && st && !fits(tune, st)) { const alt = allTunes().find(t => fits(t, st)); if (alt) tune = alt; }
    if (tune !== shownTune) { shownTune = tune; if (tune) $("bpm").dataset.init = ""; }
    fillStanzas(); renderMeter(); renderLyric(); renderTunes(); renderNow(); fillKeys();
    if (tune) { $("bpm").min = Math.max(20, Math.round(tune.bpm * .4)); $("bpm").max = Math.round(tune.bpm * 2.2); if (!$("bpm").dataset.init) { $("bpm").value = tune.bpm; $("bpmOut").textContent = tune.bpm; $("bpm").dataset.init = 1; } $("beatName").textContent = tune.beatName; }
    renderSheet(); renderRoll();
  }
  if (octave === 0) setPressed("o-high", "o-men");
  refreshAll();

  // test hooks for offline checks
  window.__composer = { parseLyrics, compose, STYLES, genLines, tuneFromClaude, claudePrompt, analyzeLine };
})();

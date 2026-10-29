import json, re, sys
# ---- rhythm templates: bars of items: ('s',dur) sung, ('r',dur) rest, ('t',dur) tie continuation
def S(*d): return [('s',x) for x in d]
R6 = [S(3,2,1), [('s',3),('r',2),('s',1)], S(2,1,2,1), [('s',3),('r',2),('s',1)],
      S(2,1,2,1), S(2,1,2,1), S(6), [('t',3),('r',3)],
      S(3,2,1), [('s',3),('r',2),('s',1)], S(2,1,2,1), [('s',3),('r',2),('s',1)],
      S(2,1,2,1), S(2,1,2,1), S(6), [('t',3),('r',3)]]
R4 = [S(4,3,1), [('s',4),('r',2),('s',2)], S(3,1,3,1), S(6,2),
      S(3,1,3,1), S(3,1,3,1), S(8), [('t',6),('r',2)],
      S(4,3,1), [('s',4),('r',2),('s',2)], S(3,1,3,1), S(6,2),
      S(3,1,3,1), S(3,1,3,1), S(8), [('t',8)]]
R4e = [S(4,3,1), [('s',4),('r',2),('s',2)], S(2,2,2,2), S(6,2),
       S(2,2,2,2), S(2,2,2,2), S(8), [('t',6),('r',2)],
       S(4,3,1), [('s',4),('r',2),('s',2)], S(2,2,2,2), S(6,2),
       S(2,2,2,2), S(2,2,2,2), S(8), [('t',8)]]
R3 = [S(6)] + [S(4,2)]*5 + [S(4,2)]*4 + [S(6), [('t',4),('r',2)]] + [S(6)] + [S(4,2)]*5 + [S(4,2)]*4 + [S(6), [('t',6)]]
TEMPL = {'R6':(R6,'6/8',6,3,4), 'R4':(R4,'4/4',8,2,4), 'R4e':(R4e,'4/4',8,2,4), 'R3':(R3,'3/4',6,2,6)}

SHARPS = 'FCGDAEB'; FLATS = 'BEADGCF'
MAJ_SIG = {'C':0,'G':1,'D':2,'A':3,'E':4,'B':5,'F':-1}
MODE_OFF = {'maj':0,'ion':0,'dor':-2,'phr':-4,'lyd':1,'mix':-1,'m':-3,'aeo':-3}
MODE_IV = {'maj':[0,2,4,5,7,9,11],'dor':[0,2,3,5,7,9,10],'phr':[0,1,3,5,7,8,10],'lyd':[0,2,4,6,7,9,11],'mix':[0,2,4,5,7,9,10],'m':[0,2,3,5,7,8,10]}
PC = {'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
NAMES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
def keysig(tonic, mode):
    n = MAJ_SIG[tonic] + MODE_OFF[mode]
    # D minor: D major(2) -3 = -1 (Bb) ok
    alt = {}
    if n > 0:
        for l in SHARPS[:n]: alt[l] = 1
    else:
        for l in FLATS[:-n]: alt[l] = -1
    return alt
def midi(tok, alt, baracc):
    m = re.fullmatch(r"([\^_=]?)([A-Ga-g])([,']*)", tok); assert m, tok
    acc, L, octs = m.groups()
    base = 60 + PC[L.upper()] + (12 if L.islower() else 0) - 12*octs.count(',') + 12*octs.count("'")
    key = (L.upper(), L.islower(), octs)
    if acc: baracc[key] = {'^':1,'_':-1,'=':0}[acc]
    a = baracc.get(key, alt.get(L.upper(), 0))
    return base + a

def build(mel, lyrics):
    bars, meter, barlen, beat, perline = TEMPL[mel['rhythm']]
    toks = mel['notes'].split(); assert len(toks) == 40, (mel['name'], len(toks))
    tonic, mode = mel['key']; alt = keysig(tonic, mode)
    tpc = PC[tonic]; scale = [(tpc+i)%12 for i in MODE_IV[mode]]
    notes = []; abc_bars = []; pos = 0; si = 0; last = None
    for b in bars:
        assert sum(d for _,d in b) == barlen, (mel['name'], b)
        baracc = {}; out = []
        for i,(k,d) in enumerate(b):
            ds = '' if d == 1 else str(d)
            nxt = b[i+1][0] if i+1 < len(b) else None
            if k == 's':
                tok = toks[si]; m = midi(tok, alt, baracc); last = (tok, m)
                notes.append({'t':pos,'d':d,'m':m,'s':si}); si += 1
                out.append(tok+ds)
            elif k == 't':
                notes[-1]['d'] += d; out.append(re.sub(r'^[\^_=]','',last[0])+ds)
            else:
                out.append('z'+ds)
            pos += d
        abc_bars.append(out)
    # tie marks: a sung note whose next item (maybe across bar) is 't'
    flat = [(bi,ii,k) for bi,b in enumerate(bars) for ii,(k,_) in enumerate(b)]
    for j,(bi,ii,k) in enumerate(flat[:-1]):
        if flat[j+1][2] == 't': abc_bars[bi][ii] += '-'
    # ---- auto harmony: one chord per bar (half bars in 4/4), diatonic triads, no diminished
    cands = []
    for deg in range(7):
        r = scale[deg]; th = scale[(deg+2)%7]; fi = scale[(deg+4)%7]
        q3 = (th - r) % 12; q5 = (fi - r) % 12
        if q5 != 7: continue
        cands.append((deg, r, q3 == 3))
    for extra in mel.get('extra', []):  # e.g. ('A',False) major V in harmonic minor
        cands.append((9, PC[extra[0]], extra[1]))
    pref = {0:.3, 3:.25, 4:.3, 5:.2, 6:.05}
    span = barlen//2 if barlen == 8 else barlen
    chords = []; total = pos
    for s0 in range(0, total, span):
        s1 = s0 + span
        best = None
        for deg, r, minor in cands:
            tones = {r, (r+(3 if minor else 4))%12, (r+7)%12}
            sc = pref.get(deg, 0)
            for n in notes:
                ov = min(s1, n['t']+n['d']) - max(s0, n['t'])
                if ov <= 0: continue
                w = 1.6 if n['t'] == s0 else 1
                sc += ov * w * (1 if n['m'] % 12 in tones else -0.6)
            if s1 >= total - barlen and deg != 0 and s0 >= total - 2*barlen: sc -= 100  # last two bars: tonic
            if len(chords) and chords[-1]['r'] == r and chords[-1]['mi'] == minor and chords[-1]['d'] >= barlen*2: sc -= 1.2
            if best is None or sc > best[0]: best = (sc, r, minor)
        _, r, minor = best
        name = NAMES[r] + ('m' if minor else '')
        if chords and chords[-1]['name'] == name: chords[-1]['d'] += span
        else: chords.append({'t':s0,'d':span,'name':name,'r':r,'mi':minor})
    if 'chords' in mel:
        chords = []; t = 0
        for name, d in mel['chords']:
            mm = re.fullmatch(r'([A-G][#b]?)(m?)', name); r = (PC[mm.group(1)[0]] + (1 if '#' in name else -1 if 'b' in mm.group(1) else 0)) % 12
            chords.append({'t':t,'d':d,'name':name,'r':r,'mi':bool(mm.group(2))}); t += d
        assert t == total, (mel['name'], t, total)
    # chord symbols into ABC at the note starting each chord
    starts = {c['t']:c['name'] for c in chords}
    pos = 0
    for bi,b in enumerate(bars):
        for ii,(k,d) in enumerate(b):
            if pos in starts: abc_bars[bi][ii] = '"%s"' % starts[pos] + abc_bars[bi][ii]
            pos += d
    # lines of ABC + lyrics
    lines = []
    sylpos = 0
    for li in range(0, len(bars), perline):
        seg = abc_bars[li:li+perline]
        n = sum(1 for b in bars[li:li+perline] for k,_ in b if k=='s')
        lines.append((' | '.join(' '.join(x) for x in seg) + (' |]' if li+perline >= len(bars) else ' |'), n))
    key_s = tonic + {'maj':'','m':'m','dor':'dor','phr':'phr','lyd':'lyd','mix':'mix'}[mode]
    abc_head = ['X:1','M:'+meter,'L:1/8','K:%s clef=treble-8' % key_s]
    voicings = []
    for c in chords:
        r = c['r']; third = 3 if c['mi'] else 4
        bass = 36 + r if 36 + r <= 45 else 24 + r
        tri = sorted([(48 + (r + x - 48) % 12) for x in (0, third, 7)])
        c['v'] = [bass] + [t if t >= 50 else t + 12 for t in tri]
    return {'id':mel['id'],'name':mel['name'],'tag':mel['tag'],'blurb':mel['blurb'],'beat':beat,'bpm':mel['bpm'],
            'beatName':'dotted quarter' if beat==3 else 'quarter','total':total,
            'notes':notes,'chords':[{'t':c['t'],'d':c['d'],'v':c['v'],'name':c['name']} for c in chords],
            'abcHead':abc_head,'abcLines':lines, 'lo':min(n['m'] for n in notes),'hi':max(n['m'] for n in notes)}

M = json.load(open(sys.argv[1]))
out = [build(m, None) for m in M]
for o in out:
    names = ' '.join(c['name'] for c in o['chords'])
    print(f"{o['name']:<24} range {NAMES[(o['lo'])%12]}{o['lo']//12-2}-{NAMES[o['hi']%12]}{o['hi']//12-2} (sounding) | {names}")
open(sys.argv[2],'w').write('const TUNES = ' + json.dumps(out) + ';\n')

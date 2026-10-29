import json, math, wave, struct, sys, random
SR = 44100
tunes = json.loads(open('tunes.js').read()[len('const TUNES = '):].rstrip().rstrip(';'))
t = tunes[0]; BPM = float(sys.argv[1]); PASSES = int(sys.argv[2]); OUT = sys.argv[3]
e = 60 / BPM / t['beat']                        # seconds per eighth
passlen = t['total'] * e
N = int(SR * (passlen * PASSES + 2.5))
buf = [0.0] * N
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

class Biquad:
    def __init__(s, kind, f, q):
        w = 2 * math.pi * f / SR; a = math.sin(w) / (2 * q); c = math.cos(w)
        if kind == 'bp': b0, b1, b2 = a, 0, -a
        else: b0 = b2 = (1 - c) / 2; b1 = 1 - c
        a0 = 1 + a; s.b = (b0/a0, b1/a0, b2/a0); s.a = (-2*c/a0, (1-a)/a0); s.x1 = s.x2 = s.y1 = s.y2 = 0.0
    def __call__(s, x):
        y = s.b[0]*x + s.b[1]*s.x1 + s.b[2]*s.x2 - s.a[0]*s.y1 - s.a[1]*s.y2
        s.x2, s.x1, s.y2, s.y1 = s.x1, x, s.y1, y; return y

def env(i, n, att, rel, peak):
    t_ = i / SR; d = n / SR
    if t_ < att: return peak * t_ / att
    if t_ > d: return max(0.0, peak * (1 - (t_ - d) / rel))
    return peak * (1 - 0.12 * min(1, t_ / max(d, 1e-3)))

def voice(m, start, dur):
    f = hz(m); n = int(dur * SR); tail = int(.12 * SR)
    f1, f2, lp = Biquad('bp', 730, 5), Biquad('bp', 1090, 6), Biquad('lp', 2400, .7)
    ph1 = ph2 = 0.0; s0 = int(start * SR)
    for i in range(n + tail):
        tt = i / SR
        vib = 0 if tt < .3 else min(1, (tt - .3) / .4) * 0.006 * math.sin(2 * math.pi * 5.2 * tt)
        ff = f * (1 + vib)
        ph1 = (ph1 + ff / SR) % 1; ph2 = (ph2 + ff * 1.003 / SR) % 1
        saw = 2 * ph1 - 1; tri = 4 * abs(ph2 - .5) - 1
        x = 1.1 * f1(saw) + .6 * f2(saw) + .35 * lp(saw + tri)
        k = s0 + i
        if k < N: buf[k] += x * env(i, n, .04, .1, .55)

def pad(midis, start, dur):
    n = int(dur * SR); tail = int(.15 * SR); s0 = int(start * SR)
    for j, m in enumerate(midis):
        f = hz(m); lp = Biquad('lp', 900, .7); ph = 0.0; peak = .16 if j == 0 else .055
        for i in range(n + tail):
            ph = (ph + f / SR) % 1
            x = (4 * abs(ph - .5) - 1) if j == 0 else math.sin(2 * math.pi * ph)
            k = s0 + i
            if k < N: buf[k] += lp(x) * env(i, n, .12, .15, peak) * 1.6

lead = .25
for p in range(PASSES):
    off = lead + p * passlen
    for nt in t['notes']: voice(nt['m'] - 12, off + nt['t'] * e, nt['d'] * e * .97)
    for c in t['chords']: pad(c['v'], off + c['t'] * e, c['d'] * e)

# light room reverb: a few feedback combs, mixed in
wet = [0.0] * N
for d_ms, g in ((29.7, .78), (37.1, .76), (41.1, .74), (43.7, .72)):
    d = int(SR * d_ms / 1000); line = [0.0] * N
    for i in range(N):
        y = buf[i] + (line[i - d] * g if i >= d else 0); line[i] = y; wet[i] += y * .12
mix = [buf[i] * .85 + wet[i] * .35 for i in range(N)]
peak = max(abs(x) for x in mix) or 1
with wave.open(OUT, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(32000 * .89 * x / peak)) for x in mix))
print('seconds', round(N / SR, 1))

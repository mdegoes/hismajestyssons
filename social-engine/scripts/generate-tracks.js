import {execFileSync} from 'child_process';
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'fs';
import {extname, join} from 'path';
import {fileURLToPath} from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MUSIC_DIR = join(ROOT, 'public', 'music');
const OUTPUT_FILE = join(ROOT, 'src', 'tracks.js');
const OVERRIDES_FILE = join(ROOT, 'scripts', 'track-start-overrides.json');
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav']);

// Hand-confirmed audioStartSeconds, by ear, keyed by track name — see
// track-start-overrides.json for how these get added. Takes priority over
// the computed heuristic below; skips computing it at all for that track
// (no point spending the ffmpeg decode once a human has already listened).
const loadOverrides = () => {
  if (!existsSync(OVERRIDES_FILE)) return {};
  try {
    const parsed = JSON.parse(readFileSync(OVERRIDES_FILE, 'utf8'));
    delete parsed._comment;
    return parsed;
  } catch (err) {
    console.warn(`Could not parse ${OVERRIDES_FILE}: ${err.message} — ignoring overrides.`);
    return {};
  }
};

const overrides = loadOverrides();

// Matches src/tokens.js (kept in sync by hand — see the note there).
const CLIP_DURATION_SECONDS = 240 / 30;

const files = readdirSync(MUSIC_DIR)
  .filter((name) => AUDIO_EXTENSIONS.has(extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b));

// Prefer ffmpeg/ffprobe on PATH; fall back to the binaries Remotion already
// downloaded into node_modules/@remotion/compositor-* (one of these is always
// present after `npm install`, since it's what actually renders the video) so
// duration checks and the suggested-start analysis below work out of the box
// without a separate `brew install ffmpeg`. Its dylibs live next to the
// binary rather than on the system search path, hence the *_LIBRARY_PATH env.
const findBundledCompositorDir = () => {
  const remotionDir = join(ROOT, 'node_modules', '@remotion');
  if (!existsSync(remotionDir)) return null;
  const candidate = readdirSync(remotionDir).find((name) => name.startsWith('compositor-'));
  if (!candidate) return null;
  const dir = join(remotionDir, candidate);
  if (!existsSync(join(dir, 'ffmpeg')) || !existsSync(join(dir, 'ffprobe'))) return null;
  return dir;
};

const bundledDir = findBundledCompositorDir();
const bundledEnv = bundledDir
  ? {...process.env, DYLD_LIBRARY_PATH: bundledDir, LD_LIBRARY_PATH: bundledDir}
  : null;

let ffToolsMissing = false;
const warnedOnce = new Set();

const runFF = (tool, args, extraOpts = {}) => {
  if (ffToolsMissing) return null;
  const attempts = bundledDir ? [[tool, false], [join(bundledDir, tool), true]] : [[tool, false]];
  let lastErr = null;
  for (const [bin, isBundled] of attempts) {
    try {
      return execFileSync(bin, args, {
        encoding: 'utf8',
        env: isBundled ? bundledEnv : process.env,
        maxBuffer: 200 * 1024 * 1024,
        ...extraOpts,
      });
    } catch (err) {
      lastErr = err;
      if (err.code !== 'ENOENT') break; // found the binary, but it failed for another reason
    }
  }
  if (lastErr?.code === 'ENOENT') {
    ffToolsMissing = true;
    if (!warnedOnce.has('missing')) {
      warnedOnce.add('missing');
      console.warn(
        `${tool} not found on PATH or in a bundled @remotion/compositor-* package — skipping ` +
          'duration checks and suggested-start analysis (install ffmpeg to enable them).',
      );
    }
  }
  return {error: lastErr};
};

const probeDuration = (name) => {
  const out = runFF(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(MUSIC_DIR, name)],
  );
  if (out == null || typeof out !== 'string') return null;
  const seconds = parseFloat(out);
  return Number.isFinite(seconds) ? Math.round(seconds * 10) / 10 : null;
};

// Suggested audioStartSeconds per track: a default starting point past the
// cold open, so a short highlight clip doesn't always land on a quiet
// instrumental intro (the original bug report: an 8s clip of "A Mighty
// Fortress" started at 0 and only ever played the intro, never the melody).
//
// Method: decode to mono 16-bit PCM, compute RMS loudness (dBFS) in 1s
// windows, and find the first ~3s stretch that sustains at least 6dB above
// the track's early baseline — i.e. the first place the mix gets
// meaningfully fuller/busier than the opening few seconds. This is a coarse
// loudness heuristic, NOT lyric/vocal detection (this tool has no speech
// recognition) — it's a proxy for "past the intro," nothing more. Treat the
// result as a starting point to spot-check by ear, not a guarantee the
// clip contains vocals.
const WINDOW_SEC = 1;
const SAMPLE_RATE = 22050;
const MIN_INTRO_SEC = 4; // don't search inside the first few seconds
const SUSTAIN_SEC = 3; // require this many consecutive seconds above baseline
const MARGIN_DB = 6; // "meaningfully fuller" threshold above baseline
const PRE_ROLL_SEC = 2; // start a couple seconds before the detected rise

// The bundled compositor's ffmpeg build has most muxers disabled (only a
// fixed allowlist, no raw s16le) — ask for `wav` instead (which it does
// support) and skip past the RIFF header to the `data` chunk's PCM bytes.
const pcmFromWav = (wavBuffer) => {
  const dataIdx = wavBuffer.indexOf('data');
  if (dataIdx === -1) return Buffer.alloc(0);
  const dataStart = dataIdx + 8; // 'data' (4 bytes) + chunk size (4 bytes)
  return wavBuffer.subarray(dataStart);
};

const rmsDbWindows = (wavBuffer) => {
  const pcmBuffer = pcmFromWav(wavBuffer);
  const bytesPerWindow = SAMPLE_RATE * WINDOW_SEC * 2; // 16-bit mono
  const windows = [];
  for (let offset = 0; offset + bytesPerWindow <= pcmBuffer.length; offset += bytesPerWindow) {
    let sumSquares = 0;
    const sampleCount = bytesPerWindow / 2;
    for (let i = 0; i < sampleCount; i++) {
      const sample = pcmBuffer.readInt16LE(offset + i * 2);
      sumSquares += sample * sample;
    }
    const rms = Math.sqrt(sumSquares / sampleCount);
    windows.push(rms > 0 ? 20 * Math.log10(rms / 32768) : -96);
  }
  return windows;
};

const suggestStart = (name, durationSeconds) => {
  if (durationSeconds == null || durationSeconds <= MIN_INTRO_SEC + SUSTAIN_SEC + 2) return null;
  const wav = runFF(
    'ffmpeg',
    [
      '-v', 'error', '-i', join(MUSIC_DIR, name),
      '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 'wav', 'pipe:1',
    ],
    {encoding: 'buffer'},
  );
  if (wav == null || Buffer.isBuffer(wav) === false) return null;

  const envelope = rmsDbWindows(wav);
  if (envelope.length < MIN_INTRO_SEC + SUSTAIN_SEC + 2) return null;

  const introSlice = [...envelope.slice(0, Math.min(envelope.length, 8))].sort((a, b) => a - b);
  const baseline = introSlice[Math.floor(introSlice.length / 2)]; // median

  const maxStart = Math.max(0, Math.floor(durationSeconds - CLIP_DURATION_SECONDS));
  for (let i = MIN_INTRO_SEC; i < envelope.length - SUSTAIN_SEC; i++) {
    const window = envelope.slice(i, i + SUSTAIN_SEC);
    if (window.every((v) => v > baseline + MARGIN_DB)) {
      return Math.max(0, Math.min(maxStart, i - PRE_ROLL_SEC));
    }
  }
  return null; // no clear rise found (e.g. a consistently-loud track) — caller falls back to 0
};

const trackEntries = files.map((name) => {
  const key = name.slice(0, -extname(name).length);
  const duration = probeDuration(name);
  const hasOverride = Object.prototype.hasOwnProperty.call(overrides, key);
  const suggestedStart = hasOverride ? overrides[key] : suggestStart(name, duration);
  return {key, file: `music/${name}`, duration, suggestedStart, confirmed: hasOverride};
});

const trackLines = trackEntries.map(
  ({key, file}) => `  ${JSON.stringify(key)}: ${JSON.stringify(file)},`,
);
const durationLines = trackEntries.map(
  ({key, duration}) => `  ${JSON.stringify(key)}: ${duration === null ? 'null' : duration},`,
);
const suggestedStartLines = trackEntries.map(
  ({key, suggestedStart, confirmed}) =>
    `  ${JSON.stringify(key)}: ${suggestedStart === null ? 'null' : suggestedStart},${confirmed ? ' // owner-confirmed by ear' : ''}`,
);
const confirmedLines = trackEntries
  .filter(({confirmed}) => confirmed)
  .map(({key}) => `  ${JSON.stringify(key)}: true,`);

const output = `// AUTO-GENERATED by scripts/generate-tracks.js from public/music/.
// Do not edit by hand — this file is regenerated before every \`npm run
// studio\`/\`npm run render:*\`. Drop an mp3/wav into public/music/ and rerun
// (or just restart Studio) to add it here; the filename (minus extension)
// becomes both the object key and the label shown in Remotion Studio's
// \`track\` dropdown, since Zod enums have no separate display-name field.
export const TRACKS = {
  none: null,
${trackLines.length ? trackLines.join('\n') + '\n' : ''}};

// Duration in seconds per track (via ffprobe, system or the bundled
// @remotion/compositor-* binary), or null if it couldn't be read. See
// schema.js's audioStartSeconds validation.
export const TRACK_DURATIONS = {
${durationLines.length ? durationLines.join('\n') + '\n' : ''}};

// A suggested audioStartSeconds per track — the first point where the mix
// gets sustainably louder/fuller than its opening few seconds (a coarse
// loudness heuristic, not lyric/vocal detection; see suggestStart() in
// generate-tracks.js for the method and its limits). null means no clear
// rise was found (e.g. a consistently loud track) or duration/ffmpeg wasn't
// available — callers should fall back to 0 in that case. The schema's own
// default stays 0 (Zod can't default one field off another), so callers
// that want this — Remotion Studio's props panel doesn't, but the x-repost
// skill's CLI renders should — must look this value up explicitly and pass
// it as audioStartSeconds rather than relying on the schema default.
//
// A track marked "owner-confirmed by ear" below (see TRACK_START_CONFIRMED)
// came from scripts/track-start-overrides.json, not the heuristic — add an
// entry there once someone's actually listened and picked an exact second;
// it takes priority on every future regeneration.
export const TRACK_SUGGESTED_START = {
${suggestedStartLines.length ? suggestedStartLines.join('\n') + '\n' : ''}};

// Which of the above are a human-confirmed pick (scripts/track-start-overrides.json)
// rather than the untested loudness heuristic. See the note above.
export const TRACK_START_CONFIRMED = {
${confirmedLines.length ? confirmedLines.join('\n') + '\n' : ''}};
`;

writeFileSync(OUTPUT_FILE, output);
console.log(`Wrote ${OUTPUT_FILE} with ${files.length} track(s): ${files.join(', ') || '(none found)'}`);

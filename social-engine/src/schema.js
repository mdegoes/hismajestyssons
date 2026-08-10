import {z} from 'zod';
import {zTextarea} from '@remotion/zod-types';
import {TRACKS, TRACK_DURATIONS} from './tracks.js';
import {DURATION_IN_FRAMES, FPS} from './tokens.js';

const CLIP_DURATION_SECONDS = DURATION_IN_FRAMES / FPS;

// Attaching this to <Composition schema={...}> is what turns Remotion
// Studio's props panel into a real form (textarea + dropdowns) instead of
// a raw JSON editor.
// Keep in sync with the keys of BACKGROUNDS in ./backgrounds/index.jsx.
// `track`'s options come from TRACKS (./tracks.js) itself, not a hand-typed
// list — that file is auto-generated from public/music/, so this enum
// (and the Studio dropdown it drives) stays in sync automatically.
export const socialPostSchema = z
  .object({
    text: zTextarea(),
    track: z.enum(Object.keys(TRACKS)).default('none'),
    // How many seconds into the track playback starts — lets you pick which
    // part of a song gets used without changing the clip's own length. Figure
    // out a good value by ear in any player, then type the timestamp in here.
    audioStartSeconds: z.number().min(0).default(0),
    background: z.enum(['none', 'grid', 'diagonal', 'cross']).default('grid'),
  })
  // Starting too close to (or past) a track's actual end previously failed
  // silently — the clip just rendered with no sound, no error, no clue why.
  // TRACK_DURATIONS comes from ffprobe (via generate-tracks.js) and is null
  // for a track if ffprobe wasn't available when it last ran; skip the
  // check in that case rather than blocking on it.
  .superRefine((data, ctx) => {
    const duration = TRACK_DURATIONS[data.track];
    if (duration == null) return;
    const maxStart = Math.max(0, duration - CLIP_DURATION_SECONDS);
    if (data.audioStartSeconds > maxStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['audioStartSeconds'],
        message: `"${data.track}" is only ${duration}s long, so audioStartSeconds can be at most ${maxStart.toFixed(1)} (leaving room for the clip's ${CLIP_DURATION_SECONDS}s) — got ${data.audioStartSeconds}.`,
      });
    }
  });

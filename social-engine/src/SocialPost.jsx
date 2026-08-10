import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/LibreBaskerville';
import {Background} from './backgrounds/index.jsx';
import {TRACKS} from './tracks.js';
import {COLORS} from './tokens.js';

const {fontFamily} = loadFont();

const AUDIO_FADE_FRAMES = 30;
const TEXT_IN_START = 10;

// Base font-size is `width * TEXT_FONT_SCALE_MAX`. Longer captions wrap to
// more lines than the fixed-height layout has room for, bleeding past the
// tagline at the bottom — scale the font down as character count grows so
// long captions shrink to fit instead of overflowing.
const TEXT_FONT_SCALE_MAX = 0.075;
const TEXT_FONT_SCALE_MIN = 0.0325;
const TEXT_SCALE_START_LENGTH = 40;
const TEXT_SCALE_END_LENGTH = 220;

const getTextFontScale = (text) => {
  const length = text?.length ?? 0;
  if (length <= TEXT_SCALE_START_LENGTH) return TEXT_FONT_SCALE_MAX;
  if (length >= TEXT_SCALE_END_LENGTH) return TEXT_FONT_SCALE_MIN;
  const progress =
    (length - TEXT_SCALE_START_LENGTH) / (TEXT_SCALE_END_LENGTH - TEXT_SCALE_START_LENGTH);
  return TEXT_FONT_SCALE_MAX - progress * (TEXT_FONT_SCALE_MAX - TEXT_FONT_SCALE_MIN);
};

// Caption types in character-by-character, like someone typing it, with a
// blinking cursor. Typing speed is expressed as chars-per-frame (not
// frames-per-char) so it can go above 1 char/frame — a fixed frames-per-char
// speed would make a 220-char caption take 220+ frames (most of the whole
// 8s clip) to type out. Speed is derived from length so every caption
// finishes typing in roughly the same ~TARGET_TYPE_FRAMES window, clamped
// between MIN/MAX so very short captions don't blip by instantly and very
// long ones don't type unreadably fast. (TARGET_TYPE_FRAMES doubled and
// MIN/MAX halved together to slow the whole thing to ~half speed without
// changing the shape of the length→speed curve.)
const TARGET_TYPE_FRAMES = 180;
const MIN_CHARS_PER_FRAME = 1 / 6;
const MAX_CHARS_PER_FRAME = 1.5;
const CURSOR_BLINK_FRAMES = 15;
const TAGLINE_FADE_FRAMES = 20;

// A shared link's static preview thumbnail is typically the video's very
// first frame — if that lands mid-animation (logo mid-pop, caption still
// blank), the preview looks broken/empty. So the first PREVIEW_HOLD_FRAMES
// instead render the whole scene already at rest (final logo scale, fully
// typed caption, visible tagline, no cursor), then hard-cut into the real
// animation playing from the start.
const PREVIEW_HOLD_FRAMES = 15; // 0.5s @ 30fps

const getCharsPerFrame = (length) => {
  if (length <= 0) return MIN_CHARS_PER_FRAME;
  const raw = length / TARGET_TYPE_FRAMES;
  return Math.min(MAX_CHARS_PER_FRAME, Math.max(MIN_CHARS_PER_FRAME, raw));
};

export const SocialPost = ({text, track, audioStartSeconds, background}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames, fps} = useVideoConfig();
  const audioSrc = TRACKS[track] ?? null;
  const audioTrimBefore = Math.max(0, Math.round((audioStartSeconds ?? 0) * fps));

  const inHold = frame < PREVIEW_HOLD_FRAMES;
  const animFrame = Math.max(0, frame - PREVIEW_HOLD_FRAMES);

  const logoScale = inHold ? 1 : spring({frame: animFrame, fps, config: {damping: 200}});

  const textLength = text?.length ?? 0;
  const charsPerFrame = getCharsPerFrame(textLength);
  const typedChars = inHold
    ? textLength
    : Math.min(
        textLength,
        Math.floor(Math.max(0, animFrame - TEXT_IN_START) * charsPerFrame),
      );
  const visibleText = (text ?? '').slice(0, typedChars);
  const typingDoneFrame = TEXT_IN_START + Math.ceil(textLength / charsPerFrame);
  const isTyping = !inHold && animFrame < typingDoneFrame;
  const cursorOpacity = inHold
    ? 0
    : isTyping
      ? 1
      : Math.floor((animFrame - typingDoneFrame) / CURSOR_BLINK_FRAMES) % 2 === 0
        ? 1
        : 0;

  const taglineOpacity = inHold
    ? 1
    : interpolate(
        animFrame,
        [typingDoneFrame, typingDoneFrame + TAGLINE_FADE_FRAMES],
        [0, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.paper,
        alignItems: 'center',
        justifyContent: 'center',
        padding: width * 0.1,
        scale: 1.174
      }}>
      <Background variant={background} width={width} height={height} />
      <Img
        src={staticFile('logo.svg')}
        style={{
          width: width * 0.16,
          height: 'auto',
          opacity: logoScale,
          transform: `scale(${logoScale})`,
          marginBottom: width * 0.06,
        }}
      />
      <div
        style={{
          position: 'relative',
          fontFamily,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: width * getTextFontScale(text),
          lineHeight: 1.25,
          color: COLORS.ink,
          textAlign: 'center',
          maxWidth: width * 0.8,
        }}
      >
        {/* Invisible full-text clone reserves the box's final size up front,
            so the growing typed string doesn't reflow this box (and shove
            the logo/tagline around) as more characters appear. */}
        <div style={{visibility: 'hidden', overflowWrap: 'break-word'}}>{text}</div>
        <div style={{position: 'absolute', inset: 0, overflowWrap: 'break-word'}}>
          {visibleText}
          <span
            style={{
              display: 'inline-block',
              width: '0.07em',
              height: '0.9em',
              marginLeft: '0.04em',
              verticalAlign: 'text-bottom',
              backgroundColor: COLORS.ink,
              opacity: cursorOpacity,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: height * 0.06,
          fontFamily,
          fontStyle: 'normal',
          fontWeight: 700,
          fontSize: width * 0.018,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: COLORS.inkMuted,
          opacity: taglineOpacity,
        }}
      >
        hismajestyssons.com
      </div>
      {audioSrc ? (
        <Audio
          src={staticFile(audioSrc)}
          trimBefore={audioTrimBefore}
          volume={(f) =>
            interpolate(
              f,
              [0, AUDIO_FADE_FRAMES, durationInFrames - AUDIO_FADE_FRAMES, durationInFrames],
              [0, 1, 1, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};

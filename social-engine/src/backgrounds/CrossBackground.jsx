import {AbsoluteFill} from 'remotion';
import {COLORS} from '../tokens.js';

const CELL_RATIO = 0.16; // fraction of canvas width per repeated cross tile

// A cross potent ("Crusader cross") drawn as plain rects rather than relying
// on a font glyph — headless-Chromium font fallback for symbol characters
// (e.g. U+2629) isn't guaranteed, so this renders identically everywhere.
// width/height (not just viewBox) keep Chromium from rasterizing this at a
// default 300x150 intrinsic size and then blurring it up to fit — without
// them the tiled pattern renders soft/fuzzy at any backgroundSize scale.
// opacity is layered on top of the already-translucent rule color because a
// filled shape this size reads much heavier than a hairline at the same alpha.
const CROSS_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
  <g fill='${COLORS.rule}' opacity='0.55'>
    <rect x='94' y='75' width='12' height='50' />
    <rect x='75' y='94' width='50' height='12' />
    <rect x='88' y='70' width='24' height='10' />
    <rect x='88' y='120' width='24' height='10' />
    <rect x='70' y='88' width='10' height='24' />
    <rect x='120' y='88' width='10' height='24' />
  </g>
</svg>`;

const CROSS_DATA_URL = `data:image/svg+xml,${encodeURIComponent(CROSS_SVG)}`;

export const CrossBackground = ({width}) => {
  const cell = width * CELL_RATIO;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${CROSS_DATA_URL}")`,
        backgroundSize: `${Math.round(cell)}px ${Math.round(cell)}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};

import {AbsoluteFill} from 'remotion';
import {COLORS} from '../tokens.js';

const CELL_RATIO = 0.08; // fraction of canvas width per grid cell

export const GridBackground = ({width}) => {
  const cell = width * CELL_RATIO;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `
          linear-gradient(to right, ${COLORS.rule} 1px, transparent 1px),
          linear-gradient(to bottom, ${COLORS.rule} 1px, transparent 1px)
        `,
        backgroundSize: `${cell}px ${cell}px`,
      }}
    />
  );
};

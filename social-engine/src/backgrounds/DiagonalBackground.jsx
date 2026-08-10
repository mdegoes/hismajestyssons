import {AbsoluteFill} from 'remotion';
import {COLORS} from '../tokens.js';

const CELL_RATIO = 0.05; // fraction of canvas width per diagonal stripe

export const DiagonalBackground = ({width}) => {
  const cell = width * CELL_RATIO;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.rule} 0, ${COLORS.rule} 1px, transparent 1px, transparent ${cell}px)`,
      }}
    />
  );
};

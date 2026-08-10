import {CrossBackground} from './CrossBackground.jsx';
import {DiagonalBackground} from './DiagonalBackground.jsx';
import {GridBackground} from './GridBackground.jsx';

// Add new background styles here and mirror the key in schema.js's
// `background` enum — there's no shared source of truth between the two.
const BACKGROUNDS = {
  none: () => null,
  grid: GridBackground,
  diagonal: DiagonalBackground,
  cross: CrossBackground,
};

export const Background = ({variant, width, height}) => {
  const Comp = BACKGROUNDS[variant] ?? BACKGROUNDS.none;
  return <Comp width={width} height={height} />;
};

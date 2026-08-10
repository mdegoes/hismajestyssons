// Mirrors the light-mode design tokens in ../../site.css (:root). Rendered
// video is a fixed brand asset, not theme-aware, so only the light palette
// is used. There's no shared build step between the two files — if the
// site's tokens change, update this by hand.
export const COLORS = {
  paper: '#EFEDE8',
  ink: '#141006',
  inkMuted: '#82714A',
  accent: '#1D3263',
  rule: 'rgba(20,16,6,0.18)',
};

export const FPS = 30;
export const DURATION_IN_FRAMES = 240; // 8s

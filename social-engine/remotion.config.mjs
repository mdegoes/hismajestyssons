import {Config} from '@remotion/cli/config';

// png (not jpeg) — this project renders flat vector graphics (text, logo,
// background patterns), not photographic footage, so there's no benefit to
// jpeg's lossy compression and no reason to risk its artifacts on hard edges.
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);

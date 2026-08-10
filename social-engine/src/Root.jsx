import {Composition} from 'remotion';
import {SocialPost} from './SocialPost.jsx';
import {socialPostSchema} from './schema.js';
import {DURATION_IN_FRAMES, FPS} from './tokens.js';

const defaultProps = {
  text: 'Enter your text here',
  track: 'none',
  audioStartSeconds: 0,
  background: 'grid',
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="Square"
      component={SocialPost}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1080}
      schema={socialPostSchema}
      defaultProps={defaultProps}
    />
    <Composition
      id="Vertical"
      component={SocialPost}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      schema={socialPostSchema}
      defaultProps={defaultProps}
    />
  </>
);

import { Composition } from 'remotion';
import { AppAct, APP_ACT_FRAMES } from './AppAct';
import './fonts';

/** Act 2 of the welcome film: 1080x2340 portrait at 60 fps, rendered once per theme. */
export const RemotionRoot = () => (
  <Composition
    id="AppAct"
    component={AppAct}
    durationInFrames={APP_ACT_FRAMES}
    fps={60}
    width={1080}
    height={2340}
    defaultProps={{ theme: 'light' }}
  />
);

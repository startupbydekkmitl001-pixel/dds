import type { FeatureKey } from '@/data/types';
import type { Scheme } from '@/theme/ThemeProvider';

/**
 * Looping art for the Home tiles: a 6 s seamless clip per feature and appearance, rendered
 * from the HyperFrames project in `motion/tiles` ("Tile loops" in README.md). The poster is
 * each clip's first frame, so handing over from still to video is invisible.
 * Metro needs static require() paths, hence the explicit table.
 */
export interface TileArtSource {
  video: number;
  poster: number;
}

export const TILE_ART: Partial<Record<FeatureKey, Record<Scheme, TileArtSource>>> = {
  attendance: {
    light: { video: require('../../../assets/tiles/attendance-light.mp4'), poster: require('../../../assets/tiles/attendance-light.jpg') },
    dark: { video: require('../../../assets/tiles/attendance-dark.mp4'), poster: require('../../../assets/tiles/attendance-dark.jpg') },
  },
  behavior: {
    light: { video: require('../../../assets/tiles/behavior-light.mp4'), poster: require('../../../assets/tiles/behavior-light.jpg') },
    dark: { video: require('../../../assets/tiles/behavior-dark.mp4'), poster: require('../../../assets/tiles/behavior-dark.jpg') },
  },
  leave: {
    light: { video: require('../../../assets/tiles/leave-light.mp4'), poster: require('../../../assets/tiles/leave-light.jpg') },
    dark: { video: require('../../../assets/tiles/leave-dark.mp4'), poster: require('../../../assets/tiles/leave-dark.jpg') },
  },
  assessments: {
    light: { video: require('../../../assets/tiles/assessments-light.mp4'), poster: require('../../../assets/tiles/assessments-light.jpg') },
    dark: { video: require('../../../assets/tiles/assessments-dark.mp4'), poster: require('../../../assets/tiles/assessments-dark.jpg') },
  },
};

export function tileArtFor(feature: FeatureKey, scheme: Scheme): TileArtSource | undefined {
  return TILE_ART[feature]?.[scheme];
}

import { StyleSheet, View } from 'react-native';
import { LoopClip } from './LoopClip';
import type { TileArtSource } from './tileArtSources';

/**
 * The looping art inside a Home tile. Decorative, so it stays out of the accessibility tree;
 * the loop itself (poster, muted clip, focus and Reduce Motion handling) is `LoopClip`.
 */
export function TileArt({ art }: { art: TileArtSource }) {
  return (
    <View
      testID="tile-art"
      style={[StyleSheet.absoluteFill, styles.inert]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LoopClip video={art.video} poster={art.poster} testID="tile-art" />
    </View>
  );
}

const styles = StyleSheet.create({
  inert: { pointerEvents: 'none' },
});

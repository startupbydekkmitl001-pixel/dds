import { useIsFocused } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { AppState, Image, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * A short muted loop over its own poster, filling whatever box it sits in. The poster is the
 * clip's first frame, so the hand-over is invisible. It plays only while its screen is
 * focused, the app is active and `active` is true (a card's hidden face passes false), and
 * with Reduce Motion it stays a still and never decodes the video.
 * Tests find the poster at `${testID}-poster`.
 */
export function LoopClip({ video, poster, testID, active = true }: { video: number; poster: number; testID: string; active?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <>
      <Image testID={`${testID}-poster`} source={poster} resizeMode="cover" style={styles.fill} />
      {reduced ? null : <Clip video={video} active={active} />}
    </>
  );
}

function Clip({ video, active }: { video: number; active: boolean }) {
  const focused = useIsFocused();
  const playing = focused && active;
  // Hidden until the first frame is on screen, so a slow decoder never flashes black over the poster.
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(video, (p) => {
    p.muted = true;
    p.loop = true;
  });

  // Play from an effect, after VideoView has mounted its surface (on web an earlier play() is
  // dropped). The OS pauses video in the background, so resume when the app comes back.
  useEffect(() => {
    if (!playing) {
      player.pause();
      return;
    }
    player.play();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') player.play();
    });
    return () => sub.remove();
  }, [player, playing]);

  return (
    <VideoView
      player={player}
      style={[styles.fill, { opacity: ready ? 1 : 0 }]}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
      surfaceType="textureView"
      onFirstFrameRender={() => setReady(true)}
    />
  );
}

const styles = StyleSheet.create({
  // Explicit size: on web the <video> is a replaced element, so insets alone leave it at its intrinsic size.
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});

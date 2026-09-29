import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play, RotateCcw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmbientLight } from '@/components/motion';
import { Button } from '@/components/ui';
import { appStore, useApp } from '@/data/store';
import { dur } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

/** Rendered from the HyperFrames project in `motion/intro` ("Welcome intro" in README.md). */
const MEDIA = {
  light: {
    video: require('../../../assets/intro/intro-light.mp4'),
    still: require('../../../assets/intro/intro-light-end.jpg'),
  },
  dark: {
    video: require('../../../assets/intro/intro-dark.mp4'),
    still: require('../../../assets/intro/intro-dark-end.jpg'),
  },
} as const;

/** The film is 1080×2340. Phones near that shape fill edge to edge; wider screens letterbox over ambient light. */
const FILM_ASPECT = 1080 / 2340;
const FILM_LABEL = 'วิดีโอแนะนำ Dschool: เวลาเรียน กระเป๋าเงิน จ่ายด้วย QR และใบลา ในแอปเดียว';

/** playing → ended (last frame + CTA); `still` is the Reduce Motion poster; `error` hides replay. */
type Phase = 'playing' | 'ended' | 'still' | 'error';

/** Full-screen welcome film shown once after the first unlock, and on demand from Settings. */
export function WelcomeIntro() {
  const { c, scheme } = useTheme();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const updateSettings = useApp((s) => s.updateSettings);
  const media = MEDIA[scheme];
  const [phase, setPhase] = useState<Phase>(reduced ? 'still' : 'playing');

  const player = useVideoPlayer(media.video, (p) => {
    p.muted = true;
    p.loop = false;
  });
  // Play from an effect, after VideoView has mounted its surface: on web, play() before
  // that reaches no <video> element and is silently dropped. The OS (or browser tab)
  // pauses video in the background, so resume when the app comes back.
  useEffect(() => {
    if (phase !== 'playing') return;
    player.play();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') player.play();
    });
    return () => sub.remove();
  }, [player, phase]);
  useEventListener(player, 'playToEnd', () => setPhase('ended'));
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') setPhase('error');
  });

  // Leaving by any path (Android back, lock) counts as seen, so it never nags.
  useEffect(() => () => appStore.getState().updateSettings({ introSeen: true }), []);

  const finish = () => {
    updateSettings({ introSeen: true });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const play = () => setPhase('playing');
  const replay = () => {
    player.replay();
    setPhase('playing');
  };

  const fit = Math.abs(width / height - FILM_ASPECT) < 0.12 ? 'cover' : 'contain';
  const showStill = phase === 'still' || phase === 'error';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.canvas }]}>
      {fit === 'contain' ? <AmbientLight /> : null}
      {showStill ? (
        <Image
          source={media.still}
          resizeMode={fit}
          style={StyleSheet.absoluteFill}
          accessible
          accessibilityLabel={FILM_LABEL}
        />
      ) : (
        <VideoView
          player={player}
          style={styles.film}
          contentFit={fit}
          nativeControls={false}
          allowsPictureInPicture={false}
          accessible
          accessibilityLabel={FILM_LABEL}
        />
      )}

      {phase === 'playing' ? (
        <Animated.View entering={FadeIn.duration(dur.base)} style={[styles.skip, { top: insets.top + 8 }]}>
          <Button title="ข้าม" size="sm" onPress={finish} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(dur.base)} style={[styles.cta, { paddingBottom: insets.bottom + 20 }]}>
          <Button title="เริ่มต้นใช้งาน" variant="primary" onPress={finish} />
          {phase === 'error' ? null : phase === 'still' ? (
            <Button title="เล่นวิดีโอ" variant="ghost" icon={Play} onPress={play} style={styles.again} />
          ) : (
            <Button title="ดูอีกครั้ง" variant="ghost" icon={RotateCcw} onPress={replay} style={styles.again} />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Explicit size: on web the <video> is a replaced element, so insets alone leave it at its intrinsic 1080×2340.
  film: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  skip: { position: 'absolute', right: 16 },
  cta: { position: 'absolute', left: 20, right: 20, bottom: 0, gap: 8 },
  again: { alignSelf: 'center' },
});

import { useEffect } from 'react';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { LoopClip } from '@/components/ui/LoopClip';
import { springSoft } from '@/theme/motion';

/**
 * The school's emblem as a round pearl seal that never quite stops moving: a 6 s seamless loop
 * (rays pulsing out from the finial, a sheen across the crest, sparkles on the gold) rendered from
 * the HyperFrames project in `motion/seal` ("School seal" in README.md). The clip is opaque and
 * round, so the official colours read the same on the light and the dark card. Decorative: the
 * card already carries the school's name in text.
 */
const SEAL = {
  video: require('../../../assets/seal/seal.mp4') as number,
  poster: require('../../../assets/seal/seal.jpg') as number,
};

export function SchoolSeal({ size, active = true }: { size: number; active?: boolean }) {
  const reduced = useReducedMotion();
  const enter = useSharedValue(reduced ? 1 : 0);

  // The seal settles onto the card with a soft spring rather than just appearing.
  useEffect(() => {
    if (!reduced) enter.value = withSpring(1, springSoft);
  }, [enter, reduced]);

  const pop = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: interpolate(enter.value, [0, 1], [0.8, 1]) }],
  }));

  return (
    <Animated.View
      testID="school-seal"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          boxShadow: '0px 0px 0px 1.5px rgba(255,255,255,0.75), 0px 6px 16px rgba(20,24,60,0.28)',
        },
        pop,
      ]}
    >
      <LoopClip video={SEAL.video} poster={SEAL.poster} testID="school-seal" active={active} />
    </Animated.View>
  );
}

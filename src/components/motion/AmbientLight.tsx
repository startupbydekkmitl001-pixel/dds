import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { Aurora, type OrbSpec } from './Aurora';

/**
 * The room every screen lives in: the canvas plus four pools of muted pastel
 * light placed off-centre, so glass above it always has something soft to frost.
 */
export function AmbientLight({ scrollY }: { scrollY?: SharedValue<number> }) {
  const { c } = useTheme();
  const orbs = useMemo<OrbSpec[]>(() => {
    const [lavender, sky, mint, rose] = c.ambient;
    const o = c.ambientOpacity;
    return [
      { color: lavender, x: 0.05, y: 0.06, r: 0.72, opacity: o },
      { color: sky, x: 1.0, y: 0.26, r: 0.66, opacity: o * 0.9 },
      { color: mint, x: 0.1, y: 0.62, r: 0.62, opacity: o * 0.8 },
      { color: rose, x: 0.95, y: 0.9, r: 0.7, opacity: o * 0.85 },
    ];
  }, [c.ambient, c.ambientOpacity]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.canvas }]}>
      <Aurora orbs={orbs} scrollY={scrollY} />
    </View>
  );
}

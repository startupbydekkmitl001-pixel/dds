import { Moon, Sun } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { PressableScale } from '@/components/motion/PressableScale';
import { useApp } from '@/data/store';
import { springSoft } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';
import { Icon } from './Icon';

/** Glass sun/moon switch: the sun sets as the moon rises. Sets an explicit light or dark preference. */
export function ThemeToggle() {
  const { scheme, elevation } = useTheme();
  const reduced = useReducedMotion();
  const updateSettings = useApp((s) => s.updateSettings);
  const dark = scheme === 'dark';
  const p = useSharedValue(dark ? 1 : 0);

  useEffect(() => {
    p.value = reduced ? (dark ? 1 : 0) : withSpring(dark ? 1 : 0, springSoft);
  }, [dark, reduced, p]);

  const sun = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [{ translateY: p.value * 14 }, { rotate: `${p.value * 90}deg` }, { scale: 1 - p.value * 0.4 }],
  }));
  const moon = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * -14 }, { rotate: `${(1 - p.value) * -60}deg` }, { scale: 0.6 + p.value * 0.4 }],
  }));

  return (
    <PressableScale
      accessibilityRole="switch"
      accessibilityState={{ checked: dark }}
      accessibilityLabel="โหมดมืด"
      accessibilityHint={dark ? 'แตะเพื่อเปลี่ยนเป็นโหมดสว่าง' : 'แตะเพื่อเปลี่ยนเป็นโหมดมืด'}
      haptic="light"
      hitSlop={6}
      onPress={() => updateSettings({ theme: dark ? 'light' : 'dark' })}
      style={[styles.btn, { boxShadow: elevation.low }]}
    >
      <GlassLayers radius={22} />
      <View style={styles.clip} pointerEvents="none">
        <Animated.View style={[styles.icon, sun]}>
          <Icon icon={Sun} size={20} />
        </Animated.View>
        <Animated.View style={[styles.icon, moon]}>
          <Icon icon={Moon} size={19} />
        </Animated.View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  clip: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  icon: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});

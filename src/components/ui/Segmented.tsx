import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { springSoft } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { white, withAlpha } from '@/theme/tokens';
import { GlassLayers } from './Glass';
import { Text } from './Text';

const PAD = 4;

/** Glass pill track with a glossy thumb that glides (and settles softly) to the selection. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, scheme, elevation } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;
  const x = useSharedValue(0);
  const placed = useSharedValue(false);

  useEffect(() => {
    const to = index * segment;
    if (!placed.value || reduced) {
      x.value = to;
      placed.value = segment > 0;
      return;
    }
    x.value = withSpring(to, springSoft);
  }, [index, segment, x, placed, reduced]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const thumbFill = scheme === 'dark' ? withAlpha(white, 0.14) : c.cardRaised;

  return (
    <View accessibilityRole="tablist" onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[styles.track, style]}>
      <GlassLayers radius={999} gloss={false} />
      {segment > 0 ? (
        <Animated.View
          style={[styles.thumb, { width: segment, backgroundColor: thumbFill, borderColor: c.glassBorder, boxShadow: elevation.low }, thumb]}
        />
      ) : null}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (selected) return;
              haptic.selection();
              onChange(o.value);
            }}
            style={styles.option}
          >
            <Text variant="label" tone={selected ? 'primary' : 'secondary'} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 999, padding: PAD, minHeight: 46 },
  thumb: { position: 'absolute', top: PAD, bottom: PAD, left: PAD, borderRadius: 999, borderWidth: 1 },
  option: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 6 },
});

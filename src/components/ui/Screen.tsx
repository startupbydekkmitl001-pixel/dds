import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { RefreshControl, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmbientLight } from '@/components/motion/AmbientLight';
import { useTheme } from '@/theme/ThemeProvider';
import { screenPad } from '@/theme/tokens';
import { GlassLayers } from './Glass';
import { IconButton } from './IconButton';
import { Text } from './Text';

/**
 * Screen scaffold: ambient light that parallaxes gently with scroll, safe-area
 * top, pull-to-refresh, room for the floating tab bar, and a compact frosted
 * title bar that fades in once you scroll.
 */
export function Screen({
  children,
  header,
  title,
  back,
  onRefresh,
  refreshing = false,
  scroll = true,
  padded = true,
  contentStyle,
}: {
  children: ReactNode;
  header?: ReactNode;
  title?: string;
  back?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const barStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [36, 72], [0, 1], 'clamp') }));
  // The compact bar only takes touches once it's visible; while hidden it must not cover the header's buttons.
  const [barActive, setBarActive] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > 54,
    (active, previous) => {
      if (active !== previous) scheduleOnRN(setBarActive, active);
    },
  );

  const inner: StyleProp<ViewStyle> = [
    { paddingTop: insets.top + 8, paddingHorizontal: padded ? screenPad : 0, paddingBottom: 124 + insets.bottom },
    contentStyle,
  ];

  return (
    <View style={[styles.fill, { backgroundColor: c.canvas }]}>
      <AmbientLight scrollY={scrollY} />
      {scroll ? (
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={inner}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.textSecondary} /> : undefined
          }
        >
          {header}
          {children}
        </Animated.ScrollView>
      ) : (
        <View style={[styles.fill, inner]}>
          {header}
          {children}
        </View>
      )}
      {title ? (
        <Animated.View pointerEvents={barActive ? 'box-none' : 'none'} style={[styles.bar, { height: insets.top + 52 }, barStyle]}>
          <GlassLayers radius={0} blur strong intensity={50} gloss={false} rim={false} />
          <View pointerEvents="none" style={[styles.barEdge, { backgroundColor: c.glassBorder }]} />
          <View style={[styles.barRow, { paddingTop: insets.top }]} pointerEvents={barActive ? 'box-none' : 'none'}>
            <View style={styles.barSide}>
              {back ? <IconButton icon={ChevronLeft} label="ย้อนกลับ" tone="plain" onPress={() => router.back()} /> : null}
            </View>
            <Text variant="label" numberOfLines={1} style={styles.barTitle}>
              {title}
            </Text>
            <View style={styles.barSide} />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
  barEdge: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  barRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  barSide: { width: 52 },
  barTitle: { flex: 1, textAlign: 'center' },
});

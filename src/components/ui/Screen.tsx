import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { RefreshControl, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { screenPad, withAlpha } from '@/theme/tokens';
import { IconButton } from './IconButton';
import { Text } from './Text';

/**
 * Screen scaffold: safe-area top, scroll + pull-to-refresh, bottom room for the
 * tab bar, and a compact frosted title bar that fades in once you scroll (spec §4.3).
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
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const barStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [36, 72], [0, 1], 'clamp') }));

  const inner: StyleProp<ViewStyle> = [
    { paddingTop: insets.top + 8, paddingHorizontal: padded ? screenPad : 0, paddingBottom: 120 + insets.bottom },
    contentStyle,
  ];

  return (
    <View style={[styles.fill, { backgroundColor: c.canvas }]}>
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
        <Animated.View pointerEvents="box-none" style={[styles.bar, { height: insets.top + 52 }, barStyle]}>
          <BlurView intensity={40} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(c.canvas, 0.72), borderBottomWidth: 1, borderBottomColor: c.hairline }]} />
          <View style={[styles.barRow, { paddingTop: insets.top }]} pointerEvents="box-none">
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
  barRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  barSide: { width: 52 },
  barTitle: { flex: 1, textAlign: 'center' },
});

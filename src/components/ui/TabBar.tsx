import { LinearGradient } from 'expo-linear-gradient';
import { router, type Tabs } from 'expo-router';
import { CalendarCheck, House, ScanQrCode, UserRound, Wallet } from 'lucide-react-native';
import { useEffect, useState, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/motion/PressableScale';
import { haptic } from '@/lib/haptics';
import { springSoft } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { white, withAlpha } from '@/theme/tokens';
import { GlassLayers } from './Glass';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'หน้าหลัก', icon: House },
  attendance: { label: 'เวลาเรียน', icon: CalendarCheck },
  wallet: { label: 'กระเป๋า', icon: Wallet },
  me: { label: 'ฉัน', icon: UserRound },
};

const BAR_H = 68;
const INSET = 6;

/**
 * Floating frosted capsule. A lens of brighter glass glides under the active
 * tab; the glossy ink QR-scan button sits at the centre.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const { c, scheme, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const count = state.routes.length;
  const seg = width > 0 ? (width - INSET * 2) / count : 0;
  const x = useSharedValue(0);
  const ready = useSharedValue(false);

  useEffect(() => {
    if (seg === 0) return;
    const to = state.index * seg;
    if (!ready.value || reduced) {
      x.value = to;
      ready.value = true;
      return;
    }
    x.value = withSpring(to, springSoft);
  }, [state.index, seg, x, ready, reduced]);

  const lens = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const lensFill = scheme === 'dark' ? withAlpha(white, 0.1) : withAlpha(c.secondary, 0.9);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 6, 12) }]} pointerEvents="box-none">
      <View
        style={[styles.capsule, { boxShadow: elevation.high }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <GlassLayers radius={BAR_H / 2} blur strong intensity={60} />
        {seg > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.lens, { width: seg, backgroundColor: lensFill, borderColor: c.glassBorder }, lens]}
          />
        ) : null}
        {state.routes.map((route, i) => {
          if (route.name === 'scan') {
            return (
              <View key={route.key} style={styles.item}>
                <PressableScale
                  accessibilityLabel="สแกน QR"
                  haptic="light"
                  scaleTo={0.92}
                  onPress={() => router.push('/qr')}
                  style={[styles.qr, { backgroundColor: c.primary, boxShadow: elevation.low }]}
                >
                  <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.qrGloss]}>
                    <LinearGradient colors={[withAlpha(white, 0.28), withAlpha(white, 0)]} locations={[0, 0.6]} style={StyleSheet.absoluteFill} />
                  </View>
                  <Icon icon={ScanQrCode} color={c.onPrimary} size={24} />
                </PressableScale>
              </View>
            );
          }
          const item = ITEMS[route.name];
          if (!item) return null;
          const focused = state.index === i;
          const color = focused ? c.text : c.textSecondary;
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label}
              scaleTo={0.92}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  haptic.selection();
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={styles.item}
            >
              <Icon icon={item.icon} color={color} size={22} strokeWidth={focused ? 2.1 : 1.75} />
              <Text variant="caption" size={11} color={color} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {item.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14 },
  capsule: { height: BAR_H, borderRadius: BAR_H / 2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: INSET, maxWidth: 520, width: '100%', alignSelf: 'center' },
  lens: { position: 'absolute', left: INSET, top: INSET, bottom: INSET, borderRadius: (BAR_H - INSET * 2) / 2, borderWidth: 1 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1, height: BAR_H - INSET * 2 },
  qr: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  qrGloss: { borderRadius: 25, overflow: 'hidden' },
});

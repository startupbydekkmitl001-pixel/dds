import { BlurView } from 'expo-blur';
import { router, type Tabs } from 'expo-router';
import { CalendarCheck, House, QrCode, UserRound, Wallet } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/motion/PressableScale';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'หน้าหลัก', icon: House },
  attendance: { label: 'เวลาเรียน', icon: CalendarCheck },
  wallet: { label: 'กระเป๋า', icon: Wallet },
  me: { label: 'ฉัน', icon: UserRound },
};

/** Frosted tab bar with a raised QR pay button in the centre (Air's glass chrome). */
export function TabBar({ state, navigation }: TabBarProps) {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BlurView intensity={40} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(c.canvas, 0.78), borderTopWidth: 1, borderTopColor: c.hairline }]} />
      <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {state.routes.map((route, i) => {
          if (route.name === 'qr') {
            return (
              <View key={route.key} style={styles.item}>
                <PressableScale
                  accessibilityLabel="จ่ายเงินด้วย QR"
                  haptic="light"
                  onPress={() => router.push('/qr')}
                  style={[styles.qr, { backgroundColor: c.primary, borderColor: c.canvas }]}
                >
                  <Icon icon={QrCode} color={c.onPrimary} size={26} />
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
              <Text variant="caption" color={color} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                {item.label}
              </Text>
              <View style={[styles.dot, { backgroundColor: focused ? c.text : 'transparent' }]} />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  row: { flexDirection: 'row', paddingTop: 8, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 2, minHeight: 48 },
  qr: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: -26, borderWidth: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
});

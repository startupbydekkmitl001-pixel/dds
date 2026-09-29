import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { PressableScale, SoftLight } from '@/components/motion';
import { GlassLayers, Icon, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import type { ThemePref } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { palette } from '@/theme/tokens';

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'ตามระบบ' },
  { value: 'light', label: 'สว่าง' },
  { value: 'dark', label: 'มืด' },
];

/** A thumbnail of the app in one scheme: ambient light, a glass card and two lines of text. */
function Miniature({ mode }: { mode: 'light' | 'dark' }) {
  const p = palette[mode];
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: p.canvas }]}>
      <View style={styles.orbA}>
        <SoftLight size={90} color={p.ambient[0]} opacity={p.ambientOpacity * 1.2} />
      </View>
      <View style={styles.orbB}>
        <SoftLight size={80} color={p.ambient[3]} opacity={p.ambientOpacity} />
      </View>
      <View style={[styles.miniCard, { backgroundColor: p.glass, borderColor: p.glassBorder }]}>
        <View style={[styles.line, { width: '70%', backgroundColor: p.text }]} />
        <View style={[styles.line, { width: '45%', backgroundColor: p.textSecondary, opacity: 0.6 }]} />
      </View>
      <View style={[styles.miniPill, { backgroundColor: p.primary }]} />
    </View>
  );
}

/** Three live previews — ตามระบบ is split light/dark — with a lavender halo on the choice. */
export function AppearancePicker() {
  const { c, radius, elevation } = useTheme();
  const pref = useApp((s) => s.settings.theme);
  const updateSettings = useApp((s) => s.updateSettings);

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="รูปแบบการแสดงผล">
      {OPTIONS.map((o) => {
        const selected = pref === o.value;
        return (
          <PressableScale
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (selected) return;
              haptic.selection();
              updateSettings({ theme: o.value });
            }}
            style={[styles.option, { borderRadius: radius.card, boxShadow: elevation.low }]}
          >
            <GlassLayers radius={radius.card} tint={selected ? c.glassStrong : undefined} />
            <View style={[styles.preview, { borderColor: selected ? c.accent : c.glassBorder }]}>
              {o.value === 'system' ? (
                <>
                  <Miniature mode="light" />
                  <View style={styles.darkHalf}>
                    <View style={styles.darkShift}>
                      <Miniature mode="dark" />
                    </View>
                  </View>
                </>
              ) : (
                <Miniature mode={o.value === 'dark' ? 'dark' : 'light'} />
              )}
            </View>
            <View style={styles.labelRow}>
              <View style={[styles.radio, { borderColor: selected ? c.accent : c.textSecondary, backgroundColor: selected ? c.accent : 'transparent' }]}>
                {selected ? <Icon icon={Check} size={12} color={c.onAccent} strokeWidth={3} /> : null}
              </View>
              <Text variant="label" tone={selected ? 'primary' : 'secondary'}>
                {o.label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const PREVIEW_H = 104;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, padding: 6, gap: 8 },
  preview: { height: PREVIEW_H, borderRadius: 18, overflow: 'hidden', borderWidth: 2 },
  darkHalf: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden' },
  darkShift: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '200%' },
  orbA: { position: 'absolute', left: -30, top: -30 },
  orbB: { position: 'absolute', right: -30, bottom: -26 },
  miniCard: { position: 'absolute', left: 10, right: 10, top: 16, height: 40, borderRadius: 10, borderWidth: 1, padding: 8, gap: 5 },
  line: { height: 5, borderRadius: 3 },
  miniPill: { position: 'absolute', left: 10, bottom: 14, width: 34, height: 12, borderRadius: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, paddingBottom: 4 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});

import { Delete, ScanFace } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { GlassLayers, Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['bio', '0', 'del'],
];

/**
 * Large 72pt frosted-glass keypad (64pt when `compact`, for short screens); Face ID bottom-left (when
 * available), delete bottom-right.
 */
export function PinPad({
  onDigit,
  onDelete,
  onBiometric,
  disabled = false,
  compact = false,
}: {
  onDigit: (d: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { elevation } = useTheme();
  const key = compact ? styles.keyCompact : styles.key;
  return (
    <View style={[styles.grid, compact ? styles.gridCompact : null]}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={[styles.row, compact ? styles.rowCompact : null]}>
          {row.map((k) => {
            if (k === 'bio') {
              return onBiometric ? (
                <PressableScale key={k} accessibilityLabel="ใช้ Face ID" haptic="light" onPress={onBiometric} style={key}>
                  <Icon icon={ScanFace} size={28} />
                </PressableScale>
              ) : (
                <View key={k} style={key} />
              );
            }
            if (k === 'del') {
              return (
                <PressableScale key={k} accessibilityLabel="ลบ" haptic="selection" onPress={onDelete} disabled={disabled} style={key}>
                  <Icon icon={Delete} size={26} />
                </PressableScale>
              );
            }
            return (
              <PressableScale
                key={k}
                accessibilityLabel={k}
                haptic="selection"
                disabled={disabled}
                onPress={() => onDigit(k)}
                style={[key, { boxShadow: elevation.low, opacity: disabled ? 0.45 : 1 }]}
              >
                <GlassLayers radius={compact ? 32 : 36} />
                <Text variant="title" size={compact ? 28 : 30}>
                  {k}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 26 },
  gridCompact: { gap: 10 },
  rowCompact: { gap: 24 },
  key: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  keyCompact: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});

import { Delete, ScanFace } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['bio', '0', 'del'],
];

/** Large 72pt keypad; Face ID bottom-left (when available), delete bottom-right. */
export function PinPad({
  onDigit,
  onDelete,
  onBiometric,
  disabled = false,
}: {
  onDigit: (d: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  disabled?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((k) => {
            if (k === 'bio') {
              return onBiometric ? (
                <PressableScale key={k} accessibilityLabel="ใช้ Face ID" haptic="light" onPress={onBiometric} style={styles.key}>
                  <Icon icon={ScanFace} size={28} />
                </PressableScale>
              ) : (
                <View key={k} style={styles.key} />
              );
            }
            if (k === 'del') {
              return (
                <PressableScale key={k} accessibilityLabel="ลบ" haptic="selection" onPress={onDelete} disabled={disabled} style={styles.key}>
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
                style={[styles.key, { backgroundColor: c.card, borderColor: c.hairline, borderWidth: 1, opacity: disabled ? 0.45 : 1 }]}
              >
                <Text variant="data" size={28}>
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
  key: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});

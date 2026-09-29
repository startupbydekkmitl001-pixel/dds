import { Minus, Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Icon, Text } from '@/components/ui';
import type { BehaviorEvent } from '@/data/types';
import { parseISODate, thaiDate } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

export function BehaviorTimeline({ events }: { events: BehaviorEvent[] }) {
  const { c } = useTheme();
  const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <View style={styles.list}>
      {sorted.map((e, i) => {
        const up = e.delta > 0;
        const tint = up ? c.successText : c.dangerText;
        return (
          <StaggerIn key={e.id} index={i}>
            <View style={styles.row} accessible accessibilityLabel={`${up ? 'เพิ่ม' : 'หัก'} ${Math.abs(e.delta)} คะแนน ${e.title} ${thaiDate(parseISODate(e.date), 'short')}`}>
              <View style={[styles.chip, { backgroundColor: withAlpha(up ? c.success : c.danger, 0.14) }]}>
                <Icon icon={up ? Plus : Minus} size={16} color={tint} strokeWidth={2.4} />
              </View>
              <View style={styles.flex}>
                <Text variant="body">{e.title}</Text>
                <Text variant="caption" tone="secondary">
                  {thaiDate(parseISODate(e.date), 'short')}
                </Text>
              </View>
              <Text variant="data" size={18} color={tint}>
                {`${up ? '+' : '−'}${Math.abs(e.delta)}`}
              </Text>
            </View>
          </StaggerIn>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});

import { ArrowDownLeft, Utensils } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { GlassLayers, Icon, Text } from '@/components/ui';
import { groupByDay } from '@/data/selectors';
import type { Transaction } from '@/data/types';
import { now, toISODate } from '@/lib/clock';
import { formatBaht, parseISODate, thaiDate, timeHM } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

function dayLabel(date: string): string {
  const today = now();
  if (date === toISODate(today)) return 'วันนี้';
  const y = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (date === toISODate(y)) return 'เมื่อวาน';
  return thaiDate(parseISODate(date), 'short');
}

function TxRow({ tx }: { tx: Transaction }) {
  const { c, feature } = useTheme();
  const topup = tx.kind === 'topup';
  const signed = topup ? tx.amount : -tx.amount;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${tx.title} ${timeHM(new Date(tx.at))} ${topup ? 'เติมเงิน' : 'ใช้จ่าย'} ${formatBaht(tx.amount)}`}
    >
      <View style={[styles.chip, { backgroundColor: topup ? feature.leave.fill : feature.wallet.fill }]}>
        <Icon icon={topup ? ArrowDownLeft : Utensils} size={18} color={topup ? feature.leave.ink : feature.wallet.ink} />
      </View>
      <View style={styles.flex}>
        <Text variant="body" numberOfLines={1}>
          {tx.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="data" size={12} tone="secondary">
            {timeHM(new Date(tx.at))}
          </Text>
          {tx.source === 'slip' ? (
            <View style={[styles.badge, { borderColor: c.hairline }]}>
              <Text variant="caption" tone="secondary">
                สลิป
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text variant="data" color={topup ? c.successText : c.text}>
        {formatBaht(signed, { sign: true })}
      </Text>
    </View>
  );
}

/** Transactions grouped by day ("วันนี้", "เมื่อวาน", then dates), newest first. */
export function TxList({ transactions, limit }: { transactions: Transaction[]; limit?: number }) {
  const { c, radius, elevation } = useTheme();
  const groups = useMemo(() => {
    const all = groupByDay(transactions);
    if (limit === undefined) return all;
    let left = limit;
    const out: typeof all = [];
    for (const g of all) {
      if (left <= 0) break;
      out.push({ date: g.date, items: g.items.slice(0, left) });
      left -= g.items.length;
    }
    return out;
  }, [transactions, limit]);

  return (
    <View style={styles.list}>
      {groups.map((g, gi) => (
        <StaggerIn key={g.date} index={gi}>
          <Text variant="label" tone="secondary" style={styles.dayHead}>
            {dayLabel(g.date)}
          </Text>
          <View style={[styles.group, { borderRadius: radius.card, boxShadow: elevation.low }]}>
            <GlassLayers radius={radius.card} />
            {g.items.map((t, i) => (
              <View key={t.id} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.hairline } : null}>
                <TxRow tx={t} />
              </View>
            ))}
          </View>
        </StaggerIn>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  dayHead: { marginBottom: 8 },
  group: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chip: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8 },
});

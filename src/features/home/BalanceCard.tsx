import { router } from 'expo-router';
import { Lock, Plus, QrCode } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { NumberTicker, PrismShimmer } from '@/components/motion';
import { Button, Icon, Text } from '@/components/ui';
import { spentToday } from '@/data/selectors';
import { useApp } from '@/data/store';
import { formatBaht } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

/** Prism balance card (Vivid+Co shimmer on an Origin card). Reused on Home, Wallet and QR. */
export function BalanceCard({ size = 'md', showActions = true }: { size?: 'md' | 'lg'; showActions?: boolean }) {
  const { c, radius } = useTheme();
  const wallet = useApp((s) => s.wallet);
  const t = useNow();
  const spent = useMemo(() => spentToday(wallet.transactions, t), [wallet.transactions, t]);

  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.hairline, borderRadius: radius.tile }]}
      accessible
      accessibilityLabel={`ยอดเงินคงเหลือ ${formatBaht(wallet.balance)} ใช้ไปวันนี้ ${formatBaht(spent)}${wallet.frozen ? ' บัตรถูกอายัด' : ''}`}
    >
      <PrismShimmer radius={radius.tile} />
      <Text variant="label" tone="secondary">
        ยอดเงินคงเหลือ
      </Text>
      <NumberTicker value={wallet.balance} from={0} format={formatBaht} size={size === 'lg' ? 48 : 40} />
      <Text variant="caption" tone="secondary">
        {`ใช้ไปวันนี้ ${formatBaht(spent)}`}
      </Text>

      {wallet.frozen ? (
        <View style={[styles.frozen, { backgroundColor: withAlpha(c.dangerText, 0.1) }]}>
          <Icon icon={Lock} size={16} color={c.dangerText} />
          <Text variant="label" color={c.dangerText} style={styles.flex}>
            บัตรถูกอายัด · จ่ายเงินไม่ได้ชั่วคราว
          </Text>
        </View>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          <Button title="เติมเงิน" variant="primary" icon={Plus} onPress={() => router.push('/topup')} style={styles.flex} />
          <Button title="จ่าย QR" icon={QrCode} onPress={() => router.push('/qr')} style={styles.flex} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 2, borderWidth: 1, overflow: 'hidden' },
  frozen: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  flex: { flex: 1 },
});

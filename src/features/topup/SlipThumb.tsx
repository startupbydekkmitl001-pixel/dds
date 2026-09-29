import { CircleCheck } from 'lucide-react-native';
import { Image, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { SCHOOL_ACCOUNT } from '@/data/seed';
import { now } from '@/lib/clock';
import { formatBaht, thaiDate, timeHM } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

export const SLIP_W = 200;
export const SLIP_H = 300;

/** A drawn sample bank slip so the pitch never depends on a real slip photo. */
function DemoSlip({ amount }: { amount: number }) {
  const { c, feature } = useTheme();
  const t = now();
  return (
    <View style={[styles.slip, { backgroundColor: c.card, borderColor: c.hairline }]}>
      <View style={[styles.slipHead, { backgroundColor: feature.announcements.fill }]}>
        <Text variant="label" color={feature.announcements.ink}>
          {SCHOOL_ACCOUNT.bank}
        </Text>
      </View>
      <View style={styles.slipBody}>
        <Icon icon={CircleCheck} size={28} color={c.successText} />
        <Text variant="label">โอนเงินสำเร็จ</Text>
        <Text variant="data" size={26}>
          {formatBaht(amount)}
        </Text>
        <View style={[styles.rule, { backgroundColor: c.hairline }]} />
        <Text variant="caption" tone="secondary">
          จาก นางสมศรี ศ.
        </Text>
        <Text variant="caption" tone="secondary" center>
          {`ไปยัง ${SCHOOL_ACCOUNT.name}`}
        </Text>
        <Text variant="data" size={11} tone="secondary">
          {`${thaiDate(t, 'numeric')} ${timeHM(t)}`}
        </Text>
      </View>
    </View>
  );
}

export function SlipThumb({ uri, amount }: { uri: string; amount: number }) {
  const { radius } = useTheme();
  if (uri.startsWith('demo://')) return <DemoSlip amount={amount} />;
  return (
    <Image
      source={{ uri }}
      accessibilityLabel="รูปสลิปที่เลือก"
      style={{ width: SLIP_W, height: SLIP_H, borderRadius: radius.card }}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  slip: { width: SLIP_W, height: SLIP_H, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  slipHead: { paddingVertical: 12, alignItems: 'center' },
  slipBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12 },
  rule: { height: 1, alignSelf: 'stretch', marginVertical: 6 },
});

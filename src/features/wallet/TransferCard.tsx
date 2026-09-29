import { CircleCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text } from '@/components/ui';
import type { BankTransfer } from '@/data/types';
import { formatBaht, thaiDate, timeHM } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** One bank-side transfer the student can match to their slip. */
export function TransferCard({ transfer, onCheck, checking }: { transfer: BankTransfer; onCheck: () => void; checking: boolean }) {
  const { c } = useTheme();
  const at = new Date(transfer.at);
  return (
    <Card style={styles.card}>
      <View style={styles.cols}>
        <View style={styles.flex}>
          <Text variant="caption" tone="secondary">
            วัน-เวลา
          </Text>
          <Text variant="data" size={15}>
            {`${thaiDate(at, 'numeric')} ${timeHM(at)}`}
          </Text>
        </View>
        <View style={styles.right}>
          <Text variant="caption" tone="secondary">
            ยอดเงิน
          </Text>
          <Text variant="data" size={20}>
            {formatBaht(transfer.amount)}
          </Text>
        </View>
      </View>
      {transfer.claimed ? (
        <View style={styles.done} accessibilityLabel="เติมแล้ว">
          <Icon icon={CircleCheck} size={18} color={c.successText} />
          <Text variant="label" color={c.successText}>
            เติมแล้ว
          </Text>
        </View>
      ) : (
        <Button title="ตรวจสอบ" size="sm" loading={checking} onPress={onCheck} accessibilityHint={`ตรวจสอบรายการโอน ${formatBaht(transfer.amount)}`} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  cols: { flexDirection: 'row', alignItems: 'flex-end' },
  flex: { flex: 1 },
  right: { alignItems: 'flex-end' },
  done: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, justifyContent: 'center' },
});

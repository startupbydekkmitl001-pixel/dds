import * as Clipboard from 'expo-clipboard';
import { Copy, Landmark } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text, toast } from '@/components/ui';
import { SCHOOL_ACCOUNT } from '@/data/seed';
import { formatBaht } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';

/** Step ② — transfer to the school account (copy-able), with the original app's caveats kept. */
export function TransferStep({ amount, onNext }: { amount: number; onNext: () => void }) {
  const { c, feature } = useTheme();

  const copy = async () => {
    await Clipboard.setStringAsync(SCHOOL_ACCOUNT.number.replace(/-/g, ''));
    haptic.success();
    toast('คัดลอกเลขบัญชีแล้ว', { kind: 'success' });
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text variant="title">โอนเข้าบัญชีโรงเรียน</Text>
        <Text variant="body" tone="secondary">
          {`โอน ${formatBaht(amount)} ผ่านแอปธนาคาร แล้วกลับมาส่งสลิปในขั้นถัดไป`}
        </Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.bankRow}>
          <View style={[styles.bankIcon, { backgroundColor: feature.announcements.fill }]}>
            <Icon icon={Landmark} size={20} color={feature.announcements.ink} />
          </View>
          <Text variant="label">{SCHOOL_ACCOUNT.bank}</Text>
        </View>
        <View>
          <Text variant="caption" tone="secondary">
            เลขที่บัญชี
          </Text>
          <Text variant="data" size={26} selectable>
            {SCHOOL_ACCOUNT.number}
          </Text>
        </View>
        <View>
          <Text variant="caption" tone="secondary">
            ชื่อบัญชี
          </Text>
          <Text variant="body">{SCHOOL_ACCOUNT.name}</Text>
        </View>
        <View style={[styles.amountRow, { borderTopColor: c.hairline }]}>
          <Text variant="label" tone="secondary">
            ยอดที่ต้องโอน
          </Text>
          <Text variant="data" size={20}>
            {formatBaht(amount)}
          </Text>
        </View>
        <Button title="คัดลอกเลขบัญชี" icon={Copy} size="sm" onPress={copy} />
      </Card>

      <View style={styles.notes}>
        <Text variant="caption" color={c.dangerText}>
          • ยังไม่รองรับ TrueMoney และ ShopeePay
        </Text>
        <Text variant="caption" color={c.dangerText}>
          • ห้ามโอนผ่านพร้อมเพย์ด้วยเลขบัญชีนี้
        </Text>
      </View>

      <Button title="โอนแล้ว · อัปโหลดสลิป" variant="primary" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  card: { gap: 14 },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bankIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1, paddingTop: 12 },
  notes: { gap: 4 },
});

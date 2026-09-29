import { Check, Clock, TriangleAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BorderTrace, NumberTicker } from '@/components/motion';
import { Button, Icon, Text } from '@/components/ui';
import { formatBaht } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

const BADGE = 96;

/** Verified / pending / rejected outcomes of a slip check. */
export function TopupResult({
  kind,
  amount,
  fromBalance,
  balance,
  onClose,
  onRetry,
}: {
  kind: 'verified' | 'pending' | 'rejected';
  amount: number;
  fromBalance: number;
  balance: number;
  onClose: () => void;
  onRetry: () => void;
}) {
  const { c } = useTheme();

  useEffect(() => {
    if (kind === 'rejected') haptic.error();
    else haptic.success();
  }, [kind]);

  const tint = kind === 'verified' ? c.success : kind === 'pending' ? c.warning : c.dangerText;
  const icon = kind === 'verified' ? Check : kind === 'pending' ? Clock : TriangleAlert;

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={[styles.badge, { backgroundColor: withAlpha(tint, 0.14) }]}>
        <Icon icon={icon} size={40} color={kind === 'verified' ? c.successText : tint} strokeWidth={2.2} />
        {kind === 'verified' ? <BorderTrace width={BADGE} height={BADGE} radius={BADGE / 2} color={c.success} strokeWidth={3} mode="once" /> : null}
      </View>

      {kind === 'verified' ? (
        <>
          <Text variant="title" center>
            เติมเงินสำเร็จ
          </Text>
          <Text variant="body" tone="secondary" center>
            {`เติม ${formatBaht(amount)} เข้ากระเป๋าแล้ว`}
          </Text>
          <View style={styles.balance}>
            <Text variant="label" tone="secondary" center>
              ยอดเงินคงเหลือ
            </Text>
            <NumberTicker value={balance} from={fromBalance} format={formatBaht} size={40} />
          </View>
          <Button title="กลับไปที่กระเป๋า" variant="primary" onPress={onClose} style={styles.button} />
        </>
      ) : null}

      {kind === 'pending' ? (
        <>
          <Text variant="title" center>
            กำลังตรวจสอบสลิป
          </Text>
          <Text variant="body" tone="secondary" center>
            เราจะแจ้งเตือนเมื่อเสร็จ ปิดหน้านี้ได้เลย
          </Text>
          <Button title="ปิด" variant="primary" onPress={onClose} style={styles.button} />
        </>
      ) : null}

      {kind === 'rejected' ? (
        <>
          <Text variant="title" center>
            ตรวจสอบสลิปไม่ผ่าน
          </Text>
          <Text variant="body" tone="secondary" center>
            ไม่พบรายการโอนที่ตรงกับสลิป ตรวจดูว่าเลือกรูปสลิปถูกใบแล้วลองอีกครั้ง
          </Text>
          <Button title="ลองอีกครั้ง" variant="primary" onPress={onRetry} style={styles.button} />
          <Button title="ปิด" variant="ghost" onPress={onClose} style={styles.button} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingTop: 24 },
  badge: { width: BADGE, height: BADGE, borderRadius: BADGE / 2, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  balance: { alignItems: 'center', marginVertical: 12 },
  button: { alignSelf: 'stretch' },
});

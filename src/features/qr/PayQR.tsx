import { BlurView } from 'expo-blur';
import { Check, Lock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { BorderTrace, NumberTicker } from '@/components/motion';
import { Button, ConfirmSheet, Icon, Text, toast } from '@/components/ui';
import { useApp } from '@/data/store';
import { useMaxBrightness } from '@/lib/brightness';
import { now } from '@/lib/clock';
import { newQrToken, QR_PERIOD_S, secondsLeft } from '@/lib/countdown';
import { formatBaht } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { qr, withAlpha } from '@/theme/tokens';

const FRAME = 260;
const CODE = 196;
const DEMO_SHOP = 'ร้านข้าวมันไก่ป้าน้อย';
const DEMO_PRICE = 35;

/** Rotating pay QR inside a 60s countdown trace; long-press simulates a canteen scan (demo). */
export function PayQR() {
  const { c, scheme } = useTheme();
  const student = useApp((s) => s.student);
  const balance = useApp((s) => s.wallet.balance);
  const frozen = useApp((s) => s.wallet.frozen);
  const purchase = useApp((s) => s.purchase);
  const setFrozen = useApp((s) => s.setFrozen);

  const [issuedAt, setIssuedAt] = useState(() => now().getTime());
  const [token, setToken] = useState(() => newQrToken(student.id, issuedAt));
  const [clock, setClock] = useState(issuedAt);
  const [paid, setPaid] = useState<{ from: number; to: number } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const fade = useSharedValue(1);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useMaxBrightness(true);

  useEffect(() => {
    const id = setInterval(() => {
      const t = now().getTime();
      setClock(t);
      if (secondsLeft(issuedAt, t) === 0) {
        fade.value = 0;
        fade.value = withTiming(1, { duration: dur.base, easing: ease.base });
        setIssuedAt(t);
        setToken(newQrToken(student.id, t));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [issuedAt, student.id, fade]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const codeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const left = secondsLeft(issuedAt, clock);

  const simulateScan = () => {
    if (frozen) return;
    const from = balance;
    const r = purchase({ amount: DEMO_PRICE, title: DEMO_SHOP, nowMs: now().getTime() });
    if (!r.ok) {
      haptic.error();
      toast(r.reason === 'insufficient' ? 'ยอดเงินไม่พอ' : 'บัตรถูกอายัด', { kind: 'error' });
      return;
    }
    haptic.success();
    setPaid({ from, to: from - DEMO_PRICE });
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPaid(null), 1800);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="heading" center>
        แสดง QR นี้ที่ร้านค้า
      </Text>
      <Text variant="caption" tone="secondary" center>
        {`${student.firstName} ${student.lastName} · ${student.id}`}
      </Text>

      <Pressable
        onLongPress={simulateScan}
        delayLongPress={800}
        accessibilityRole="image"
        accessibilityLabel="QR สำหรับจ่ายเงิน"
        accessibilityHint="กดค้างเพื่อจำลองการจ่ายเงินที่ร้านค้า"
        style={[styles.frame, { backgroundColor: qr.paper }]}
      >
        <Animated.View style={codeStyle}>
          <QRCode value={token} size={CODE} color={qr.ink} backgroundColor={qr.paper} ecl="M" />
        </Animated.View>
        <BorderTrace width={FRAME} height={FRAME} radius={28} color={scheme === 'dark' ? c.success : c.primary} strokeWidth={3} mode="countdown" durationMs={QR_PERIOD_S * 1000} cycleKey={token} />

        {frozen ? (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <BlurView intensity={30} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(c.card, 0.6) }]} />
            <Icon icon={Lock} size={32} color={c.dangerText} />
            <Text variant="label" color={c.dangerText}>
              บัตรถูกอายัด
            </Text>
          </View>
        ) : null}

        {paid ? (
          <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: c.card }]}>
            <View style={styles.checkBox}>
              <Icon icon={Check} size={36} color={c.successText} strokeWidth={2.4} />
              <BorderTrace width={80} height={80} radius={40} color={c.success} strokeWidth={3} mode="once" />
            </View>
            <Text variant="heading">จ่ายเงินสำเร็จ</Text>
            <Text variant="data" size={20}>
              {`${formatBaht(-DEMO_PRICE)} · ${DEMO_SHOP}`}
            </Text>
            <NumberTicker value={paid.to} from={paid.from} format={formatBaht} size={14} color={c.textSecondary} />
          </View>
        ) : null}
      </Pressable>

      {frozen ? (
        <Button title="ยกเลิกอายัด" variant="primary" onPress={() => setConfirm(true)} style={styles.stretch} />
      ) : (
        <Text variant="label" tone="secondary" center accessibilityLiveRegion="polite">
          {`รหัสจะเปลี่ยนในอีก ${left} วินาที`}
        </Text>
      )}

      <View style={[styles.balance, { borderColor: c.hairline, backgroundColor: c.card }]}>
        <Text variant="label" tone="secondary">
          ยอดเงินคงเหลือ
        </Text>
        <Text variant="data" size={20}>
          {formatBaht(balance)}
        </Text>
      </View>
      <Text variant="caption" tone="secondary" center>
        เดโม: กดค้างที่ QR เพื่อจำลองการสแกนจ่ายที่ร้านค้า
      </Text>

      <ConfirmSheet
        visible={confirm}
        title="ยกเลิกอายัดบัตร?"
        body="บัตรจะกลับมาใช้จ่ายด้วย QR และบัตรได้ตามปกติ"
        confirmLabel="ยกเลิกอายัด"
        onConfirm={() => {
          setConfirm(false);
          setFrozen(false);
          haptic.success();
          toast('ยกเลิกอายัดแล้ว', { kind: 'success' });
        }}
        onCancel={() => setConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  frame: { width: FRAME, height: FRAME, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginVertical: 8 },
  overlay: { alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 28, padding: 16 },
  checkBox: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  balance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  stretch: { alignSelf: 'stretch' },
});

import { router } from 'expo-router';
import { Eye, Plus, ScanQrCode, Snowflake } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Aurora, FrostOverlay, PrismShimmer, RollingNumber } from '@/components/motion';
import { Button, GlassLayers, Icon, IconButton, Text } from '@/components/ui';
import { spentToday } from '@/data/selectors';
import { useApp } from '@/data/store';
import { formatBaht } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The glossy balance card: pastel light pools inside the glass, a pearly sheen,
 * digits that roll into place, and frost with falling snow while frozen.
 * Reused on Home, Wallet and QR.
 */
export function BalanceCard({
  size = 'md',
  showActions = true,
  onDetails,
}: {
  size?: 'md' | 'lg';
  showActions?: boolean;
  /** Shows the eye button that opens card details. */
  onDetails?: () => void;
}) {
  const { c, feature, radius, elevation } = useTheme();
  const wallet = useApp((s) => s.wallet);
  const t = useNow();
  const spent = useMemo(() => spentToday(wallet.transactions, t), [wallet.transactions, t]);
  const orbs = useMemo(
    () => [
      // Light pools stay along the right edge so the text column sits on calm glass.
      { color: feature.wallet.glow, x: 1.02, y: 0.02, r: 0.4, opacity: 0.7 },
      { color: feature.attendance.glow, x: 1.06, y: 0.78, r: 0.34, opacity: 0.55 },
    ],
    [feature],
  );

  return (
    <View style={[styles.card, { borderRadius: radius.tile, boxShadow: elevation.high }]}>
      <GlassLayers radius={radius.tile} gloss={false} />
      <Aurora orbs={orbs} style={{ borderRadius: radius.tile }} />
      <GlassLayers radius={radius.tile} tint="transparent" />
      <PrismShimmer radius={radius.tile} intensity={0.1} />
      {wallet.frozen ? <FrostOverlay radius={radius.tile} /> : null}

      <View
        accessible
        accessibilityLabel={`ยอดเงินคงเหลือ ${formatBaht(wallet.balance)} ใช้ไปวันนี้ ${formatBaht(spent)}${wallet.frozen ? ' บัตรถูกอายัด จ่ายเงินไม่ได้ชั่วคราว' : ''}`}
      >
        <View style={[styles.top, onDetails ? styles.roomForEye : null]}>
          <Text variant="label" tone="secondary" style={styles.flex}>
            ยอดเงินคงเหลือ
          </Text>
          {wallet.frozen ? (
            <View style={[styles.frozen, { borderColor: c.glassBorder }]}>
              <GlassLayers radius={999} tint={c.glassStrong} gloss={false} rim={false} />
              <Icon icon={Snowflake} size={14} />
              <Text variant="caption">อายัดอยู่</Text>
            </View>
          ) : null}
        </View>
        <RollingNumber value={wallet.balance} from={0} format={formatBaht} size={size === 'lg' ? 48 : 42} style={styles.amount} />
        <Text variant="caption" tone="secondary">
          {wallet.frozen ? `ใช้ไปวันนี้ ${formatBaht(spent)} · จ่ายเงินไม่ได้ชั่วคราว` : `ใช้ไปวันนี้ ${formatBaht(spent)}`}
        </Text>
      </View>

      {onDetails ? (
        <View style={styles.details}>
          <IconButton icon={Eye} label="รายละเอียดบัตร" onPress={onDetails} />
        </View>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          <Button title="เติมเงิน" variant="primary" icon={Plus} onPress={() => router.push('/topup')} style={styles.flex} />
          <Button title="สแกน QR" icon={ScanQrCode} onPress={() => router.push('/qr')} style={styles.flex} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 28 },
  roomForEye: { paddingRight: 52 },
  amount: { marginTop: 4, marginBottom: 2 },
  frozen: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, paddingVertical: 3, paddingHorizontal: 10, overflow: 'hidden' },
  details: { position: 'absolute', top: 14, right: 14 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  flex: { flex: 1 },
});

import { router } from 'expo-router';
import { Lock, LockOpen, Plus, QrCode, Receipt } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion';
import { ConfirmSheet, Icon, Text, toast, type LucideIcon } from '@/components/ui';
import { useApp } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

function Action({ icon, label, onPress, tint }: { icon: LucideIcon; label: string; onPress: () => void; tint?: string }) {
  const { c } = useTheme();
  return (
    <PressableScale accessibilityLabel={label} haptic="selection" onPress={onPress} style={styles.action}>
      <View
        style={[
          styles.circle,
          { backgroundColor: tint ? withAlpha(tint, 0.12) : c.card, borderColor: tint ? withAlpha(tint, 0.4) : c.hairline },
        ]}
      >
        <Icon icon={icon} size={24} color={tint ?? c.text} />
      </View>
      <Text variant="caption" center numberOfLines={1} color={tint}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** Four wallet actions; freeze/unfreeze goes through a confirmation sheet. */
export function WalletActions() {
  const { c } = useTheme();
  const frozen = useApp((s) => s.wallet.frozen);
  const setFrozen = useApp((s) => s.setFrozen);
  const [confirm, setConfirm] = useState(false);

  const apply = () => {
    setConfirm(false);
    setFrozen(!frozen);
    haptic.success();
    toast(frozen ? 'ยกเลิกอายัดแล้ว' : 'อายัดบัตรแล้ว', { kind: 'success' });
  };

  return (
    <>
      <View style={styles.row}>
        <Action icon={Plus} label="เติมเงิน" onPress={() => router.push('/topup')} />
        <Action icon={QrCode} label="จ่าย QR" onPress={() => router.push('/qr')} />
        <Action
          icon={frozen ? LockOpen : Lock}
          label={frozen ? 'ยกเลิกอายัด' : 'อายัดบัตร'}
          tint={frozen ? c.dangerText : undefined}
          onPress={() => setConfirm(true)}
        />
        <Action icon={Receipt} label="ตรวจสอบสลิป" onPress={() => router.push('/slip-check')} />
      </View>
      <ConfirmSheet
        visible={confirm}
        title={frozen ? 'ยกเลิกอายัดบัตร?' : 'อายัดบัตร?'}
        body={
          frozen
            ? 'บัตรจะกลับมาใช้จ่ายด้วย QR และบัตรได้ตามปกติ'
            : 'ระหว่างอายัด จะจ่ายเงินด้วย QR หรือบัตรไม่ได้ ยอดเงินยังอยู่ครบ ยกเลิกอายัดได้ทุกเมื่อ'
        }
        confirmLabel={frozen ? 'ยกเลิกอายัด' : 'อายัดบัตร'}
        destructive={!frozen}
        onConfirm={apply}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: 8, width: 78 },
  circle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

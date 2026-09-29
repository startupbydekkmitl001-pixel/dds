import { Receipt } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { EmptyState, LoadGate, Screen, ScreenHeader, Skeleton, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { useResource } from '@/data/useResource';
import { TransferCard } from '@/features/wallet/TransferCard';
import { now } from '@/lib/clock';
import { haptic } from '@/lib/haptics';

const CHECK_MS = 1200;

/** Legacy "ตรวจสอบการเติมเงิน": match a bank transfer to your slip, once. */
export default function SlipCheck() {
  const res = useResource('transfers');
  const transfers = useApp((s) => s.wallet.transfers);
  const claimTransfer = useApp((s) => s.claimTransfer);
  const [checking, setChecking] = useState<string | null>(null);

  const check = (id: string) => {
    if (checking) return;
    setChecking(id);
    setTimeout(() => {
      const ok = claimTransfer(id, now().getTime());
      setChecking(null);
      // The top-up alert raised by the store announces the credit as a toast (AlertToaster).
      if (ok) haptic.success();
    }, CHECK_MS);
  };

  return (
    <Screen
      title="ตรวจสอบการเติมเงิน"
      back
      header={<ScreenHeader back title="ตรวจสอบการเติมเงิน" />}
      onRefresh={res.refresh}
      refreshing={res.refreshing}
    >
      <View style={styles.help}>
        <Text variant="body" tone="secondary">
          เลือกรายการโอนที่ตรงกับสลิปของคุณ แล้วกดตรวจสอบ
        </Text>
        <Text variant="caption" tone="secondary">
          ไม่พบรายการ? ลองเลือกรายการในเวลาใกล้เคียง หรือรอ 3–5 นาทีแล้วรีเฟรช
        </Text>
      </View>
      <LoadGate
        status={res.status}
        retry={res.retry}
        skeleton={
          <View style={styles.stack}>
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </View>
        }
      >
        {transfers.length === 0 ? (
          <EmptyState feature="wallet" icon={Receipt} title="ไม่มีรายการโอนใน 7 วันที่ผ่านมา" body="รายการโอนจะแสดงที่นี่ภายในไม่กี่นาทีหลังโอน" />
        ) : (
          <View style={styles.stack}>
            {transfers.map((t, i) => (
              <StaggerIn key={t.id} index={i}>
                <TransferCard transfer={t} checking={checking === t.id} onCheck={() => check(t.id)} />
              </StaggerIn>
            ))}
          </View>
        )}
      </LoadGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { gap: 6, marginBottom: 16 },
  stack: { gap: 12 },
});

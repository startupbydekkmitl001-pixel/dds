import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Screen, Segmented } from '@/components/ui';
import { PayQR } from '@/features/qr/PayQR';
import { ScanQR } from '@/features/qr/ScanQR';

/** Spec §5.4 — pay with your QR, or scan one. Swipe down to close (iOS modal). */
export default function QrModal() {
  const [tab, setTab] = useState<'pay' | 'scan'>('pay');
  return (
    <Screen>
      <View style={styles.bar}>
        <Segmented
          options={[
            { value: 'pay', label: 'จ่ายเงิน' },
            { value: 'scan', label: 'สแกน' },
          ]}
          value={tab}
          onChange={setTab}
          style={styles.flex}
        />
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      {tab === 'pay' ? <PayQR /> : <ScanQR />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  flex: { flex: 1 },
});

import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { ScanQR } from '@/features/qr/ScanQR';

/** Spec §5.4 — scan a QR code. Swipe down to close (iOS modal). */
export default function QrModal() {
  return (
    <Screen title="สแกน QR" header={<ScreenHeader eyebrow="QR" title="สแกน QR" right={<IconButton icon={X} label="ปิด" onPress={() => router.back()} />} />}>
      <ScanQR />
    </Screen>
  );
}

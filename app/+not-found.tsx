import { router } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <EmptyState icon={Compass} title="ไม่พบหน้านี้" body="ลิงก์อาจไม่ถูกต้องหรือหน้านี้ถูกย้ายแล้ว" actionLabel="กลับหน้าหลัก" onAction={() => router.replace('/')} />
    </Screen>
  );
}

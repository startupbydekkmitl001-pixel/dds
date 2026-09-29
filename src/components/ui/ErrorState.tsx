import { CloudOff } from 'lucide-react-native';
import { EmptyState } from './EmptyState';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={CloudOff}
      title="โหลดข้อมูลไม่สำเร็จ"
      body="ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง"
      actionLabel="ลองอีกครั้ง"
      onAction={onRetry}
    />
  );
}

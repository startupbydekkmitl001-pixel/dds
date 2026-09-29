import { Button, Screen, ScreenHeader } from '@/components/ui';
import { useApp } from '@/data/store';

export default function PinStub() {
  const unlock = useApp((s) => s.unlock);
  return (
    <Screen header={<ScreenHeader title="Dschool" />}>
      <Button title="เข้าสู่ระบบ" variant="primary" onPress={unlock} />
    </Screen>
  );
}

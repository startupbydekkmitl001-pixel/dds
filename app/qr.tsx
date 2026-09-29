import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { View } from 'react-native';
import { IconButton, Screen, Text } from '@/components/ui';

export default function QrModal() {
  return (
    <Screen scroll={false}>
      <View style={{ alignItems: 'flex-end' }}>
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      <Text variant="title">QR</Text>
    </Screen>
  );
}

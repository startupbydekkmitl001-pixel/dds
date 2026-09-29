import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion';
import { Button, Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

/** Step ③ — pick the slip photo (or the demo slip). */
export function SlipStep({ onPicked }: { onPicked: (uri: string) => void }) {
  const { c, radius } = useTheme();

  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!r.canceled && r.assets[0]) onPicked(r.assets[0].uri);
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text variant="title">ส่งสลิปการโอน</Text>
        <Text variant="body" tone="secondary">
          ระบบจะตรวจสอบสลิปและเติมเงินให้อัตโนมัติ
        </Text>
      </View>

      <PressableScale
        accessibilityLabel="เลือกรูปสลิปจากอัลบั้ม"
        onPress={pick}
        style={[styles.drop, { borderColor: c.textSecondary, borderRadius: radius.tile, backgroundColor: c.card }]}
      >
        <Icon icon={ImagePlus} size={32} color={c.textSecondary} />
        <Text variant="label" tone="secondary">
          แตะเพื่อเลือกรูปสลิปจากอัลบั้ม
        </Text>
      </PressableScale>

      <Text variant="caption" tone="secondary">
        ถ้าระบบยังไม่พบรายการโอน เราจะตรวจสอบซ้ำให้อัตโนมัติและแจ้งเตือนเมื่อเสร็จ
      </Text>

      <Button title="เลือกรูปสลิป" variant="primary" icon={ImagePlus} onPress={pick} />
      <Button title="ใช้สลิปตัวอย่าง (เดโม)" variant="ghost" onPress={() => onPicked('demo://slip')} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  drop: { height: 180, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 10 },
});

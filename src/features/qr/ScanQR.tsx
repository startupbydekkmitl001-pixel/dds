import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Camera, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Button, Card, EmptyState, Text } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isWeb } from '@/lib/platform';
import { ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { qr } from '@/theme/tokens';

const VIEW = 260;
const ARM = 34;

/** Four breathing corner brackets over the camera. */
function Viewfinder() {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!reduced) pulse.value = withRepeat(withTiming(0.45, { duration: 900, easing: ease.slow }), -1, true);
  }, [reduced, pulse]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const corner = { position: 'absolute' as const, width: ARM, height: ARM };
  const stroke = { borderColor: qr.paper };
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={[corner, stroke, styles.tl]} />
      <View style={[corner, stroke, styles.tr]} />
      <View style={[corner, stroke, styles.bl]} />
      <View style={[corner, stroke, styles.br]} />
    </Animated.View>
  );
}

function Scanner() {
  const { radius } = useTheme();
  const [permission, request] = useCameraPermissions();
  const [result, setResult] = useState<string | null>(null);

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <EmptyState
        feature="wallet"
        icon={Camera}
        title="อนุญาตให้ใช้กล้องเพื่อสแกน QR"
        body="ใช้กล้องเฉพาะตอนสแกนเท่านั้น"
        actionLabel="อนุญาต"
        onAction={() => void request()}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.camera, { borderRadius: radius.tile }]}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            result
              ? undefined
              : ({ data }) => {
                  haptic.success();
                  setResult(data);
                }
          }
        />
        <Viewfinder />
      </View>
      {result ? (
        <Card style={styles.result}>
          <Text variant="label" tone="secondary">
            ข้อมูลใน QR
          </Text>
          <Text variant="data" size={14} selectable>
            {result}
          </Text>
          <View style={styles.actions}>
            <Button title="สแกนอีกครั้ง" onPress={() => setResult(null)} style={styles.flex} />
            <Button title="เสร็จ" variant="primary" onPress={() => router.back()} style={styles.flex} />
          </View>
        </Card>
      ) : (
        <Text variant="body" tone="secondary" center>
          เล็ง QR ให้อยู่ในกรอบ ระบบจะสแกนให้อัตโนมัติ
        </Text>
      )}
    </View>
  );
}

/** Camera QR scanning (native); a friendly pointer to the phone on web. */
export function ScanQR() {
  if (isWeb) {
    return <EmptyState feature="wallet" icon={Smartphone} title="ใช้กล้องได้บนมือถือ" body="เปิดแอปบน iPhone เพื่อสแกน QR ด้วยกล้อง" />;
  }
  return <Scanner />;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 16 },
  camera: { width: VIEW, height: VIEW, overflow: 'hidden' },
  tl: { top: 16, left: 16, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: 16, right: 16, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: 16, left: 16, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: 16, right: 16, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  result: { alignSelf: 'stretch', gap: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  flex: { flex: 1 },
});

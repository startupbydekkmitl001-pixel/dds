import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { PrismShimmer } from '@/components/motion';
import { Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { qr } from '@/theme/tokens';
import { MonogramAvatar } from './MonogramAvatar';

/** Digital student card: prism sheen that follows tilt, tap to flip to the QR back. */
export function StudentCard() {
  const { c, radius } = useTheme();
  const reduced = useReducedMotion();
  const student = useApp((s) => s.student);
  const { width: screen } = useWindowDimensions();
  const width = Math.min(screen - 40, 420);
  const height = Math.round((width * 2) / 3);
  const [back, setBack] = useState(false);
  const flip = useSharedValue(0);

  const toggle = () => {
    haptic.light();
    const next = !back;
    setBack(next);
    flip.value = withTiming(next ? 1 : 0, { duration: reduced ? dur.fast : dur.base * 1.4, easing: ease.base });
  };

  const front = useAnimatedStyle(() =>
    reduced
      ? { opacity: 1 - flip.value }
      : { transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }] },
  );
  const rear = useAnimatedStyle(() =>
    reduced
      ? { opacity: flip.value }
      : { transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }] },
  );

  const face = [styles.face, { width, height, borderRadius: radius.tile, backgroundColor: c.idCardBg }];

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={`บัตรนักเรียน ${student.firstName} ${student.lastName} ชั้น ${student.classroom} รหัส ${student.id}`}
      accessibilityHint="แตะเพื่อพลิกบัตร"
      style={{ width, height, alignSelf: 'center' }}
    >
      <Animated.View style={[face, front]} pointerEvents="none">
        <PrismShimmer radius={radius.tile} intensity={0.22} />
        <View style={styles.row}>
          <Text variant="eyebrow" color={c.idCardText}>
            DSCHOOL · STUDENT ID
          </Text>
          <Text variant="caption" color={c.idCardText}>
            {`ปีการศึกษา ${student.academicYear}`}
          </Text>
        </View>
        <View style={styles.identity}>
          <MonogramAvatar name={student.firstName} size={64} />
          <View style={styles.flex}>
            <Text variant="heading" color={c.idCardText} numberOfLines={1}>
              {`${student.firstName} ${student.lastName}`}
            </Text>
            <Text variant="body" color={c.idCardText}>
              {student.classroom}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text variant="data" size={18} color={c.idCardText}>
            {`รหัส ${student.id}`}
          </Text>
          <Text variant="caption" color={c.idCardText} numberOfLines={1} style={styles.school}>
            {student.school}
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[face, styles.backFace, rear]} pointerEvents="none">
        <View style={[styles.qrBox, { backgroundColor: qr.paper }]}>
          <QRCode value={`STUDENT:${student.id}`} size={Math.round(height * 0.5)} color={qr.ink} backgroundColor={qr.paper} />
        </View>
        <View style={styles.flex}>
          <Text variant="label" color={c.idCardText}>
            {`ปีการศึกษา ${student.academicYear}`}
          </Text>
          <Text variant="caption" color={c.idCardText}>
            {student.school}
          </Text>
          <Text variant="caption" color={c.idCardText} style={styles.note}>
            หากพบบัตรนี้ กรุณาส่งคืนโรงเรียน
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { position: 'absolute', top: 0, left: 0, padding: 20, justifyContent: 'space-between', overflow: 'hidden', backfaceVisibility: 'hidden' },
  backFace: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  school: { flexShrink: 1, textAlign: 'right' },
  qrBox: { padding: 10, borderRadius: 14 },
  note: { marginTop: 8 },
});

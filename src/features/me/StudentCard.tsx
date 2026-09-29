import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path } from 'react-native-svg';
import { Aurora, PrismShimmer } from '@/components/motion';
import { GlassLayers, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { qr, white } from '@/theme/tokens';
import { MonogramAvatar } from './MonogramAvatar';
import { SchoolSeal } from './SchoolSeal';

/** Fine engraved contour lines, like a guilloché on a security card. */
function contours(w: number, h: number): string {
  const lines: string[] = [];
  for (let k = 0; k < 9; k++) {
    const y0 = h * (0.2 + k * 0.085);
    const a = h * (0.05 + k * 0.006);
    lines.push(`M 0 ${y0} C ${w * 0.3} ${y0 - a * 2}, ${w * 0.55} ${y0 + a * 2.4}, ${w} ${y0 - a}`);
  }
  return lines.join(' ');
}

/**
 * Digital student pass: pastel holographic glass, pearly sheen that follows tilt, tap to flip to the QR back.
 * The school's animated seal sits top-left on the front and above the return note on the back; only the
 * face that is showing plays it.
 */
export function StudentCard() {
  const { c, feature, radius, elevation } = useTheme();
  const reduced = useReducedMotion();
  const student = useApp((s) => s.student);
  const { width: screen } = useWindowDimensions();
  const width = Math.min(screen - 40, 420);
  const height = Math.round((width * 2) / 3);
  const seal = Math.min(68, Math.max(52, Math.round(width * 0.17)));
  const [back, setBack] = useState(false);
  const flip = useSharedValue(0);
  const lines = useMemo(() => contours(width, height), [width, height]);

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

  const face = [styles.face, { width, height, borderRadius: radius.tile, boxShadow: elevation.high }];
  const surface = (
    <>
      <LinearGradient colors={c.idCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: radius.tile }]} />
      <Aurora
        drift={false}
        style={{ borderRadius: radius.tile }}
        orbs={[
          { color: feature.wallet.glow, x: 1, y: 0.05, r: 0.36, opacity: 0.45 },
          { color: feature.attendance.glow, x: 0.05, y: 1, r: 0.4, opacity: 0.4 },
        ]}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={lines} stroke={c.idCardText} strokeOpacity={0.07} strokeWidth={1} fill="none" />
      </Svg>
      <GlassLayers radius={radius.tile} tint="transparent" />
    </>
  );

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={`บัตรนักเรียน ${student.firstName} ${student.lastName} ชั้น ${student.classroom} รหัส ${student.id} ${student.school}`}
      accessibilityHint="แตะเพื่อพลิกบัตร"
      style={{ width, height, alignSelf: 'center' }}
    >
      <Animated.View style={[face, front]} pointerEvents="none">
        {surface}
        <PrismShimmer radius={radius.tile} intensity={0.16} />
        <View style={styles.header}>
          <SchoolSeal size={seal} active={!back} />
          <View style={styles.flex}>
            <Text variant="heading" size={18} color={c.idCardText} numberOfLines={1}>
              {student.school}
            </Text>
            <Text variant="eyebrow" color={c.idCardText}>
              DSCHOOL · STUDENT ID
            </Text>
          </View>
        </View>
        <View style={styles.identity}>
          <View style={[styles.avatarRing, { borderColor: white }]}>
            <MonogramAvatar name={student.firstName} size={60} />
          </View>
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
          <Text variant="caption" color={c.idCardText}>
            {`ปีการศึกษา ${student.academicYear}`}
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[face, styles.backFace, rear]} pointerEvents="none">
        {surface}
        <View style={[styles.qrBox, { backgroundColor: qr.paper, boxShadow: elevation.low }]}>
          <QRCode value={`STUDENT:${student.id}`} size={Math.round(height * 0.5)} color={qr.ink} backgroundColor={qr.paper} />
        </View>
        <View style={styles.flex}>
          <View style={styles.backSeal}>
            <SchoolSeal size={44} active={back} />
          </View>
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
  face: { position: 'absolute', top: 0, left: 0, padding: 20, justifyContent: 'space-between', backfaceVisibility: 'hidden' },
  backFace: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backSeal: { marginBottom: 10 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: { borderRadius: 40, borderWidth: 2, padding: 2 },
  flex: { flex: 1 },
  qrBox: { padding: 10, borderRadius: 16 },
  note: { marginTop: 8 },
});

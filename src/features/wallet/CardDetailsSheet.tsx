import * as Clipboard from 'expo-clipboard';
import { Check, Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PressableScale } from '@/components/motion';
import { GlassLayers, GlassSheet, Icon, IconButton, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';

function mask(id: string): string {
  return `•••• ${id.slice(-4)}`;
}

/** A small glass pill that confirms in place ("คัดลอกแล้ว") instead of a toast behind the sheet. */
function CopyPill({ label, value }: { label: string; value: string }) {
  const { c } = useTheme();
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    let ok = false;
    try {
      ok = await Clipboard.setStringAsync(value);
    } catch {
      ok = false;
    }
    if (ok) haptic.success();
    else haptic.error();
    setState(ok ? 'done' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1600);
  };

  return (
    <PressableScale
      accessibilityLabel={`คัดลอก${label}`}
      accessibilityHint={state === 'done' ? 'คัดลอกแล้ว' : undefined}
      haptic="selection"
      onPress={copy}
      style={styles.pill}
    >
      <GlassLayers radius={18} tint={state === 'done' ? c.secondary : undefined} />
      {state === 'done' ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.pillRow}>
          <Icon icon={Check} size={14} color={c.successText} />
          <Text variant="label" color={c.successText}>
            คัดลอกแล้ว
          </Text>
        </Animated.View>
      ) : (
        <Text variant="label" color={state === 'failed' ? c.dangerText : undefined} accessibilityLiveRegion="polite">
          {state === 'failed' ? 'ไม่สำเร็จ' : 'คัดลอก'}
        </Text>
      )}
    </PressableScale>
  );
}

function Row({ label, value, shown, children }: { label: string; value: string; shown?: string; children?: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.flex} accessible accessibilityLabel={`${label} ${shown ?? value}`}>
        <Text variant="caption" tone="secondary">
          {label}
        </Text>
        <Text variant="data" size={17} numberOfLines={1}>
          {shown ?? value}
        </Text>
      </View>
      {children}
    </View>
  );
}

/**
 * Card details, after the microinteraction reference: the wallet blurs back,
 * a glass sheet rises with the holder and card numbers, each copyable in place.
 * The student ID starts masked every time the sheet opens.
 */
export function CardDetailsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const student = useApp((s) => s.student);
  const frozen = useApp((s) => s.wallet.frozen);
  const [reveal, setReveal] = useState(false);
  // Re-mask as the sheet starts to close, so the ID is hidden again next time it opens.
  const close = () => {
    setReveal(false);
    onClose();
  };

  const name = `${student.firstName} ${student.lastName}`;
  return (
    <GlassSheet visible={visible} onClose={close}>
      <Text variant="heading" accessibilityRole="header">
        รายละเอียดบัตร
      </Text>
      <View style={styles.list}>
        <Row label="ชื่อผู้ถือบัตร" value={name}>
          <CopyPill label="ชื่อผู้ถือบัตร" value={name} />
        </Row>
        <View style={[styles.sep, { backgroundColor: c.hairline }]} />
        <Row label="รหัสนักเรียน" value={student.id} shown={reveal ? student.id : mask(student.id)}>
          <IconButton
            icon={reveal ? EyeOff : Eye}
            label={reveal ? 'ซ่อนรหัสนักเรียน' : 'แสดงรหัสนักเรียน'}
            tone="plain"
            onPress={() => setReveal((r) => !r)}
          />
          <CopyPill label="รหัสนักเรียน" value={student.id} />
        </Row>
        <View style={[styles.sep, { backgroundColor: c.hairline }]} />
        <Row label="สถานะบัตร" value={frozen ? 'อายัดอยู่ · จ่ายเงินไม่ได้ชั่วคราว' : 'ใช้งานได้'} />
        <View style={[styles.sep, { backgroundColor: c.hairline }]} />
        <Row label="โรงเรียน" value={student.school} />
      </View>
    </GlassSheet>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  sep: { height: StyleSheet.hairlineWidth },
  flex: { flex: 1, gap: 2 },
  pill: { height: 36, minWidth: 78, borderRadius: 18, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

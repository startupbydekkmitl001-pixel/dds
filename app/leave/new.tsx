import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Check, ImagePlus, Stethoscope, Trash2, Users, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { BorderTrace } from '@/components/motion';
import { Button, Card, Chip, Icon, IconButton, Screen, Text, toast } from '@/components/ui';
import { SEMESTERS } from '@/data/calendar';
import { useApp } from '@/data/store';
import type { LeaveType } from '@/data/types';
import { DateRangePicker } from '@/features/leave/DateRangePicker';
import { currentSemesterId } from '@/lib/attendance';
import { now, toISODate } from '@/lib/clock';
import { haptic } from '@/lib/haptics';
import { newId } from '@/lib/id';
import { validateLeave } from '@/lib/leave';
import { useTheme } from '@/theme/ThemeProvider';
import { typeScale } from '@/theme/typography';

const REASON_MAX = 300;

function FieldError({ text }: { text?: string }) {
  const { c } = useTheme();
  if (!text) return null;
  return (
    <Text variant="caption" color={c.dangerText} accessibilityRole="alert">
      {text}
    </Text>
  );
}

/** Spec §5.5 — leave request form with inline validation. */
export default function NewLeave() {
  const { c, radius } = useTheme();
  const submitLeave = useApp((s) => s.submitLeave);
  const networkErrors = useApp((s) => s.settings.demo.networkErrors);
  const clientId = useRef(newId('lvc')).current;
  const semester = SEMESTERS[currentSemesterId(toISODate(now()))];

  const [type, setType] = useState<LeaveType | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ type?: string; dates?: string; reason?: string }>({});
  const [sentId, setSentId] = useState<string | null>(null);

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!r.canceled && r.assets[0]) setPhotoUri(r.assets[0].uri);
  };

  const submit = () => {
    const input = { type, start, end: end ?? start, reason };
    const found = validateLeave(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      haptic.error();
      return;
    }
    if (networkErrors) {
      toast('ทำรายการไม่สำเร็จ ลองอีกครั้ง', { kind: 'error' });
      return;
    }
    const lv = submitLeave({
      clientId,
      type: type as LeaveType,
      start: start as string,
      end: (end ?? start) as string,
      reason: reason.trim(),
      photoUri,
      nowMs: now().getTime(),
    });
    haptic.success();
    setSentId(lv.id);
  };

  if (sentId) {
    return (
      <Screen scroll={false}>
        <View style={styles.sent}>
          <View style={styles.checkBox}>
            <Icon icon={Check} size={40} color={c.successText} strokeWidth={2.4} />
            <BorderTrace width={96} height={96} radius={48} color={c.success} strokeWidth={3} mode="once" durationMs={900} onDone={() => router.replace(`/leave/${sentId}`)} />
          </View>
          <Text variant="title" center>
            ส่งใบลาแล้ว
          </Text>
          <Text variant="body" tone="secondary" center>
            ครูที่ปรึกษาจะได้รับแจ้งทันที
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.bar}>
        <Text variant="title" accessibilityRole="header">
          ยื่นใบลา
        </Text>
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>

      <View style={styles.section}>
        <Text variant="label">ประเภทการลา</Text>
        <View style={styles.chips}>
          <Chip label="ลาป่วย" icon={Stethoscope} selected={type === 'sick'} onPress={() => setType('sick')} />
          <Chip label="ลากิจ" icon={Users} selected={type === 'personal'} onPress={() => setType('personal')} />
        </View>
        <FieldError text={errors.type} />
      </View>

      <View style={styles.section}>
        <Text variant="label">วันที่ลา</Text>
        <Card>
          <DateRangePicker
            semester={semester}
            start={start}
            end={end}
            onChange={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
          />
        </Card>
        <FieldError text={errors.dates} />
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text variant="label">เหตุผล</Text>
          <Text variant="caption" tone="secondary">
            {`${[...reason].length}/${REASON_MAX}`}
          </Text>
        </View>
        <TextInput
          value={reason}
          onChangeText={(v) => setReason([...v].slice(0, REASON_MAX).join(''))}
          placeholder="เช่น มีไข้ ไปพบแพทย์"
          placeholderTextColor={c.textSecondary}
          multiline
          accessibilityLabel="เหตุผลการลา"
          style={[
            typeScale.body,
            styles.input,
            { color: c.text, backgroundColor: c.card, borderColor: errors.reason ? c.dangerText : c.hairline, borderRadius: radius.input },
          ]}
        />
        <FieldError text={errors.reason} />
      </View>

      <View style={styles.section}>
        <Text variant="label">แนบรูป (ไม่บังคับ)</Text>
        {photoUri ? (
          <View style={styles.photoRow}>
            <Image source={{ uri: photoUri }} style={[styles.photo, { borderRadius: radius.input }]} accessibilityLabel="รูปที่แนบ" />
            <Button title="ลบรูป" variant="ghost" icon={Trash2} destructive size="sm" onPress={() => setPhotoUri(null)} />
          </View>
        ) : (
          <Button title="เลือกรูป เช่น ใบรับรองแพทย์" icon={ImagePlus} onPress={pickPhoto} />
        )}
      </View>

      <Button title="ส่งใบลา" variant="primary" onPress={submit} style={styles.submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  section: { gap: 8, marginBottom: 20 },
  chips: { flexDirection: 'row', gap: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { minHeight: 110, borderWidth: 1, padding: 14, textAlignVertical: 'top' },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 72, height: 72 },
  submit: { marginTop: 4 },
  sent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  checkBox: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});

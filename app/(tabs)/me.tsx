import { router } from 'expo-router';
import { ClipboardList, Settings, ShieldCheck, UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Card, ListRow, Screen, ScreenHeader, Text } from '@/components/ui';
import { behaviorScore, dueAssessments } from '@/data/selectors';
import { useApp } from '@/data/store';
import { StudentCard } from '@/features/me/StudentCard';
import { useTheme } from '@/theme/ThemeProvider';

/** Spec §5.6 — the student's own space. */
export default function MeScreen() {
  const { c, feature } = useTheme();
  const behavior = useApp((s) => s.behavior);
  const assessments = useApp((s) => s.assessments);
  const due = dueAssessments(assessments);

  return (
    <Screen title="ฉัน" header={<ScreenHeader eyebrow="นักเรียน" title="ฉัน" />}>
      <StaggerIn index={0}>
        <StudentCard />
      </StaggerIn>
      <Text variant="caption" tone="secondary" center style={styles.hint}>
        แตะบัตรเพื่อพลิกดู QR ประจำตัว
      </Text>
      <StaggerIn index={1}>
        <Card padded={false}>
          <ListRow
            icon={ShieldCheck}
            iconBg={feature.behavior.fill}
            iconColor={feature.behavior.ink}
            title="พฤติกรรม"
            value={`${behaviorScore(behavior)} คะแนน`}
            onPress={() => router.push('/behavior')}
          />
          <ListRow
            icon={ClipboardList}
            iconBg={feature.assessments.fill}
            iconColor={feature.assessments.ink}
            title="แบบประเมิน"
            value={due > 0 ? `ต้องทำ ${due}` : 'ครบแล้ว'}
            onPress={() => router.push('/assessments')}
          />
        </Card>
      </StaggerIn>
      <View style={styles.gap} />
      <StaggerIn index={2}>
        <Card padded={false}>
          <ListRow icon={UserRound} title="ข้อมูลส่วนตัว" onPress={() => router.push('/profile')} iconColor={c.text} />
          <ListRow icon={Settings} title="ตั้งค่า" onPress={() => router.push('/settings')} iconColor={c.text} />
        </Card>
      </StaggerIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 10, marginBottom: 20 },
  gap: { height: 12 },
});

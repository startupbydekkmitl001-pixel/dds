import { router } from 'expo-router';
import { CircleCheck, ClipboardList } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Button, Card, EmptyState, Icon, Screen, ScreenHeader, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { thaiDate } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** Spec §5.8 — assessment list with status. */
export default function AssessmentsList() {
  const { c, feature } = useTheme();
  const assessments = useApp((s) => s.assessments);
  const firstDue = assessments.findIndex((a) => a.completedAt === null);

  return (
    <Screen title="แบบประเมิน" back header={<ScreenHeader back eyebrow="ดูแลใจตัวเอง" title="แบบประเมิน" />}>
      {assessments.length === 0 ? (
        <EmptyState feature="assessments" icon={ClipboardList} title="ยังไม่มีแบบประเมิน" body="ครูแนะแนวจะส่งแบบประเมินมาที่นี่" />
      ) : (
        <View style={styles.stack}>
          {assessments.map((a, i) => {
            const done = a.completedAt !== null;
            return (
              <StaggerIn key={a.id} index={i}>
                <Card style={styles.card}>
                  <View style={styles.head}>
                    <View style={[styles.icon, { backgroundColor: feature.assessments.fill }]}>
                      <Icon icon={ClipboardList} size={20} color={feature.assessments.ink} />
                    </View>
                    <View style={styles.flex}>
                      <Text variant="heading">{a.title}</Text>
                      <Text variant="caption" tone="secondary">
                        {`${a.questions.length} ข้อ`}
                      </Text>
                    </View>
                  </View>
                  <Text variant="body" tone="secondary">
                    {a.description}
                  </Text>
                  <View style={styles.status}>
                    {done ? <Icon icon={CircleCheck} size={16} color={c.successText} /> : null}
                    <Text variant="label" color={done ? c.successText : c.textSecondary}>
                      {done ? `ทำแล้ว · ${thaiDate(new Date(a.completedAt as string), 'short')}` : 'ยังไม่ทำ'}
                    </Text>
                  </View>
                  <Button
                    title={done ? 'ทำอีกครั้ง' : 'เริ่มทำ'}
                    variant={i === firstDue ? 'primary' : 'secondary'}
                    onPress={() => router.push(`/assessments/${a.id}`)}
                  />
                </Card>
              </StaggerIn>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  card: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

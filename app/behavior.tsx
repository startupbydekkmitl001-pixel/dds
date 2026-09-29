import { HandHeart, Lightbulb, ShieldCheck, Trophy, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Card, EmptyState, Icon, LoadGate, Screen, ScreenHeader, Skeleton, Text, type LucideIcon } from '@/components/ui';
import { behaviorScore } from '@/data/selectors';
import { useApp } from '@/data/store';
import { useResource } from '@/data/useResource';
import { BehaviorTimeline } from '@/features/behavior/BehaviorTimeline';
import { ScoreGauge } from '@/features/behavior/ScoreGauge';
import { useTheme } from '@/theme/ThemeProvider';

const TIPS: [LucideIcon, string][] = [
  [HandHeart, 'ช่วยงานจิตอาสาของโรงเรียน'],
  [Trophy, 'เป็นตัวแทนโรงเรียนร่วมกิจกรรม'],
  [Users, 'ช่วยเหลือเพื่อนและครู'],
];

/** Spec §5.7 — behaviour score, history, and how to earn points. */
export default function BehaviorScreen() {
  const { feature } = useTheme();
  const res = useResource('behavior');
  const events = useApp((s) => s.behavior);

  return (
    <Screen title="พฤติกรรม" back header={<ScreenHeader back eyebrow="คะแนนความประพฤติ" title="พฤติกรรม" />} onRefresh={res.refresh} refreshing={res.refreshing}>
      <LoadGate
        status={res.status}
        retry={res.retry}
        skeleton={
          <View style={styles.stack}>
            <Skeleton height={260} />
            <Skeleton height={140} />
          </View>
        }
      >
        <View style={styles.stack}>
          <StaggerIn index={0}>
            <Card style={styles.gauge}>
              <ScoreGauge score={behaviorScore(events)} />
            </Card>
          </StaggerIn>
          <StaggerIn index={1}>
            <Card>
              <Text variant="label" tone="secondary" style={styles.title}>
                ประวัติการเพิ่ม/หักคะแนน
              </Text>
              {events.length === 0 ? (
                <EmptyState feature="behavior" icon={ShieldCheck} title="ยังไม่มีการหัก/เพิ่มคะแนน" body="รักษาไว้นะ" />
              ) : (
                <BehaviorTimeline events={events} />
              )}
            </Card>
          </StaggerIn>
          <StaggerIn index={2}>
            <Card>
              <View style={styles.tipHead}>
                <Icon icon={Lightbulb} size={20} color={feature.behavior.ink} />
                <Text variant="heading">วิธีได้รับคะแนน</Text>
              </View>
              {TIPS.map(([icon, text]) => (
                <View key={text} style={styles.tip}>
                  <View style={[styles.tipIcon, { backgroundColor: feature.behavior.fill }]}>
                    <Icon icon={icon} size={16} color={feature.behavior.ink} />
                  </View>
                  <Text variant="body" style={styles.flex}>
                    {text}
                  </Text>
                </View>
              ))}
            </Card>
          </StaggerIn>
        </View>
      </LoadGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  gauge: { paddingVertical: 20 },
  title: { marginBottom: 14 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  tipIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});

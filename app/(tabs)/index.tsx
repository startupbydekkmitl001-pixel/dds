import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { LoadGate, Screen } from '@/components/ui';
import { behaviorScore, dueAssessments, pendingLeaves, semesterDays, todayInfo } from '@/data/selectors';
import { useApp } from '@/data/store';
import { useResource } from '@/data/useResource';
import { currentSemesterId, onTimeStreak, weekStrip } from '@/lib/attendance';
import { toISODate } from '@/lib/clock';
import { useNow } from '@/lib/useNow';
import { AnnouncementBand } from '@/features/home/AnnouncementBand';
import { BalanceCard } from '@/features/home/BalanceCard';
import { FeatureTiles } from '@/features/home/FeatureTiles';
import { HomeHeader } from '@/features/home/HomeHeader';
import { HomeSkeleton } from '@/features/home/HomeSkeleton';
import { TodayCard } from '@/features/home/TodayCard';
import { WeekStrip } from '@/features/home/WeekStrip';

/** Spec §5.2 — today at a glance. */
export default function HomeScreen() {
  const res = useResource('home');
  const t = useNow();
  const today = toISODate(t);
  const attendance = useApp((s) => s.attendance);
  const leaves = useApp((s) => s.leaves);
  const demo = useApp((s) => s.settings.demo);
  const behavior = useApp((s) => s.behavior);
  const assessments = useApp((s) => s.assessments);
  const announcements = useApp((s) => s.announcements);

  const info = useMemo(() => todayInfo({ leaves }, demo, t), [leaves, demo, t]);
  const days = useMemo(() => semesterDays({ leaves, attendance }, currentSemesterId(today), demo, t), [leaves, attendance, demo, t, today]);
  const week = useMemo(() => weekStrip(days, today), [days, today]);

  return (
    <Screen header={<HomeHeader now={t} />} onRefresh={res.refresh} refreshing={res.refreshing}>
      <LoadGate status={res.status} retry={res.retry} skeleton={<HomeSkeleton />}>
        <View style={styles.stack}>
          <StaggerIn index={0}>
            <TodayCard info={info} />
          </StaggerIn>
          <StaggerIn index={1}>
            <BalanceCard />
          </StaggerIn>
          <FeatureTiles
            streak={onTimeStreak(days)}
            score={behaviorScore(behavior)}
            pending={pendingLeaves(leaves)}
            due={dueAssessments(assessments)}
          />
          <StaggerIn index={4}>
            <WeekStrip days={week} today={today} />
          </StaggerIn>
          <StaggerIn index={5}>
            <AnnouncementBand items={announcements.slice(0, 3)} now={t} />
          </StaggerIn>
        </View>
      </LoadGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
});

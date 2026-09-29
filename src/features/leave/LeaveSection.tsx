import { router } from 'expo-router';
import { FileText, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, EmptyState, ListRow, Text } from '@/components/ui';
import { SEMESTERS } from '@/data/calendar';
import { useApp } from '@/data/store';
import type { SemesterId } from '@/data/types';
import { LEAVE_TYPE_LABEL, schoolDaysBetween } from '@/lib/leave';
import { useTheme } from '@/theme/ThemeProvider';
import { LeaveBadge } from './LeaveBadge';
import { leaveRange } from './format';

/** Leave requests for the selected semester, with the tab's one primary action. */
export function LeaveSection({ semesterId }: { semesterId: SemesterId }) {
  const { feature } = useTheme();
  const leaves = useApp((s) => s.leaves);
  const sem = SEMESTERS[semesterId];
  const list = useMemo(
    () =>
      leaves
        .filter((l) => l.start <= sem.end && l.end >= sem.start)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [leaves, sem.start, sem.end],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text variant="heading" accessibilityRole="header">
          ใบลา
        </Text>
        <Button title="ยื่นใบลา" variant="primary" size="sm" icon={Plus} onPress={() => router.push('/leave/new')} />
      </View>
      {list.length === 0 ? (
        <EmptyState
          feature="leave"
          icon={FileText}
          title="ยังไม่มีใบลาในภาคเรียนนี้"
          body="ถ้าป่วยหรือมีธุระ ยื่นใบลาได้จากที่นี่ ครูที่ปรึกษาจะได้รับทันที"
        />
      ) : (
        <Card padded={false}>
          {list.map((l) => (
            <ListRow
              key={l.id}
              icon={FileText}
              iconBg={feature.leave.fill}
              iconColor={feature.leave.ink}
              title={`${LEAVE_TYPE_LABEL[l.type]} · ${schoolDaysBetween(l.start, l.end)} วันเรียน`}
              subtitle={leaveRange(l.start, l.end)}
              right={<LeaveBadge status={l.status} />}
              onPress={() => router.push(`/leave/${l.id}`)}
            />
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24, gap: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

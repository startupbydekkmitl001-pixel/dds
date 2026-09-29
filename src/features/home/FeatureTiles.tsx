import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { FEATURE_ICON, Tile } from '@/components/ui';

/** Origin's colour-coded 2×2 feature grid, each tile carrying a live number. */
export function FeatureTiles({
  streak,
  score,
  pending,
  due,
}: {
  streak: number;
  score: number;
  pending: number;
  due: number;
}) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StaggerIn index={0} style={styles.cell}>
          <Tile
            feature="attendance"
            icon={FEATURE_ICON.attendance}
            label="เวลาเรียน"
            value={`${streak} วัน`}
            caption="ตรงเวลาติดต่อกัน"
            onPress={() => router.push('/attendance')}
          />
        </StaggerIn>
        <StaggerIn index={1} style={styles.cell}>
          <Tile
            feature="behavior"
            icon={FEATURE_ICON.behavior}
            label="พฤติกรรม"
            value={String(score)}
            caption="คะแนนพฤติกรรม"
            onPress={() => router.push('/behavior')}
          />
        </StaggerIn>
      </View>
      <View style={styles.row}>
        <StaggerIn index={2} style={styles.cell}>
          <Tile
            feature="leave"
            icon={FEATURE_ICON.leave}
            label="ใบลา"
            value={pending > 0 ? String(pending) : undefined}
            caption={pending > 0 ? 'รออนุมัติ' : 'ยื่นใบลา'}
            onPress={() => router.push(pending > 0 ? '/attendance' : '/leave/new')}
          />
        </StaggerIn>
        <StaggerIn index={3} style={styles.cell}>
          <Tile
            feature="assessments"
            icon={FEATURE_ICON.assessments}
            label="แบบประเมิน"
            value={due > 0 ? String(due) : undefined}
            caption={due > 0 ? 'แบบประเมินที่ต้องทำ' : 'ทำครบแล้ว'}
            onPress={() => router.push('/assessments')}
          />
        </StaggerIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
});

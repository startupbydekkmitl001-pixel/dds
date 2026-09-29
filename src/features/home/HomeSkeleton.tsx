import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui';

export function HomeSkeleton() {
  return (
    <View style={styles.stack} accessibilityLabel="กำลังโหลด">
      <Skeleton height={96} />
      <Skeleton height={190} radius={28} />
      <View style={styles.row}>
        <Skeleton height={132} radius={28} style={styles.flex} />
        <Skeleton height={132} radius={28} style={styles.flex} />
      </View>
      <View style={styles.row}>
        <Skeleton height={132} radius={28} style={styles.flex} />
        <Skeleton height={132} radius={28} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});

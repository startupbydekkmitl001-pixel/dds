import { Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export function StreakChip({ days }: { days: number }) {
  const { feature } = useTheme();
  if (days <= 0) return null;
  return (
    <View style={[styles.chip, { backgroundColor: feature.attendance.fill }]}>
      <Icon icon={Flame} size={16} color={feature.attendance.ink} />
      <Text variant="label" color={feature.attendance.ink}>
        {`มาตรงเวลาติดต่อกัน ${days} วัน`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
});

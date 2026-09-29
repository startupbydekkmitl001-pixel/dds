import { StyleSheet, View } from 'react-native';
import { Chip, Text } from '@/components/ui';
import type { AssessmentQuestion } from '@/data/types';

/** One question per screen with big answer pills. */
export function QuestionView({
  question,
  selected,
  onSelect,
}: {
  question: AssessmentQuestion;
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text variant="caption" tone="secondary">
        {`ด้าน${question.dimension}`}
      </Text>
      <Text variant="title" accessibilityRole="header">
        {question.text}
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {question.options.map((o) => (
          <Chip key={o.value} size="lg" label={o.label} selected={selected === o.value} onPress={() => onSelect(o.value)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  options: { gap: 10, marginTop: 20 },
});

import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileQuestion, X } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { EmptyState, IconButton, Screen, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { QuestionView } from '@/features/assessments/QuestionView';
import { ResultView } from '@/features/assessments/ResultView';
import { now } from '@/lib/clock';
import { haptic } from '@/lib/haptics';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

const ADVANCE_MS = 250;

function Slide({ dir, children }: { dir: 1 | -1; children: ReactNode }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: reduced ? dur.fast : dur.base, easing: ease.base });
  }, [p, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateX: reduced ? 0 : (1 - p.value) * 40 * dir }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Spec §5.8 — one question per screen, auto-advance, progress bar, result. */
export default function AssessmentFlow() {
  const { c, feature } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assessment = useApp((s) => s.assessments.find((a) => a.id === id));
  const completeAssessment = useApp((s) => s.completeAssessment);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const total = assessment?.questions.length ?? 0;
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(finished ? 1 : index / Math.max(1, total), { duration: dur.base, easing: ease.base });
  }, [index, total, finished, progress]);
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!assessment) {
    return (
      <Screen>
        <EmptyState icon={FileQuestion} title="ไม่พบแบบประเมินนี้" actionLabel="กลับ" onAction={() => router.back()} />
      </Screen>
    );
  }

  const question = assessment.questions[index];

  const choose = (value: number) => {
    haptic.selection();
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (index === total - 1) {
        completeAssessment(assessment.id, next, now().getTime());
        haptic.success();
        setFinished(true);
      } else {
        setDir(1);
        setIndex(index + 1);
      }
    }, ADVANCE_MS);
  };

  return (
    <Screen>
      <View style={styles.bar}>
        {index > 0 && !finished ? (
          <IconButton
            icon={ChevronLeft}
            label="ข้อก่อนหน้า"
            onPress={() => {
              clearTimeout(timer.current);
              setDir(-1);
              setIndex(index - 1);
            }}
          />
        ) : (
          <View style={styles.spacer} />
        )}
        <Text variant="data" size={14} tone="secondary" accessibilityLiveRegion="polite">
          {finished ? `${total}/${total}` : `ข้อ ${index + 1}/${total}`}
        </Text>
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      <View style={[styles.track, { backgroundColor: c.hairline }]}>
        <Animated.View style={[styles.fill, { backgroundColor: feature.assessments.fill }, barStyle]} />
      </View>

      {finished && assessment.result ? (
        <ResultView title={assessment.title} result={assessment.result} onDone={() => router.back()} />
      ) : (
        <Slide key={index} dir={dir}>
          <QuestionView question={question} selected={answers[question.id]} onSelect={choose} />
        </Slide>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  spacer: { width: 44 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 28 },
  fill: { height: 4, borderRadius: 2 },
});

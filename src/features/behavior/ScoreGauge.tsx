import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { NumberTicker } from '@/components/motion';
import { Text } from '@/components/ui';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 220;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const SWEEP = 240;
const ARC = (C * SWEEP) / 360;
const START = 90 + (360 - SWEEP) / 2; // gap centred at the bottom

/** 240° gauge that sweeps to the behaviour score. */
export function ScoreGauge({ score, max = 100 }: { score: number; max?: number }) {
  const { c, feature } = useTheme();
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? score / max : 0);

  useEffect(() => {
    p.value = reduced ? score / max : withTiming(score / max, { duration: dur.base * 2, easing: ease.base });
  }, [score, max, reduced, p]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: ARC * (1 - p.value) }));
  const verdict = score >= 90 ? 'ยอดเยี่ยม รักษาไว้นะ' : score >= 70 ? 'ดี มีจุดที่ปรับได้' : 'ควรปรับปรุง ครูพร้อมช่วย';

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`คะแนนพฤติกรรม ${score} จาก ${max} ${verdict}`}>
      <Svg width={SIZE} height={SIZE}>
        <G transform={`rotate(${START} ${SIZE / 2} ${SIZE / 2})`}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={c.hairline} strokeWidth={STROKE} strokeLinecap="round" fill="none" strokeDasharray={[ARC, C]} />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={feature.behavior.fill}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={[ARC, C]}
            animatedProps={props}
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <NumberTicker value={score} from={0} format={String} variant="display" size={64} />
        <Text variant="caption" tone="secondary">
          {`จาก ${max} คะแนน`}
        </Text>
      </View>
      <Text variant="label" center style={styles.verdict}>
        {verdict}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', height: SIZE },
  verdict: { marginTop: -16 },
});

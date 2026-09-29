import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { IconButton, ProgressSteps, Screen, toast } from '@/components/ui';
import { useApp } from '@/data/store';
import { AmountStep } from '@/features/topup/AmountStep';
import { ScanningSlip } from '@/features/topup/ScanningSlip';
import { SlipStep } from '@/features/topup/SlipStep';
import { TopupResult } from '@/features/topup/TopupResult';
import { TransferStep } from '@/features/topup/TransferStep';
import { now } from '@/lib/clock';
import { newId } from '@/lib/id';
import { initialTopup, stepIndex, topupReducer, type TopupEvent } from '@/lib/topup';
import { dur, ease } from '@/theme/motion';

/** Slides a step in from the side it came from (focus-pull curve). */
function StepView({ dir, children }: { dir: 1 | -1; children: ReactNode }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: reduced ? dur.fast : dur.base, easing: ease.base });
  }, [p, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateX: reduced ? 0 : (1 - p.value) * 36 * dir }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Spec §5.3 — guided 3-step top-up: amount → transfer → slip (verified / pending / rejected). */
export default function TopupScreen() {
  const [state, dispatch] = useReducer(topupReducer, initialTopup);
  const clientId = useRef(newId('tp')).current;
  const balance = useApp((s) => s.wallet.balance);
  const submitSlip = useApp((s) => s.submitSlip);
  const networkErrors = useApp((s) => s.settings.demo.networkErrors);
  const [fromBalance, setFromBalance] = useState(balance);
  const [dir, setDir] = useState<1 | -1>(1);

  const send = (e: TopupEvent, direction: 1 | -1 = 1) => {
    setDir(direction);
    dispatch(e);
  };

  const onScanned = () => {
    if (networkErrors) {
      toast('ทำรายการไม่สำเร็จ ลองอีกครั้ง', { kind: 'error' });
      send({ type: 'RETRY' }, -1);
      return;
    }
    setFromBalance(balance);
    const result = submitSlip({ clientId, amount: state.amount ?? 0, nowMs: now().getTime() });
    send({ type: 'SCAN_DONE', result });
  };

  const canGoBack = state.step === 'transfer' || state.step === 'slip';
  const done = state.step === 'verified' || state.step === 'pending' || state.step === 'rejected';

  return (
    <Screen padded>
      <View style={styles.bar}>
        {canGoBack ? <IconButton icon={ChevronLeft} label="ย้อนกลับ" onPress={() => send({ type: 'BACK' }, -1)} /> : <View style={styles.spacer} />}
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      {!done ? (
        <View style={styles.progress}>
          <ProgressSteps steps={['จำนวนเงิน', 'โอนเงิน', 'ส่งสลิป']} current={stepIndex(state.step)} />
        </View>
      ) : null}

      <StepView key={state.step} dir={dir}>
        {state.step === 'amount' ? (
          <AmountStep
            initial={state.amount}
            onNext={(amount) => {
              dispatch({ type: 'SET_AMOUNT', amount });
              send({ type: 'NEXT' });
            }}
          />
        ) : null}
        {state.step === 'transfer' ? <TransferStep amount={state.amount ?? 0} onNext={() => send({ type: 'NEXT' })} /> : null}
        {state.step === 'slip' ? <SlipStep onPicked={(uri) => send({ type: 'SLIP_PICKED', uri })} /> : null}
        {state.step === 'scanning' && state.slipUri ? (
          <ScanningSlip uri={state.slipUri} amount={state.amount ?? 0} onDone={onScanned} />
        ) : null}
        {done ? (
          <TopupResult
            kind={state.step as 'verified' | 'pending' | 'rejected'}
            amount={state.amount ?? 0}
            fromBalance={fromBalance}
            balance={balance}
            onClose={() => router.back()}
            onRetry={() => send({ type: 'RETRY' }, -1)}
          />
        ) : null}
      </StepView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  spacer: { width: 44 },
  progress: { marginBottom: 24 },
});

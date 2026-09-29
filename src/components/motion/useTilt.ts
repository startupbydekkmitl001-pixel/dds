import { DeviceMotion } from 'expo-sensors';
import { useEffect } from 'react';
import { useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { isNative } from '@/lib/platform';

/** Left/right phone tilt in −1…1 (0 on web or under Reduce Motion). */
export function useTilt(): SharedValue<number> {
  const reduced = useReducedMotion();
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (!isNative || reduced) return;
    let sub: { remove(): void } | undefined;
    let cancelled = false;
    DeviceMotion.isAvailableAsync()
      .then((ok) => {
        if (!ok || cancelled) return;
        DeviceMotion.setUpdateInterval(60);
        sub = DeviceMotion.addListener(({ rotation }) => {
          const gamma = rotation?.gamma ?? 0;
          tilt.value = withTiming(Math.max(-1, Math.min(1, gamma / 0.6)), { duration: 120 });
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [reduced, tilt]);

  return tilt;
}

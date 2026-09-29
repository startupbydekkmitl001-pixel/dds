import * as Brightness from 'expo-brightness';
import { useEffect } from 'react';
import { isNative } from './platform';

/** Max screen brightness while `active` (so canteen scanners read the QR), restored afterwards. Native only. */
export function useMaxBrightness(active: boolean): void {
  useEffect(() => {
    if (!isNative || !active) return;
    let previous: number | null = null;
    let cancelled = false;
    Brightness.getBrightnessAsync()
      .then((b) => {
        previous = b;
        if (!cancelled) return Brightness.setBrightnessAsync(1);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (previous !== null) Brightness.setBrightnessAsync(previous).catch(() => undefined);
    };
  }, [active]);
}

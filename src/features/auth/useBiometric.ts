import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/data/store';
import { isNative } from '@/lib/platform';

/** Face ID when the device has it, it's enrolled, and the student left it on in Settings. */
export function useBiometric(): { available: boolean; authenticate(): Promise<boolean> } {
  const enabled = useApp((s) => s.settings.faceId);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!isNative || !enabled) {
      setAvailable(false);
      return;
    }
    let alive = true;
    Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()])
      .then(([hardware, enrolled]) => {
        if (alive) setAvailable(hardware && enrolled);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [enabled]);

  const authenticate = useCallback(async () => {
    try {
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'เข้าสู่ระบบ Dschool', cancelLabel: 'ใช้ PIN' });
      return r.success;
    } catch {
      return false;
    }
  }, []);

  return { available, authenticate };
}

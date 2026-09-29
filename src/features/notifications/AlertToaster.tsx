import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui';
import { useApp } from '@/data/store';
import { nextToastAlert } from './arrivals';

/** Drops a tappable toast when the simulated backend delivers a new alert. Renders nothing. */
export function AlertToaster() {
  const alerts = useApp((s) => s.alerts);
  const unlocked = useApp((s) => s.unlocked);
  const lastHead = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const next = nextToastAlert(lastHead.current, alerts);
    lastHead.current = alerts[0]?.id ?? null;
    if (next && unlocked) toast(next.title, { href: next.link, kind: next.kind === 'topup' ? 'success' : 'info' });
  }, [alerts, unlocked]);

  return null;
}

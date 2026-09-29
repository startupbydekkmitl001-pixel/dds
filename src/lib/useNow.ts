import { useEffect, useState } from 'react';
import { now } from './clock';

/** Re-render on an interval with the current time (via the app clock). */
export function useNow(intervalMs = 60_000): Date {
  const [t, setT] = useState(() => now());
  useEffect(() => {
    const id = setInterval(() => setT(now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}

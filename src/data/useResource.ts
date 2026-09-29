import { useCallback, useEffect, useState } from 'react';
import { load } from './api';

export type ResourceStatus = 'loading' | 'error' | 'ready';

/** Keys that loaded once this session; revisiting a screen is instant. */
const loaded = new Set<string>();

/**
 * Gates a screen's first load (skeleton → content, or error + retry).
 * Content itself reads live data from the store.
 */
export function useResource(key: string): {
  status: ResourceStatus;
  retry(): void;
  refreshing: boolean;
  refresh(): Promise<void>;
} {
  const [status, setStatus] = useState<ResourceStatus>(() => (loaded.has(key) ? 'ready' : 'loading'));
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (attempt === 0 && loaded.has(key)) return;
    let alive = true;
    setStatus('loading');
    load(key).then(
      () => {
        loaded.add(key);
        if (alive) setStatus('ready');
      },
      () => {
        if (alive) setStatus('error');
      },
    );
    return () => {
      alive = false;
    };
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(key);
      loaded.add(key);
      setStatus('ready');
    } catch {
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [key]);

  return { status, retry, refreshing, refresh };
}

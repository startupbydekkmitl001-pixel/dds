import type { StoreApi } from 'zustand';
import { now } from '@/lib/clock';
import { appStore, type AppState } from './store';

/** Drive the simulated backend: settle whatever is due, once a second. */
export function startSimulations(store: StoreApi<AppState> = appStore): () => void {
  const id = setInterval(() => store.getState().tick(now().getTime()), 1000);
  return () => clearInterval(id);
}

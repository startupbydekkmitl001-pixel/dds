/** Fake network layer: realistic latency, and failures when the demo toggle is on. */
import type { StoreApi } from 'zustand';
import { appStore, type AppState } from './store';

export class ApiError extends Error {
  readonly code = 'network' as const;
  constructor() {
    super('network');
    this.name = 'ApiError';
  }
}

export function load(_key: string, store: StoreApi<AppState> = appStore): Promise<void> {
  const delay = 350 + Math.floor(Math.random() * 550);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (store.getState().settings.demo.networkErrors) reject(new ApiError());
      else resolve();
    }, delay);
  });
}

import { act, renderHook } from '@testing-library/react-native';
import { ApiError, load } from '@/data/api';
import { buildSeed } from '@/data/seed';
import { startSimulations } from '@/data/simulations';
import { appStore, createAppStore } from '@/data/store';
import { useResource } from '@/data/useResource';

const T = new Date(2026, 8, 29, 9).getTime();

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  appStore.getState().updateDemo({ networkErrors: false });
});

test('load resolves after the simulated latency', async () => {
  const st = createAppStore(buildSeed(new Date(T)), { persist: false });
  const done = jest.fn();
  load('home', st).then(done);
  await act(async () => {
    jest.advanceTimersByTime(900);
  });
  expect(done).toHaveBeenCalled();
});

test('load rejects with ApiError when network errors are simulated', async () => {
  const st = createAppStore(buildSeed(new Date(T)), { persist: false });
  st.getState().updateDemo({ networkErrors: true });
  const p = load('home', st);
  jest.advanceTimersByTime(900);
  await expect(p).rejects.toBeInstanceOf(ApiError);
});

test('useResource goes loading → ready', async () => {
  const { result } = await renderHook(() => useResource('k-ready'));
  expect(result.current.status).toBe('loading');
  await act(async () => {
    jest.advanceTimersByTime(900);
  });
  expect(result.current.status).toBe('ready');
});

test('useResource surfaces errors and recovers on retry', async () => {
  appStore.getState().updateDemo({ networkErrors: true });
  const { result } = await renderHook(() => useResource('k-error'));
  await act(async () => {
    jest.advanceTimersByTime(900);
  });
  expect(result.current.status).toBe('error');
  appStore.getState().updateDemo({ networkErrors: false });
  await act(async () => result.current.retry());
  expect(result.current.status).toBe('loading');
  await act(async () => {
    jest.advanceTimersByTime(900);
  });
  expect(result.current.status).toBe('ready');
});

test('a key that already loaded starts ready on the next mount', async () => {
  const first = await renderHook(() => useResource('k-cached'));
  await act(async () => {
    jest.advanceTimersByTime(900);
  });
  await first.unmount();
  const second = await renderHook(() => useResource('k-cached'));
  expect(second.result.current.status).toBe('ready');
});

test('startSimulations ticks the store every second', () => {
  const seed = buildSeed(new Date(T));
  const st = createAppStore({ ...seed, wallet: { ...seed.wallet, pending: [{ id: 'p', clientId: 'x', amount: 30, dueAt: 0 }] } }, { persist: false });
  const stop = startSimulations(st);
  jest.advanceTimersByTime(1000);
  expect(st.getState().wallet.balance).toBe(seed.wallet.balance + 30);
  stop();
});

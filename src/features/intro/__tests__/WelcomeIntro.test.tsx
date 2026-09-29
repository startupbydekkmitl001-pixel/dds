import { act, fireEvent, renderHook, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AppState, type AppStateStatus } from 'react-native';
import { appStore } from '@/data/store';
import { WelcomeIntro } from '@/features/intro/WelcomeIntro';
import { useWelcomeIntro } from '@/features/intro/useWelcomeIntro';
import { renderWithTheme } from '@/test/renderWithTheme';

let mockReduced = false;
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => mockReduced };
});

type Listener = (payload?: unknown) => void;
/**
 * A stand-in for expo-video's player: records calls and lets a test emit player events.
 * Like the web player, play() only reaches video surfaces that are already mounted.
 */
const mockPlayer = {
  muted: false,
  loop: true,
  surfaces: 0,
  playedBeforeMount: false,
  play: jest.fn(() => {
    if (mockPlayer.surfaces === 0) mockPlayer.playedBeforeMount = true;
  }),
  pause: jest.fn(),
  replay: jest.fn(),
  listeners: new Map<string, Set<Listener>>(),
  addListener(event: string, fn: Listener) {
    const set = this.listeners.get(event) ?? new Set<Listener>();
    set.add(fn);
    this.listeners.set(event, set);
    return { remove: () => set.delete(fn) };
  },
  emit(event: string, payload?: unknown) {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  },
};
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (_source: unknown, setup?: (p: typeof mockPlayer) => void) => {
      React.useState(() => setup?.(mockPlayer));
      return mockPlayer;
    },
    VideoView: (props: object) => {
      React.useEffect(() => {
        mockPlayer.surfaces += 1;
        return () => {
          mockPlayer.surfaces -= 1;
        };
      }, []);
      return React.createElement(View, { testID: 'intro-video', ...props });
    },
  };
});
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(() => true), replace: jest.fn(), push: jest.fn() },
}));

beforeEach(() => {
  mockReduced = false;
  mockPlayer.listeners.clear();
  mockPlayer.muted = false;
  mockPlayer.loop = true;
  mockPlayer.playedBeforeMount = false;
  jest.clearAllMocks();
  appStore.getState().updateSettings({ introSeen: false });
});

test('plays the intro once, muted, with a skip button', async () => {
  await renderWithTheme(<WelcomeIntro />);
  expect(mockPlayer.play).toHaveBeenCalled();
  expect(mockPlayer.muted).toBe(true);
  expect(mockPlayer.loop).toBe(false);
  expect(screen.getByLabelText('ข้าม')).toBeTruthy();
  expect(screen.queryByLabelText('เริ่มต้นใช้งาน')).toBeNull();
});

test('starts playback only once the video surface is mounted (web ignores earlier play calls)', async () => {
  await renderWithTheme(<WelcomeIntro />);
  expect(mockPlayer.play).toHaveBeenCalled();
  expect(mockPlayer.playedBeforeMount).toBe(false);
});

describe('returning to the foreground', () => {
  let appStateHandlers: ((state: AppStateStatus) => void)[] = [];
  beforeEach(() => {
    appStateHandlers = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      appStateHandlers.push(handler);
      const remove = () => {
        appStateHandlers = appStateHandlers.filter((h) => h !== handler);
      };
      return { remove } as ReturnType<typeof AppState.addEventListener>;
    });
  });
  afterEach(() => jest.restoreAllMocks());
  const becomes = (state: AppStateStatus) => act(async () => appStateHandlers.forEach((h) => h(state)));

  test('resumes an intro the system paused in the background', async () => {
    await renderWithTheme(<WelcomeIntro />);
    mockPlayer.play.mockClear();
    await becomes('background');
    await becomes('active');
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('leaves a finished intro on its last frame', async () => {
    await renderWithTheme(<WelcomeIntro />);
    await act(async () => mockPlayer.emit('playToEnd'));
    mockPlayer.play.mockClear();
    await becomes('active');
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });
});

test('skipping marks the intro as seen and returns to the app', async () => {
  await renderWithTheme(<WelcomeIntro />);
  await fireEvent.press(screen.getByLabelText('ข้าม'));
  expect(appStore.getState().settings.introSeen).toBe(true);
  expect(router.back).toHaveBeenCalled();
});

test('at the end it offers a replay and the start button', async () => {
  await renderWithTheme(<WelcomeIntro />);
  await act(async () => mockPlayer.emit('playToEnd'));
  expect(screen.queryByLabelText('ข้าม')).toBeNull();

  await fireEvent.press(screen.getByLabelText('ดูอีกครั้ง'));
  expect(mockPlayer.replay).toHaveBeenCalled();
  expect(screen.getByLabelText('ข้าม')).toBeTruthy();

  await act(async () => mockPlayer.emit('playToEnd'));
  await fireEvent.press(screen.getByLabelText('เริ่มต้นใช้งาน'));
  expect(appStore.getState().settings.introSeen).toBe(true);
  expect(router.back).toHaveBeenCalled();
});

test('with Reduce Motion it shows the final frame instead of autoplaying', async () => {
  mockReduced = true;
  await renderWithTheme(<WelcomeIntro />);
  expect(mockPlayer.play).not.toHaveBeenCalled();
  expect(screen.getByLabelText('เริ่มต้นใช้งาน')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('เล่นวิดีโอ'));
  expect(mockPlayer.play).toHaveBeenCalled();
  expect(mockPlayer.playedBeforeMount).toBe(false);
});

test('a playback error falls back to the final frame and the start button', async () => {
  await renderWithTheme(<WelcomeIntro />);
  await act(async () => mockPlayer.emit('statusChange', { status: 'error', error: { message: 'decode failed' } }));
  expect(screen.getByLabelText('เริ่มต้นใช้งาน')).toBeTruthy();
});

test('leaving another way, such as Android back, still counts as seen', async () => {
  const view = await renderWithTheme(<WelcomeIntro />);
  expect(appStore.getState().settings.introSeen).toBe(false);
  await view.unmount();
  expect(appStore.getState().settings.introSeen).toBe(true);
});

test('with no screen to return to, finishing opens Home', async () => {
  jest.mocked(router.canGoBack).mockReturnValueOnce(false);
  await renderWithTheme(<WelcomeIntro />);
  await fireEvent.press(screen.getByLabelText('ข้าม'));
  expect(router.replace).toHaveBeenCalledWith('/');
});

describe('useWelcomeIntro', () => {
  test('opens the intro on the first visit', async () => {
    await renderHook(() => useWelcomeIntro());
    expect(router.push).toHaveBeenCalledWith('/intro');
  });

  test('stays out of the way once the intro has been seen', async () => {
    appStore.getState().updateSettings({ introSeen: true });
    await renderHook(() => useWelcomeIntro());
    expect(router.push).not.toHaveBeenCalled();
  });
});

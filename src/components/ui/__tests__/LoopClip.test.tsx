import { act, screen } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { LoopClip } from '@/components/ui/LoopClip';
import { renderWithTheme } from '@/test/renderWithTheme';

let mockReduced = false;
let mockFocused = true;
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => mockReduced };
});
jest.mock('expo-router', () => ({ useIsFocused: () => mockFocused }));

const mockPlayer = { muted: false, loop: false, play: jest.fn(), pause: jest.fn() };
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (_source: unknown, setup?: (p: typeof mockPlayer) => void) => {
      React.useState(() => setup?.(mockPlayer));
      return mockPlayer;
    },
    VideoView: (props: object) => React.createElement(View, { testID: 'clip-video', ...props }),
  };
});

let appStateHandlers: ((state: AppStateStatus) => void)[] = [];
beforeEach(() => {
  mockReduced = false;
  mockFocused = true;
  jest.clearAllMocks();
  appStateHandlers = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
    appStateHandlers.push(handler);
    return {
      remove: () => {
        appStateHandlers = appStateHandlers.filter((h) => h !== handler);
      },
    } as ReturnType<typeof AppState.addEventListener>;
  });
});
afterEach(() => jest.restoreAllMocks());

const id = (testID: string) => screen.queryByTestId(testID, { includeHiddenElements: true });

describe('LoopClip', () => {
  test('names its poster after the given testID', async () => {
    await renderWithTheme(<LoopClip video={1} poster={2} testID="seal" />);
    expect(id('seal-poster')).toBeTruthy();
  });

  test('plays by default', async () => {
    await renderWithTheme(<LoopClip video={1} poster={2} testID="seal" />);
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(mockPlayer.muted).toBe(true);
    expect(mockPlayer.loop).toBe(true);
  });

  test('while inactive only the poster is shown: no video, nothing to play or resume', async () => {
    await renderWithTheme(<LoopClip video={1} poster={2} testID="seal" active={false} />);
    expect(id('seal-poster')).toBeTruthy();
    expect(id('clip-video')).toBeNull();
    expect(mockPlayer.play).not.toHaveBeenCalled();
    await act(async () => appStateHandlers.forEach((h) => h('active')));
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });

  test('the video arrives and plays when it becomes active, and goes when it stops being active', async () => {
    const view = await renderWithTheme(<LoopClip video={1} poster={2} testID="seal" active={false} />);
    await view.rerender(<LoopClip video={1} poster={2} testID="seal" active />);
    expect(id('clip-video')).toBeTruthy();
    expect(mockPlayer.play).toHaveBeenCalled();
    await view.rerender(<LoopClip video={1} poster={2} testID="seal" active={false} />);
    expect(id('clip-video')).toBeNull();
    expect(id('seal-poster')).toBeTruthy();
  });

  test('an unfocused screen keeps it paused even when it is active', async () => {
    mockFocused = false;
    await renderWithTheme(<LoopClip video={1} poster={2} testID="seal" active />);
    expect(mockPlayer.play).not.toHaveBeenCalled();
    expect(mockPlayer.pause).toHaveBeenCalled();
  });

  test('with Reduce Motion only the poster is shown', async () => {
    mockReduced = true;
    await renderWithTheme(<LoopClip video={1} poster={2} testID="seal" />);
    expect(id('seal-poster')).toBeTruthy();
    expect(id('clip-video')).toBeNull();
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });
});

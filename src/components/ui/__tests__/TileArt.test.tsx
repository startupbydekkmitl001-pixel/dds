import { act, screen } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { TileArt } from '@/components/ui/TileArt';
import { TILE_ART, tileArtFor } from '@/components/ui/tileArtSources';
import { appStore } from '@/data/store';
import type { FeatureKey } from '@/data/types';
import { renderWithTheme } from '@/test/renderWithTheme';

let mockReduced = false;
let mockFocused = true;
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => mockReduced };
});
jest.mock('expo-router', () => ({
  useIsFocused: () => mockFocused,
  router: { push: jest.fn() },
}));

const mockPlayer = {
  muted: false,
  loop: false,
  play: jest.fn(),
  pause: jest.fn(),
  source: undefined as unknown,
};
let videoProps: Record<string, unknown> = {};
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (source: unknown, setup?: (p: typeof mockPlayer) => void) => {
      mockPlayer.source = source;
      React.useState(() => setup?.(mockPlayer));
      return mockPlayer;
    },
    VideoView: (props: Record<string, unknown>) => {
      videoProps = props;
      return React.createElement(View, { testID: 'tile-art-video', ...props });
    },
  };
});

let appStateHandlers: ((state: AppStateStatus) => void)[] = [];
beforeEach(() => {
  mockReduced = false;
  mockFocused = true;
  mockPlayer.muted = false;
  mockPlayer.loop = false;
  videoProps = {};
  jest.clearAllMocks();
  appStore.getState().updateSettings({ theme: 'light' });
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

const attendance = () => tileArtFor('attendance', 'light')!;
// The art is deliberately hidden from accessibility, so queries must opt in to see it.
const id = (testID: string) => screen.queryByTestId(testID, { includeHiddenElements: true });

describe('tile art registry', () => {
  test('the four Home tiles have a loop and a poster in both appearances', () => {
    for (const key of ['attendance', 'behavior', 'leave', 'assessments'] as FeatureKey[]) {
      for (const scheme of ['light', 'dark'] as const) {
        const art = tileArtFor(key, scheme);
        expect(art?.video).toBeTruthy();
        expect(art?.poster).toBeTruthy();
      }
      expect(tileArtFor(key, 'dark')?.video).not.toBe(tileArtFor(key, 'light')?.video);
    }
  });

  test('features without art keep their orb scene', () => {
    expect(tileArtFor('wallet', 'light')).toBeUndefined();
    expect(tileArtFor('announcements', 'dark')).toBeUndefined();
    expect(Object.keys(TILE_ART).sort()).toEqual(['assessments', 'attendance', 'behavior', 'leave']);
  });
});

describe('TileArt', () => {
  test('plays a muted, looping clip over its poster', async () => {
    await renderWithTheme(<TileArt art={attendance()} />);
    expect(id('tile-art-poster')).toBeTruthy();
    expect(mockPlayer.muted).toBe(true);
    expect(mockPlayer.loop).toBe(true);
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(mockPlayer.source).toBe(attendance().video);
  });

  test('keeps the clip hidden until its first frame renders, so it never flashes black', async () => {
    await renderWithTheme(<TileArt art={attendance()} />);
    const opacity = () => (id('tile-art-video')!.props.style as { opacity?: number }[]).flat().find((s) => s && 'opacity' in s)?.opacity;
    expect(opacity()).toBe(0);
    await act(async () => (videoProps.onFirstFrameRender as () => void)());
    expect(opacity()).toBe(1);
  });

  test('pauses while its screen is not focused and resumes when it is', async () => {
    mockFocused = false;
    const view = await renderWithTheme(<TileArt art={attendance()} />);
    expect(mockPlayer.play).not.toHaveBeenCalled();
    expect(mockPlayer.pause).toHaveBeenCalled();

    mockFocused = true;
    await view.rerender(<TileArt art={attendance()} />);
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  test('resumes after the app returns to the foreground', async () => {
    await renderWithTheme(<TileArt art={attendance()} />);
    mockPlayer.play.mockClear();
    await act(async () => appStateHandlers.forEach((h) => h('active')));
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('does not resume when its screen is unfocused, even if the app becomes active', async () => {
    mockFocused = false;
    await renderWithTheme(<TileArt art={attendance()} />);
    await act(async () => appStateHandlers.forEach((h) => h('active')));
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });

  test('with Reduce Motion it shows the poster only and never decodes the clip', async () => {
    mockReduced = true;
    await renderWithTheme(<TileArt art={attendance()} />);
    expect(id('tile-art-poster')).toBeTruthy();
    expect(id('tile-art-video')).toBeNull();
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });

  test('is decorative: hidden from the accessibility tree', async () => {
    await renderWithTheme(<TileArt art={attendance()} />);
    expect(id('tile-art')!.props.accessibilityElementsHidden).toBe(true);
    expect(id('tile-art')!.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});

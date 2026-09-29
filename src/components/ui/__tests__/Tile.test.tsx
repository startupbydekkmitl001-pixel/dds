import { CalendarCheck, Wallet } from 'lucide-react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Tile } from '@/components/ui/Tile';
import { tileArtFor } from '@/components/ui/tileArtSources';
import { appStore } from '@/data/store';
import { renderWithTheme } from '@/test/renderWithTheme';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => false };
});
jest.mock('expo-router', () => ({ useIsFocused: () => true, router: { push: jest.fn() } }));

const mockPlayer = { muted: false, loop: false, play: jest.fn(), pause: jest.fn(), source: undefined as unknown };
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (source: unknown, setup?: (p: typeof mockPlayer) => void) => {
      mockPlayer.source = source;
      React.useState(() => setup?.(mockPlayer));
      return mockPlayer;
    },
    VideoView: (props: object) => React.createElement(View, { testID: 'tile-art-video', ...props }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  appStore.getState().updateSettings({ theme: 'light' });
});

describe('Tile', () => {
  test('a feature with art plays its loop and keeps its label and number', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Tile feature="attendance" icon={CalendarCheck} label="เวลาเรียน" value="14 วัน" caption="ตรงเวลาติดต่อกัน" onPress={onPress} />);
    expect(screen.getByTestId('tile-art-video', { includeHiddenElements: true })).toBeTruthy();
    expect(mockPlayer.source).toBe(tileArtFor('attendance', 'light')!.video);
    expect(screen.getByText('14 วัน')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('14 วัน เวลาเรียน ตรงเวลาติดต่อกัน'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('follows the appearance: the dark theme plays the dark loop', async () => {
    appStore.getState().updateSettings({ theme: 'dark' });
    await renderWithTheme(<Tile feature="leave" icon={CalendarCheck} label="ใบลา" onPress={() => undefined} />);
    expect(mockPlayer.source).toBe(tileArtFor('leave', 'dark')!.video);
  });

  test('a feature without art keeps its orb scene and plays no video', async () => {
    await renderWithTheme(<Tile feature="wallet" icon={Wallet} label="กระเป๋าเงิน" value="฿760" onPress={() => undefined} />);
    expect(screen.queryByTestId('tile-art-video', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText('฿760')).toBeTruthy();
  });
});

import { screen } from '@testing-library/react-native';
import { SchoolSeal } from '@/features/me/SchoolSeal';
import { renderWithTheme } from '@/test/renderWithTheme';

let mockReduced = false;
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => mockReduced };
});
jest.mock('expo-router', () => ({ useIsFocused: () => true }));

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
    VideoView: (props: object) => React.createElement(View, { testID: 'school-seal-video', ...props }),
  };
});

beforeEach(() => {
  mockReduced = false;
  jest.clearAllMocks();
});

const id = (testID: string) => screen.queryByTestId(testID, { includeHiddenElements: true });

describe('SchoolSeal', () => {
  test('plays the animated seal, muted and looping', async () => {
    await renderWithTheme(<SchoolSeal size={64} />);
    expect(mockPlayer.source).toBe(require('../../../../assets/seal/seal.mp4'));
    expect(mockPlayer.muted).toBe(true);
    expect(mockPlayer.loop).toBe(true);
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(id('school-seal-poster')).toBeTruthy();
  });

  test('is a circle of exactly the size it is given', async () => {
    await renderWithTheme(<SchoolSeal size={64} />);
    const style = Object.assign({}, ...[id('school-seal')!.props.style].flat(Infinity).filter(Boolean));
    expect(style).toMatchObject({ width: 64, height: 64, borderRadius: 32, overflow: 'hidden' });
  });

  test('is decorative: the card already says the school name', async () => {
    await renderWithTheme(<SchoolSeal size={64} />);
    expect(id('school-seal')!.props.accessibilityElementsHidden).toBe(true);
    expect(id('school-seal')!.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  test('with Reduce Motion it is a still', async () => {
    mockReduced = true;
    await renderWithTheme(<SchoolSeal size={64} />);
    expect(id('school-seal-poster')).toBeTruthy();
    expect(id('school-seal-video')).toBeNull();
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });

  test('is just the still, with no video behind it, while its card face is hidden', async () => {
    await renderWithTheme(<SchoolSeal size={44} active={false} />);
    expect(id('school-seal-poster')).toBeTruthy();
    expect(id('school-seal-video')).toBeNull();
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });
});

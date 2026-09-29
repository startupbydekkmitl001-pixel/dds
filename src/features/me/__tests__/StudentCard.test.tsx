import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { appStore } from '@/data/store';
import { SCHOOL_NAME } from '@/data/seed';
import { StudentCard } from '@/features/me/StudentCard';
import { renderWithTheme } from '@/test/renderWithTheme';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => false };
});
jest.mock('expo-router', () => ({ useIsFocused: () => true }));
jest.mock('@/lib/haptics', () => ({ haptic: { light: jest.fn(), selection: jest.fn() } }));

type Player = { muted: boolean; loop: boolean; play: jest.Mock; pause: jest.Mock };
// One player per mounted clip, in mount order. Only the face that's showing mounts one.
const players: Player[] = [];
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (_source: unknown, setup?: (p: Player) => void) => {
      const [player] = React.useState(() => {
        const p: Player = { muted: false, loop: false, play: jest.fn(), pause: jest.fn() };
        players.push(p);
        setup?.(p);
        return p;
      });
      return player;
    },
    VideoView: (props: object) => React.createElement(View, { testID: 'seal-clip', ...props }),
  };
});

beforeEach(() => {
  players.length = 0;
  appStore.getState().resetDemo(new Date(2026, 8, 29, 9).getTime());
});

afterEach(() => jest.useRealTimers());

const seals = () => screen.queryAllByTestId('school-seal', { includeHiddenElements: true });
const face = (testID: string) => screen.getByTestId(testID, { includeHiddenElements: true });
const clipOn = (testID: string) => within(face(testID)).queryByTestId('seal-clip', { includeHiddenElements: true });

async function flipAndSettle() {
  await fireEvent.press(screen.getByRole('button'));
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
}

describe('StudentCard', () => {
  test('carries the school seal and name, and no longer the placeholder school', async () => {
    await renderWithTheme(<StudentCard />);
    expect(screen.getAllByText(SCHOOL_NAME).length).toBeGreaterThan(0);
    expect(screen.queryByText('โรงเรียนตัวอย่างวิทยา')).toBeNull();
    expect(seals()).toHaveLength(2);                       // one on each face
    expect(screen.getAllByText('DSCHOOL · STUDENT ID').length).toBeGreaterThan(0);
  });

  test('keeps the student details', async () => {
    await renderWithTheme(<StudentCard />);
    expect(screen.getAllByText('ภูมิภัทร ศรีสุข').length).toBeGreaterThan(0);
    expect(screen.getAllByText('รหัส 24815').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ปีการศึกษา 2569').length).toBeGreaterThan(0);
  });

  test('only the face you can see has a seal video, and it moves across as the card turns', async () => {
    jest.useFakeTimers();
    await renderWithTheme(<StudentCard />);
    expect(clipOn('card-front')).toBeTruthy();
    expect(clipOn('card-back')).toBeNull();
    expect(players).toHaveLength(1);
    expect(players[0].play).toHaveBeenCalled();

    await flipAndSettle();
    expect(clipOn('card-front')).toBeNull();
    expect(clipOn('card-back')).toBeTruthy();
    expect(players).toHaveLength(2);
    expect(players[1].play).toHaveBeenCalled();

    await flipAndSettle();
    expect(clipOn('card-front')).toBeTruthy();
    expect(clipOn('card-back')).toBeNull();
  });

  test('the face turned away is fully transparent, not just turned', async () => {
    jest.useFakeTimers();
    await renderWithTheme(<StudentCard />);
    expect(face('card-front')).toHaveAnimatedStyle({ opacity: 1 });
    expect(face('card-back')).toHaveAnimatedStyle({ opacity: 0 });

    await flipAndSettle();
    expect(face('card-front')).toHaveAnimatedStyle({ opacity: 0 });
    expect(face('card-back')).toHaveAnimatedStyle({ opacity: 1 });
  });

  test('card text stays on one line and caps its growth with the system text size', async () => {
    await renderWithTheme(<StudentCard />);
    for (const text of ['ภูมิภัทร ศรีสุข', 'รหัส 24815']) {
      const node = screen.getAllByText(text)[0];
      expect(node.props.numberOfLines).toBe(1);
      expect(node.props.adjustsFontSizeToFit).toBe(true);
      expect(node.props.maxFontSizeMultiplier).toBeLessThanOrEqual(1.3);
    }
  });

  test('the accessible label names the school', async () => {
    await renderWithTheme(<StudentCard />);
    expect(screen.getByRole('button').props.accessibilityLabel).toContain(SCHOOL_NAME);
  });
});

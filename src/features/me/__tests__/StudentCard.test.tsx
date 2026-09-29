import { fireEvent, screen } from '@testing-library/react-native';
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
// One player per clip, in render order: the front face's seal first, then the back face's.
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

const seals = () => screen.queryAllByTestId('school-seal', { includeHiddenElements: true });

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

  test('only the face you can see plays its seal, and flipping swaps them', async () => {
    await renderWithTheme(<StudentCard />);
    const [front, back] = players;
    expect(front.play).toHaveBeenCalled();
    expect(back.play).not.toHaveBeenCalled();

    front.pause.mockClear();
    await fireEvent.press(screen.getByRole('button'));
    expect(back.play).toHaveBeenCalled();
    expect(front.pause).toHaveBeenCalled();
  });

  test('the accessible label names the school', async () => {
    await renderWithTheme(<StudentCard />);
    expect(screen.getByRole('button').props.accessibilityLabel).toContain(SCHOOL_NAME);
  });
});

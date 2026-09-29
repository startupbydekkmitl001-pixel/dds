import { act, fireEvent, screen } from '@testing-library/react-native';
import { appStore } from '@/data/store';
import PinScreen from '@/features/auth/PinScreen';
import { setClock } from '@/lib/clock';
import { INITIAL_GATE } from '@/lib/pin';
import { renderWithTheme } from '@/test/renderWithTheme';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual.default, useReducedMotion: () => true };
});
jest.mock('@/data/pinStorage', () => ({
  getPin: jest.fn(() => Promise.resolve('123456')),
  setPin: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(false)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(false)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: false })),
}));

const T = new Date(2026, 8, 29, 9).getTime();

beforeEach(() => {
  jest.useFakeTimers();
  setClock(() => new Date(T));
  appStore.getState().resetDemo(T);
  appStore.setState({ unlocked: false, pinGate: INITIAL_GATE });
});
afterEach(() => {
  jest.useRealTimers();
  setClock(null);
});

async function enter(pin: string) {
  for (const d of pin) await fireEvent.press(screen.getByLabelText(d));
}

test('a wrong PIN reports remaining attempts; the right PIN unlocks', async () => {
  await renderWithTheme(<PinScreen />);
  await enter('000000');
  expect(await screen.findByText('PIN ไม่ถูกต้อง · เหลืออีก 4 ครั้ง')).toBeTruthy();
  expect(appStore.getState().unlocked).toBe(false);

  await act(async () => {
    jest.advanceTimersByTime(400);
  });
  await enter('123456');
  await act(async () => {
    jest.advanceTimersByTime(300);
  });
  expect(appStore.getState().unlocked).toBe(true);
});

test('five wrong PINs lock the keypad with a countdown', async () => {
  await renderWithTheme(<PinScreen />);
  for (let i = 0; i < 5; i++) {
    await enter('000000');
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
  }
  expect(await screen.findByText('ลองใหม่ได้ในอีก 30 วินาที')).toBeTruthy();
});

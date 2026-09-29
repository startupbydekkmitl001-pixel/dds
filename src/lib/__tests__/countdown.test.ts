import { elapsedFraction, newQrToken, secondsLeft } from '@/lib/countdown';
import { newId } from '@/lib/id';

test('secondsLeft rounds up and clamps to [0, 60]', () => {
  expect(secondsLeft(0, 0)).toBe(60);
  expect(secondsLeft(0, 59_001)).toBe(1);
  expect(secondsLeft(0, 60_000)).toBe(0);
  expect(secondsLeft(0, 75_000)).toBe(0);
});

test('elapsedFraction clamps to 1', () => {
  expect(elapsedFraction(0, 30_000)).toBeCloseTo(0.5);
  expect(elapsedFraction(0, 90_000)).toBe(1);
});

test('QR token embeds the student id', () => {
  expect(newQrToken('24815', 1_700_000_000_000, () => 0.5)).toMatch(/^DSCH:24815:[a-z0-9]+:[a-z0-9]{6}$/);
});

test('newId has prefix and 8 base36 chars', () => {
  expect(newId('lv', () => 0.25)).toMatch(/^lv_[a-z0-9]{8}$/);
});

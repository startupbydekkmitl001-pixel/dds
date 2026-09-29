import { roundedRectPath, roundedRectPerimeter } from '@/components/motion/geometry';

test('perimeter of a rounded rect replaces corners with quarter circles', () => {
  expect(roundedRectPerimeter(100, 50, 10)).toBeCloseTo(300 - 80 + 2 * Math.PI * 10, 3);
  expect(roundedRectPerimeter(100, 50, 0)).toBe(300);
});

test('path starts at top-centre so traces begin at the top', () => {
  expect(roundedRectPath(100, 50, 10).startsWith('M 50 0')).toBe(true);
  expect(roundedRectPath(100, 50, 10, 1).startsWith('M 50 1')).toBe(true);
});

test('radius is clamped to half the shorter side', () => {
  expect(roundedRectPerimeter(40, 40, 30)).toBeCloseTo(2 * Math.PI * 20, 3);
});

import { contrastRatio } from '@/theme/contrast';
import { resolveScheme } from '@/theme/ThemeProvider';
import { feature, palette } from '@/theme/tokens';
import { typeScale } from '@/theme/typography';

test('resolveScheme honours explicit preference, else system, else light', () => {
  expect(resolveScheme('system', 'dark')).toBe('dark');
  expect(resolveScheme('system', null)).toBe('light');
  expect(resolveScheme('system', undefined)).toBe('light');
  expect(resolveScheme('light', 'dark')).toBe('light');
  expect(resolveScheme('dark', 'light')).toBe('dark');
});

test('contrastRatio matches WCAG for black on white', () => {
  expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
});

describe.each(['light', 'dark'] as const)('%s palette meets WCAG AA', (mode) => {
  const c = palette[mode];
  test('text pairs', () => {
    expect(contrastRatio(c.text, c.canvas)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(c.textSecondary, c.canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.textSecondary, c.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.link, c.canvas)).toBeGreaterThanOrEqual(4.5);
  });
  test('filled surfaces', () => {
    expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onSecondary, c.secondary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.idCardText, c.idCardBg)).toBeGreaterThanOrEqual(4.5);
  });
  test('destructive actions', () => {
    expect(contrastRatio(c.onDanger, c.dangerText)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.dangerText, c.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.dangerText, c.canvas)).toBeGreaterThanOrEqual(4.5);
  });
});

test('every feature tile ink is readable on its fill', () => {
  for (const f of Object.values(feature)) expect(contrastRatio(f.ink, f.fill)).toBeGreaterThanOrEqual(4.5);
});

test('every type style leaves room for Thai marks (line height ≥ 1.2×)', () => {
  for (const v of Object.values(typeScale)) expect(v.lineHeight / v.fontSize).toBeGreaterThanOrEqual(1.2);
});

import { composite, contrastRatio } from '@/theme/contrast';
import { resolveScheme } from '@/theme/ThemeProvider';
import { features, palette } from '@/theme/tokens';
import { lineHeightFor, typeScale } from '@/theme/typography';

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

test('composite blends a translucent layer onto its backdrop', () => {
  expect(composite('rgba(255,255,255,0.5)', '#000000')).toBe('#808080');
  expect(composite('#ffffff', '#000000', 0)).toBe('#000000');
});

describe.each(['light', 'dark'] as const)('%s palette meets WCAG AA', (mode) => {
  const c = palette[mode];
  // Worst cases: the brightest ambient orb at full strength, bare and under frosted glass.
  const glows = c.ambient.map((orb) => composite(orb, c.canvas, c.ambientOpacity));
  const backdrops = [c.canvas, c.card, ...glows, ...glows.map((g) => composite(c.glass, g)), ...glows.map((g) => composite(c.glassStrong, g))];

  test('text pairs on every backdrop', () => {
    for (const bg of backdrops) {
      expect(contrastRatio(c.text, bg)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(c.textSecondary, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.link, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.successText, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.dangerText, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
  test('text stays readable on a frozen (frosted) card', () => {
    for (const g of glows) {
      const frozen = composite(c.frost, composite(c.glass, g), c.frostAlpha);
      expect(contrastRatio(c.text, frozen)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(c.textSecondary, frozen)).toBeGreaterThanOrEqual(4.5);
    }
  });
  test('filled surfaces', () => {
    expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onSecondary, c.secondary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onDanger, c.dangerText)).toBeGreaterThanOrEqual(4.5);
  });
  test('student pass text is readable on every gradient stop', () => {
    for (const stop of c.idCard) expect(contrastRatio(c.idCardText, stop)).toBeGreaterThanOrEqual(7);
    expect(c.idCard).toContain(c.idCardBg);
  });
  test('every feature ink is readable on its pastel fill', () => {
    for (const f of Object.values(features[mode])) expect(contrastRatio(f.ink, f.fill)).toBeGreaterThanOrEqual(4.5);
  });
});

test('every type style is at least as tall as its font needs, so Thai marks are never clipped', () => {
  for (const v of Object.values(typeScale)) expect(v.lineHeight).toBeGreaterThanOrEqual(lineHeightFor(v.fontSize, v.fontFamily));
});

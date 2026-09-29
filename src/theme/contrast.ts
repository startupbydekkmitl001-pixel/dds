/** WCAG 2.x contrast ratio between two #rrggbb colours. */
function channels(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255) as [number, number, number];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const toHex = (v: number) =>
  Math.round(Math.min(1, Math.max(0, v)) * 255)
    .toString(16)
    .padStart(2, '0');

/**
 * The opaque colour you see when a translucent layer sits on `under`.
 * `over` is `rgba(r,g,b,a)` or `#rrggbb` with a separate alpha.
 */
export function composite(over: string, under: string, alpha?: number): string {
  let rgb: [number, number, number];
  let a = alpha ?? 1;
  const m = over.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((p) => parseFloat(p));
    rgb = [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    if (alpha === undefined && parts.length > 3) a = parts[3];
  } else {
    rgb = channels(over);
  }
  const base = channels(under);
  return `#${rgb.map((v, i) => toHex(v * a + base[i] * (1 - a))).join('')}`;
}

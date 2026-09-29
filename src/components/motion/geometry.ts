/** Geometry for rounded-rect border traces. */

function clampRadius(w: number, h: number, r: number): number {
  return Math.max(0, Math.min(r, w / 2, h / 2));
}

export function roundedRectPerimeter(w: number, h: number, r: number): number {
  const rr = clampRadius(w, h, r);
  return 2 * (w + h) - 8 * rr + 2 * Math.PI * rr;
}

/** SVG path of a rounded rect, starting at top-centre and running clockwise. */
export function roundedRectPath(w: number, h: number, r: number, inset = 0): string {
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const rr = clampRadius(x1 - x0, y1 - y0, r - inset);
  return [
    `M ${w / 2} ${y0}`,
    `H ${x1 - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x1} ${y0 + rr}`,
    `V ${y1 - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x1 - rr} ${y1}`,
    `H ${x0 + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x0} ${y1 - rr}`,
    `V ${y0 + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x0 + rr} ${y0}`,
    'Z',
  ].join(' ');
}

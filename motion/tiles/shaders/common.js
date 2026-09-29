/**
 * Shared GLSL for every tile loop. A scene file supplies `sceneColor(uv, ph)`,
 * where uv is centred (y in [-0.5, 0.5]) and ph is the loop phase in [0, 1).
 *
 * Loop rule: every time-varying term is a whole number of cycles per loop
 * (sin(TAU * n * ph + ...), n an integer), so frame 180 is exactly frame 0.
 */
window.TILE = window.TILE || { scenes: {} };

window.TILE.header = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform vec2 uOrigin;
uniform float uPhase;
out vec4 fragColor;

#define TAU 6.28318530718
#define LIN(c) pow(c, vec3(2.2))

float sat(float x) { return clamp(x, 0.0, 1.0); }
vec3 sat3(vec3 x) { return clamp(x, 0.0, 1.0); }
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sstep(float a, float b, float x) { return smoothstep(a, b, x); }

// A rectangular softbox seen in direction dir (half-extents hw x hh in gnomonic units).
// Reflected in glass and water this is what makes them read as glossy.
float softbox(vec3 rl, vec3 dir, float hw, float hh, float soft) {
  dir = normalize(dir);
  vec3 r = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
  vec3 u = cross(r, dir);
  float f = dot(rl, dir);
  if (f <= 0.02) return 0.0;
  vec2 q = vec2(dot(rl, r), dot(rl, u)) / f;
  vec2 d = abs(q) - vec2(hw, hh);
  float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  return 1.0 - smoothstep(-soft, soft, sd);
}

// Linear light -> display: mids untouched, a soft shoulder only above 0.75 so pastels stay
// luminous, gamma, then sub-LSB dither against H.264 banding.
vec3 finish(vec3 col, vec2 fc) {
  col = max(col, 0.0);
  vec3 t = max(col - 0.75, 0.0);
  col = min(col, vec3(0.75)) + t / (1.0 + 2.0 * t);
  col = pow(min(col, 1.0), vec3(1.0 / 2.2));
  col += (hash21(fc) - 0.5) * (1.6 / 255.0);
  return col;
}
`;

window.TILE.footer = `
void main() {
  vec2 fc = gl_FragCoord.xy - uOrigin;
  vec2 uv = (fc - 0.5 * uRes) / uRes.y;
  vec3 col = sceneColor(uv, uPhase);
  fragColor = vec4(finish(col, fc), 1.0);
}
`;

window.TILE.vertex = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/** '#rrggbb' -> 'LIN(vec3(r, g, b))' */
window.TILE.lin = function (hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => (v / 255).toFixed(4));
  return 'LIN(vec3(' + c.join(', ') + '))';
};

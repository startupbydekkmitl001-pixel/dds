/**
 * ใบลา — mint silk drifting in slow folds. A height-field cloth with soft creases,
 * lit by a light that circles once per loop so the sheen slides along the folds.
 */
window.TILE.scenes.leave = {
  palette: {
    light: {
      DEEP: '#25a97e',
      MID: '#7bdcab',
      LIGHT: '#f4ffe9',
      GLOW: '#d6f66f',
      SSS: '#a9ea86',
      SHADE: '#178a68',
    },
    dark: {
      DEEP: '#08281f',
      MID: '#1c7a5b',
      LIGHT: '#c6ffe0',
      GLOW: '#5be0aa',
      SSS: '#2fb98a',
      SHADE: '#04150f',
    },
  },
  glsl: `

#ifdef DARK
const float SHEEN = 1.0, DIFF_LO = 0.18, RELIEF = 0.40, EXPO = 0.66;
#else
const float SHEEN = 0.85, DIFF_LO = 0.42, RELIEF = 0.40, EXPO = 1.0;
#endif

float crease(float s, float k) { return sqrt(s * s + k * k) - k; }   // smooth |s|: rounded crests, tighter valleys

// Dominant fold direction (diagonal, rising to the right). Bent by a slow warp so the
// folds flow in S-curves rather than running straight. Phases advance whole cycles per loop.
vec2 warp(vec2 p, float a) {
  vec2 q = p;
  q.y += 0.34 * sin(p.x * 1.5 + a + 0.6);
  q.x += 0.26 * sin(p.y * 1.9 - a + 2.1);
  q.y += 0.10 * sin(p.x * 3.7 - 2.0 * a + 1.3);
  return q;
}

float fold(vec2 p, float ph) {
  float a = TAU * ph;
  vec2 q = warp(p, a);
  vec2 d1 = vec2(0.86, 0.51);
  vec2 d2 = vec2(0.99, 0.10);
  float h = 0.0;
  h += 0.85 * crease(sin(dot(q, d1) * 4.6 + a + 0.4), 0.30);    // main folds
  h += 0.22 * sin(dot(q, d2) * 9.0 - a * 2.0 + 1.1);            // fine ripples riding on them
  h += 0.30 * sin(dot(q, vec2(-0.5, 0.86)) * 2.3 + a + 2.5);    // broad swell
  return h;
}

// Fibre direction of the silk: slowly turning, so the sheen sweeps around the folds smoothly.
vec3 fibre(vec2 p, float a) {
  float ang = 0.55 + 0.30 * sin(p.x * 1.4 + a) + 0.20 * sin(p.y * 2.1 - a + 1.0);
  return vec3(cos(ang), sin(ang), 0.0);
}

vec3 sceneColor(vec2 uv, float ph) {
  float a = TAU * ph;
  vec2 p = uv * 1.25 + vec2(0.0, 0.05);
  float e = 0.004;
  float h0 = fold(p, ph);
  float hx = fold(p + vec2(e, 0.0), ph) - fold(p - vec2(e, 0.0), ph);
  float hy = fold(p + vec2(0.0, e), ph) - fold(p - vec2(0.0, e), ph);
  vec2 g = vec2(hx, hy) / (2.0 * e);
  float w = 0.03;
  float lap = (fold(p + vec2(w, 0.0), ph) + fold(p - vec2(w, 0.0), ph)
             + fold(p + vec2(0.0, w), ph) + fold(p - vec2(0.0, w), ph) - 4.0 * h0) / (w * w);

  vec3 n = normalize(vec3(-g * RELIEF, 1.0));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3(cos(a) * 0.75, 0.50 + 0.22 * sin(a), 0.50));   // circles once per loop
  vec3 Hh = normalize(L + V);

  float diff = pow(sat(dot(n, L) * 0.5 + 0.5), 1.25);

  // Silk sheen: streaks along the fibre direction (Kajiya-Kay), projected onto the surface.
  vec3 T = fibre(p, a);
  T = normalize(T - n * dot(T, n));
  float tH = dot(T, Hh);
  float s2 = sqrt(max(1.0 - tH * tH, 0.0));
  float sheen = pow(s2, 28.0) * 0.8 + pow(s2, 8.0) * 0.25;
  float slope = 1.0 - n.z;

  vec3 albedo = mix(C_DEEP, C_MID, sstep(-0.5, 0.7, h0 * 0.6 + diff * 0.7));
  vec3 col = albedo * mix(DIFF_LO, 1.12, diff);
  col = mix(col, C_SHADE, sat(lap * 0.007) * 0.62);                 // creases collect shadow
  col += C_SSS * 0.30 * sat(1.0 - diff) * sat(slope * 2.5);        // light glowing through thin folds
  col += C_GLOW * 0.30 * sstep(0.35, 1.0, diff);                   // warm lime on the lit crests
  col += C_LIGHT * SHEEN * sheen * sat(diff * 1.5) * sat(0.4 + slope * 2.0);
  col += C_LIGHT * 0.10 * pow(slope, 1.5);

  float calm = exp(-length((uv - vec2(-0.68, 0.36)) * vec2(1.0, 1.7)) * 2.0);   // quiet icon corner
  col = mix(col, mix(C_MID, C_LIGHT, 0.4), calm * 0.30);
  col *= 1.0 - 0.12 * sstep(0.3, 1.1, length(uv * vec2(0.9, 1.6)));
  return col * EXPO;
}
`,
};

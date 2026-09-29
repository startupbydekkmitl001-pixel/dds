/**
 * พฤติกรรม — blue glass spheres and coins turning slowly in front of soft bokeh.
 * A small refractive ray-marcher: rays bend through every surface, absorb as they
 * travel inside, and the backdrop is refracted (inverted, magnified) through the glass.
 */
window.TILE.scenes.behavior = {
  palette: {
    light: {
      BGTOP: '#dcebff',
      BGBOT: '#78aaf6',
      ENVLOW: '#a9c9fb',
      ENVHIGH: '#e9f3ff',
      LIGHT: '#ffffff',
      BOKEH: '#ffffff',
      GLOW: '#8fbcf5',
    },
    dark: {
      BGTOP: '#12294f',
      BGBOT: '#050b1d',
      ENVLOW: '#0a1630',
      ENVHIGH: '#1d3f78',
      LIGHT: '#cfe4ff',
      BOKEH: '#5b93e6',
      GLOW: '#4f86e0',
    },
  },
  glsl: `
const vec3 CAM = vec3(0.0, 0.0, 6.0);
const float FOCAL = 1.9;
const float IOR = 1.46;
#ifdef DARK
const vec3 ABS_BASE = vec3(0.9, 0.35, 0.04);
const float KEY = 4.5;
#else
const vec3 ABS_BASE = vec3(2.5, 1.0, 0.09);
const float KEY = 4.2;
#endif

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }

// A coin: a rounded cylinder whose axis is local y.
float sdCoin(vec3 q, float R, float h, float rr) {
  vec2 d = vec2(length(q.xz) - (R - rr), abs(q.y) - (h - rr));
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rr;
}

// Scene: x = distance, y = object id. Every position and angle repeats each loop.
vec2 map(vec3 p, float ph) {
  float a = TAU * ph;
  vec2 res = vec2(1e5, 0.0);
  float d;

  d = length(p - vec3(-1.62 + 0.06 * cos(a), 0.02 + 0.10 * sin(a + 0.4), 0.0)) - 0.60;
  if (d < res.x) res = vec2(d, 1.0);

  d = sdCoin(rotZ(0.42) * rotX(a + 0.6) * (p - vec3(-0.50, 0.26 + 0.06 * sin(2.0 * a), 0.35)), 0.60, 0.085, 0.06);
  if (d < res.x) res = vec2(d, 2.0);

  d = length(p - vec3(0.55, -0.22 + 0.08 * sin(a + 2.1), -0.55)) - 0.50;
  if (d < res.x) res = vec2(d, 3.0);

  d = sdCoin(rotZ(-0.5) * rotY(2.0 * a + 1.0) * (p - vec3(1.42, 0.30 + 0.05 * cos(a), 0.2)), 0.50, 0.075, 0.055);
  if (d < res.x) res = vec2(d, 4.0);

  d = length(p - vec3(2.30 + 0.05 * sin(a), -0.10 + 0.07 * cos(a + 1.0), -0.25)) - 0.34;
  if (d < res.x) res = vec2(d, 5.0);

  d = sdCoin(rotZ(0.9) * rotX(-a + 2.4) * (p - vec3(-2.45, -0.34 + 0.05 * sin(a + 1.5), 0.25)), 0.36, 0.06, 0.045);
  if (d < res.x) res = vec2(d, 6.0);

  return res;
}

vec3 calcN(vec3 p, float ph) {
  const vec2 e = vec2(0.0015, -0.0015);
  return normalize(e.xyy * map(p + e.xyy, ph).x + e.yyx * map(p + e.yyx, ph).x +
                   e.yxy * map(p + e.yxy, ph).x + e.xxx * map(p + e.xxx, ph).x);
}

// Sign flips the field so the same march works from inside the glass.
vec2 march(vec3 ro, vec3 rd, float sgn, float ph) {
  float t = 0.0;
  for (int i = 0; i < 80; i++) {
    vec2 m = map(ro + rd * t, ph);
    float d = m.x * sgn;
    if (d < 0.0008) return vec2(t, m.y);
    t += d;
    if (t > 16.0) break;
  }
  return vec2(-1.0, 0.0);
}

vec3 absorbOf(float id) {
  if (id > 5.5) return ABS_BASE * 2.0;     // little coin: needs to read at a distance
  if (id > 4.5) return ABS_BASE * 1.6;
  if (id > 3.5) return ABS_BASE * 2.6;     // coins are thin, so absorb harder
  if (id > 2.5) return ABS_BASE * 1.1;
  if (id > 1.5) return ABS_BASE * 2.8;
  return ABS_BASE;
}

vec3 envRefl(vec3 d) {
  vec3 base = mix(C_ENVLOW, C_ENVHIGH, sstep(-0.6, 0.9, d.y));
  float k1 = softbox(d, vec3(-0.45, 0.65, 0.60), 0.45, 0.25, 0.06);
  float k2 = softbox(d, vec3(0.85, 0.15, 0.45), 0.12, 0.60, 0.05);
  float k3 = softbox(d, vec3(0.05, -0.80, 0.55), 0.60, 0.15, 0.10);
  return base + C_LIGHT * (KEY * k1 + 0.7 * KEY * k2 + 0.10 * KEY * k3);
}

// Soft studio backdrop: a vertical gradient with slowly drifting out-of-focus discs.
vec3 backdrop(vec2 uv, float ph, float seenThroughGlass) {
  float a = TAU * ph;
  vec3 col = mix(C_BGBOT, C_BGTOP, sstep(-0.55, 0.55, uv.y));
  col += C_LIGHT * 0.10 * exp(-length((uv - vec2(-0.5, 0.35)) * vec2(0.8, 1.3)) * 1.6);
  // Lights behind the glass: refracted, they become the bright caustic spots inside each object.
  col += seenThroughGlass * C_LIGHT * 0.9 * (1.0 - sstep(0.0, 0.03, abs(uv.y - 0.40) - 0.03)) * (1.0 - sstep(0.6, 1.5, abs(uv.x + 0.1)));
  col += seenThroughGlass * C_LIGHT * 0.55 * exp(-length((uv - vec2(0.55, -0.42)) * vec2(1.0, 2.6)) * 4.0);
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    vec2 h = vec2(hash21(vec2(fi, 1.7)), hash21(vec2(fi, 4.3)));
    vec2 c = (h - 0.5) * vec2(2.4, 1.3) + 0.04 * vec2(sin(a + fi * 1.9), cos(a + fi * 2.7));
    float r = 0.06 + 0.11 * hash21(vec2(fi, 9.1));
    float dd = length(uv - c);
    float disc = 1.0 - sstep(r * 0.8, r, dd);
    float ring = exp(-pow((dd - r * 0.92) / (r * 0.10), 2.0));
    col += C_BOKEH * (disc * 0.07 + ring * 0.09);
  }
  return col;
}

vec3 bgAt(vec3 ro, vec3 rd, float ph, float seenThroughGlass) {
  if (rd.z < -1e-3) {
    float t = (-9.0 - ro.z) / rd.z;
    return backdrop((ro.xy + rd.xy * t) / 7.9, ph, seenThroughGlass);
  }
  return envRefl(rd) * 0.9;
}

vec3 sceneColor(vec2 uv, float ph) {
  vec3 ro = CAM;
  vec3 rd = normalize(vec3(uv, -FOCAL));
  vec3 col = vec3(0.0);
  vec3 tp = vec3(1.0);
  float sgn = 1.0;
  bool done = false;
  float thru = 0.0;                             // 1 once the ray has crossed any glass surface

  for (int b = 0; b < 7; b++) {
    vec2 hit = march(ro, rd, sgn, ph);
    if (hit.x < 0.0) { col += tp * bgAt(ro, rd, ph, thru); done = true; break; }
    vec3 p = ro + rd * hit.x;
    vec3 gn = calcN(p, ph);
    if (sgn < 0.0) tp *= exp(-absorbOf(hit.y) * hit.x);
    vec3 nf = gn * sgn;                         // always faces the incoming ray (gn points out of the glass)
    float cosi = sat(dot(-rd, nf));
    float F = 0.04 + 0.96 * pow(1.0 - cosi, 5.0);
    if (sgn > 0.0) col += tp * F * envRefl(reflect(rd, nf));
    vec3 rf = refract(rd, nf, sgn > 0.0 ? 1.0 / IOR : IOR);
    if (dot(rf, rf) < 0.5) {                    // total internal reflection
      rd = reflect(rd, nf);
      ro = p + nf * 0.004;
      continue;
    }
    tp *= (1.0 - F);
    thru = 1.0;
    rd = rf;
    sgn = -sgn;
    ro = p - nf * 0.004;
  }
  if (!done) col += tp * bgAt(ro, rd, ph, thru) * 0.6;

  float calm = exp(-length((uv - vec2(-0.7, 0.36)) * vec2(1.0, 1.7)) * 2.2);   // quiet icon corner
  return mix(col, backdrop(uv, ph, 0.0), calm * 0.25);
}
`,
};

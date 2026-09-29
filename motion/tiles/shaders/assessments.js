/**
 * แบบประเมิน — three silk ribbons twisting over a warm glow, with one soft flare
 * gliding along the front ribbon and a few points that twinkle in turn.
 */
window.TILE.scenes.assessments = {
  palette: {
    light: {
      BGTOP: '#fff6e8',
      BGBOT: '#ffcfb2',
      LIGHT: '#fffaf0',
      G0L: '#ffd88a', G0D: '#f0a03c',   // gold
      G1L: '#ffb08e', G1D: '#ea6a52',   // coral
      G2L: '#ff9bbb', G2D: '#dc4a86',   // pink
      SHADOW: '#c2566b',
    },
    dark: {
      BGTOP: '#3b281b',
      BGBOT: '#150c08',
      LIGHT: '#ffe2bd',
      G0L: '#dc9a3a', G0D: '#4d3009',
      G1L: '#d8654c', G1D: '#4d1812',
      G2L: '#d4508a', G2D: '#4a1233',
      SHADOW: '#000000',
    },
  },
  glsl: `
#ifdef DARK
const float SHADOW_AMT = 0.55, SHEEN = 0.9, SHEEN_BROAD = 0.05, BODY = 0.62, RIM = 0.32, FLARE = 1.5;
#else
const float SHADOW_AMT = 0.26, SHEEN = 0.9, SHEEN_BROAD = 0.22, BODY = 1.0, RIM = 0.55, FLARE = 1.1;
#endif

// One ribbon: centreline, width and twist are all sums of whole-cycle sines.
// Returns (coverage, v across the width in [-1,1]); twist and side land in the outputs.
float ribbonAt(vec2 p, float a, int id, out float v, out float twist, out vec2 tan2) {
  float A, k, n, ph0, yo, w0, tw;
  if (id == 0)      { A = 0.20; k = 3.1; n = 1.0;  ph0 = 0.7; yo = 0.03;  w0 = 0.26; tw = 1.5; }
  else if (id == 1) { A = 0.24; k = 2.7; n = -1.0; ph0 = 2.4; yo = -0.08; w0 = 0.23; tw = 1.9; }
  else              { A = 0.18; k = 3.4; n = 1.0;  ph0 = 4.1; yo = -0.19; w0 = 0.21; tw = 2.2; }
  float x = p.x;
  float yc = yo + A * sin(k * x + n * a + ph0) + 0.07 * sin(2.3 * k * x - n * a * 2.0 + ph0 * 1.7);
  float dyc = A * k * cos(k * x + n * a + ph0) + 0.07 * 2.3 * k * cos(2.3 * k * x - n * a * 2.0 + ph0 * 1.7);
  twist = tw * sin(1.15 * k * x + n * a + ph0 * 0.6) + 0.5 * sin(0.7 * k * x - a + ph0);
  float hw = w0 * (0.16 + 0.84 * abs(cos(twist)));
  float dperp = (p.y - yc) / sqrt(1.0 + dyc * dyc);
  v = dperp / max(hw, 1e-3);
  tan2 = normalize(vec2(1.0, dyc));
  return 1.0 - sstep(1.0 - 0.02, 1.0 + 0.02, abs(v));
}

vec3 shadeRibbon(vec2 p, float a, int id, float v, float twist, vec2 tan2, vec3 L, vec3 cl, vec3 cd) {
  vec2 b2 = vec2(-tan2.y, tan2.x);
  float th = twist + 0.55 * v;                                 // a little bulge across the width
  vec3 n = vec3(sin(th) * b2, cos(th));
  bool back = n.z < 0.0;
  if (back) n = -n;
  vec3 V = vec3(0.0, 0.0, 1.0);
  float diff = pow(sat(dot(n, L) * 0.55 + 0.45), 1.15);
  vec3 T = vec3(tan2, 0.0);
  vec3 Hh = normalize(L + V);
  float tH = dot(T, Hh);
  float s2 = sqrt(max(1.0 - tH * tH, 0.0));
  float sheen = pow(s2, 30.0) * 0.8 + pow(s2, 9.0) * SHEEN_BROAD;
  vec3 col = mix(cd, cl, diff) * BODY;
  if (back) col = mix(col, cd, 0.35);                          // the reverse side sits a shade deeper
  col += C_LIGHT * SHEEN * sheen * sat(diff * 1.4);
  col += C_LIGHT * RIM * exp(-pow((abs(v) - 1.0) / 0.10, 2.0)) * (back ? 0.4 : 1.0);   // rim catching light
  return col;
}

vec3 sceneColor(vec2 uv, float ph) {
  float a = TAU * ph;
  vec2 p = rot(-0.30) * uv * 1.15;                              // ribbons run diagonally, low left to high right
  vec3 L = normalize(vec3(-0.45, 0.55, 0.70));

  vec3 col = mix(C_BGBOT, C_BGTOP, sstep(-0.55, 0.55, uv.y));
  col += C_LIGHT * 0.16 * exp(-length((uv - vec2(-0.45, 0.32)) * vec2(0.8, 1.3)) * 1.5);

  // Back to front: gold, coral, pink. Each one throws a soft shadow on the layers below.
  for (int i = 0; i < 3; i++) {
    float v, tw; vec2 t2;
    float cov = ribbonAt(p, a, i, v, tw, t2);
    // shadow of this ribbon, offset down-right, onto what is already painted
    float v2, tw2; vec2 t22;
    vec2 off = vec2(0.035, -0.055);
    float sh = ribbonAt(p - off, a, i, v2, tw2, t22);
    float soft = 0.0;
    for (int j = 0; j < 4; j++) {
      float fj = float(j) - 1.5;
      float vv, tt; vec2 t3;
      soft += ribbonAt(p - off + vec2(0.0, fj * 0.012), a, i, vv, tt, t3);
    }
    col = mix(col, C_SHADOW, SHADOW_AMT * soft * 0.25 * (1.0 - cov));
    vec3 cl = i == 0 ? C_G0L : (i == 1 ? C_G1L : C_G2L);
    vec3 cd = i == 0 ? C_G0D : (i == 1 ? C_G1D : C_G2D);
    vec3 rc = shadeRibbon(p, a, i, v, tw, t2, L, cl, cd);
    col = mix(col, rc, cov);
  }

  // A flare rides the front ribbon once per loop; its ends fade so the loop closes silently.
  {
    float v, tw; vec2 t2;
    float fx = mix(-0.55, 0.55, ph);
    float A = 0.18, k = 3.4, n = 1.0, ph0 = 4.1, yo = -0.19;
    float yc = yo + A * sin(k * fx + n * a + ph0) + 0.07 * sin(2.3 * k * fx - n * a * 2.0 + ph0 * 1.7);
    vec2 d = p - vec2(fx, yc);
    float env = pow(sin(PI_() * ph), 2.0);
    float f = exp(-abs(d.x) * 7.0) * exp(-abs(d.y) * 46.0)
            + 0.55 * exp(-abs(d.y) * 7.0) * exp(-abs(d.x) * 46.0)
            + 0.9 * exp(-length(d) * 34.0);
    col += C_LIGHT * FLARE * env * f;
  }
  // Twinkling points.
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    vec2 c = (vec2(hash21(vec2(fi, 3.1)), hash21(vec2(fi, 7.7))) - 0.5) * vec2(1.7, 0.85);
    float tw2 = pow(sat(sin(TAU * (ph + hash21(vec2(fi, 1.3))))), 10.0);
    float r = length(uv - c);
    col += C_LIGHT * tw2 * (exp(-r * 90.0) * 0.9 + exp(-abs(uv.x - c.x) * 60.0) * exp(-abs(uv.y - c.y) * 12.0) * 0.20);
  }

  float calm = exp(-length((uv - vec2(-0.68, 0.36)) * vec2(1.0, 1.7)) * 2.0);   // quiet icon corner
  col = mix(col, mix(C_BGTOP, C_LIGHT, 0.2), calm * 0.30);
  return col;
}
`.replace(/PI_\(\)/g, '3.14159265'),
};

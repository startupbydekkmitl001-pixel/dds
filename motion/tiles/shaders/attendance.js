/**
 * เวลาเรียน — a glass sphere rocking in lavender water. Ripples leave its
 * waterline like a steady heartbeat: two rings per loop, a finer set at three.
 */
window.TILE.scenes.attendance = {
  palette: {
    light: {
      DEEP: '#8672f2',
      MID: '#c3b7fc',
      LIGHT: '#fdfbff',
      GLOW: '#dcd2ff',
      ENVLOW: '#d7cefb',
      ENVHIGH: '#f8f5ff',
      ABS: '#5a3bd0', // used as an absorption tint (see ABSORB below)
    },
    dark: {
      DEEP: '#231c68',
      MID: '#5246c9',
      LIGHT: '#d9d3ff',
      GLOW: '#9184f5',
      ENVLOW: '#171346',
      ENVHIGH: '#3a3192',
      ABS: '#6f5cf0',
    },
  },
  glsl: `

const float R = 0.50;
const float SPH_Y = 0.19;
const float R0 = 0.46;                // waterline radius for a centre height of 0.19
const vec3 CAM = vec3(0.0, 3.45, 3.95);
const vec3 TGT = vec3(0.0, 0.02, 0.0);
#ifdef DARK
const float KEY_GAIN = 1.5, RIM_GAIN = 1.2, WATER_LIGHT = 0.5;
const vec3 ABSORB = vec3(0.45, 0.8, 0.10);
#else
const float KEY_GAIN = 1.25, RIM_GAIN = 0.9, WATER_LIGHT = 0.85;
const vec3 ABSORB = vec3(0.14, 0.42, 0.04);
#endif

vec3 skyEnv(vec3 d) {
  float up = sstep(-0.25, 1.0, d.y);
  vec3 sky = mix(C_ENVLOW, C_ENVHIGH, up);
  float key = softbox(d, vec3(-0.45, 0.62, 0.55), 0.42, 0.24, 0.06);
  float rim = softbox(d, vec3(0.85, 0.30, -0.15), 0.10, 0.55, 0.04);
  return sky + C_LIGHT * (key * KEY_GAIN + rim * RIM_GAIN);
}

// Ripple height by radius from the sphere: outward rings, whole cycles per loop.
float rippleH(float r, float ph) {
  float k = sstep(R0, R0 + 0.10, r);
  float h = 0.064 * exp(-(r - R0) * 1.0) * sin(TAU * (r / 0.58 - 3.0 * ph))
          + 0.028 * exp(-(r - R0) * 1.4) * sin(TAU * (r / 0.34 - 4.0 * ph) + 1.3);
  h *= k;
  h += 0.034 * exp(-(r - R0) * 20.0) * step(R0, r);   // meniscus lip
  return h;
}

vec3 waterN(vec2 xz, float ph) {
  float r = length(xz);
  vec2 dir = xz / max(r, 1e-4);
  float e = 0.003;
  float dh = (rippleH(r + e, ph) - rippleH(r - e, ph)) / (2.0 * e);
  vec3 n = vec3(-dh * dir.x, 1.0, -dh * dir.y);
  n.xz += 0.03 * vec2(sin(xz.y * 3.4 + TAU * ph + 0.7), cos(xz.x * 2.9 + TAU * ph));
  return normalize(n);
}

vec3 shadeWater(vec3 ro, vec3 rd, float t, float ph) {
  vec3 p = ro + rd * t;
  vec3 n = waterN(p.xz, ph);
  vec3 v = -rd;
  float F = 0.12 + 0.88 * pow(1.0 - sat(dot(n, v)), 5.0);
  vec3 refl = skyEnv(reflect(rd, n));
  float r = length(p.xz);
  float halo = exp(-r * 0.8);
  vec3 body = mix(C_DEEP, C_MID, sstep(0.0, 1.0, halo * 1.5 + 0.22));
  vec3 L = normalize(vec3(-0.5, 0.8, 0.45));
  body *= 0.62 + 0.88 * sat(dot(n, L));
  body += C_GLOW * halo * halo * 0.55 * WATER_LIGHT;
  vec3 col = mix(body, refl, F);
  col += C_LIGHT * exp(-pow((r - (R0 + 0.07)) / 0.06, 2.0)) * 0.5;   // light gathered at the sphere's foot
  col = mix(col, C_ENVHIGH, 1.0 - exp(-max(t - 4.2, 0.0) * 0.12));
  return col;
}

vec3 underwater(vec3 p, vec3 d, vec3 c) {
  vec3 nrm = normalize(p - c);
  float lit = pow(sat(dot(nrm, normalize(vec3(-0.45, 0.65, 0.6))) * 0.5 + 0.5), 1.4);
  vec3 col = mix(C_DEEP * 0.7, mix(C_MID, C_LIGHT, 0.4) * 1.2, lit);
  float focus = pow(sat(dot(nrm, normalize(vec3(0.3, -0.7, 0.55)))), 4.0);
  col += C_LIGHT * 0.75 * focus;
  col += C_GLOW * 0.3 * exp(-length(p.xz) * 2.0);
  return col;
}

vec3 background(vec3 o, vec3 d, vec3 c, float ph) {
  if (o.y > 0.0) {
    if (d.y < -1e-3) return shadeWater(o, d, -o.y / d.y, ph);
    return skyEnv(d);
  }
  return underwater(o, d, c);
}

vec3 shadeSphere(vec3 ro, vec3 rd, float ts, vec3 c, float ph) {
  vec3 p = ro + rd * ts;
  vec3 n = normalize(p - c);
  float ndv = sat(dot(n, -rd));
  float F = 0.05 + 0.95 * pow(1.0 - ndv, 4.0);
  vec3 rl = reflect(rd, n);
  vec3 refl = skyEnv(rl);
  vec3 trans = vec3(0.0);
  for (int ch = 0; ch < 3; ch++) {
    float ior = 1.42 + 0.010 * float(ch);
    vec3 t1 = refract(rd, n, 1.0 / ior);
    float len = -2.0 * dot(t1, p - c);
    vec3 po = p + t1 * len;
    vec3 n2 = normalize(po - c);
    vec3 t2 = refract(t1, -n2, ior);
    if (dot(t2, t2) < 0.5) {
      t2 = reflect(t1, -n2);
      float len2 = -2.0 * dot(t2, po - c);
      po += t2 * len2;
      len += len2;
      n2 = normalize(po - c);
      t2 = refract(t2, -n2, ior);
      if (dot(t2, t2) < 0.5) t2 = reflect(t2, -n2);
    }
    trans[ch] = background(po + t2 * 1e-3, t2, c, ph)[ch] * exp(-ABSORB[ch] * len);
  }
  float rim = pow(1.0 - ndv, 3.0);
  vec3 body = trans * (1.0 - F);
  body *= 1.0 - 0.32 * sstep(0.25, 0.8, 1.0 - ndv) * (1.0 - rim);   // shaded band just inside the rim
  return body + refl * F + C_LIGHT * rim * 0.55;
}

vec3 sceneColor(vec2 uv, float ph) {
  vec3 fwd = normalize(TGT - CAM);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.9 * fwd);
  vec3 ro = CAM;
  vec3 c = vec3(0.0, SPH_Y + 0.05 * sin(TAU * ph) + 0.012 * sin(2.0 * TAU * ph + 1.0), 0.0);   // rocks once per loop

  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float disc = b * b - (dot(oc, oc) - R * R);
  float ts = disc > 0.0 ? -b - sqrt(disc) : 1e9;
  float tp = rd.y < 0.0 ? -ro.y / rd.y : 1e9;

  vec3 col;
  if (ts > 0.0 && ts < tp) col = shadeSphere(ro, rd, ts, c, ph);
  else if (tp < 1e8) col = shadeWater(ro, rd, tp, ph);
  else col = skyEnv(rd);

  float calm = exp(-length((uv - vec2(-0.66, 0.36)) * vec2(1.0, 1.7)) * 2.2);   // quiet icon corner
  return mix(col, mix(C_ENVHIGH, C_MID, 0.25), calm * 0.35);
}
`,
};

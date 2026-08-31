export const VERT = /* glsl */ `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_sim;
uniform float u_heat;
uniform sampler2D u_field;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

vec3 heatColor(float t) {
  // 最低也是暗红熔壳，绝不走到纯黑
  t = clamp(t, 0.18, 1.0);
  vec3 c0 = vec3(0.28, 0.07, 0.02);
  vec3 c1 = vec3(0.48, 0.12, 0.03);
  vec3 c2 = vec3(0.72, 0.2, 0.04);
  vec3 c3 = vec3(0.95, 0.4, 0.08);
  vec3 c4 = vec3(1.0, 0.7, 0.28);
  vec3 c5 = vec3(1.0, 0.9, 0.58);
  if (t < 0.35) return mix(c0, c1, (t - 0.18) / 0.17);
  if (t < 0.52) return mix(c1, c2, (t - 0.35) / 0.17);
  if (t < 0.7) return mix(c2, c3, (t - 0.52) / 0.18);
  if (t < 0.88) return mix(c3, c4, (t - 0.7) / 0.18);
  return mix(c4, c5, (t - 0.88) / 0.12);
}

float sampleH(vec2 uv) {
  return texture2D(u_field, uv).r;
}

float sampleHeat(vec2 uv) {
  return texture2D(u_field, uv).g;
}

float sampleCav(vec2 uv) {
  return texture2D(u_field, uv).b;
}

vec3 calcNormal(vec2 uv) {
  vec2 e = vec2(1.0 / u_sim.x, 1.0 / u_sim.y);
  float hL = sampleH(uv - vec2(e.x, 0.0)) - sampleCav(uv - vec2(e.x, 0.0)) * 0.3;
  float hR = sampleH(uv + vec2(e.x, 0.0)) - sampleCav(uv + vec2(e.x, 0.0)) * 0.3;
  float hD = sampleH(uv - vec2(0.0, e.y)) - sampleCav(uv - vec2(0.0, e.y)) * 0.3;
  float hU = sampleH(uv + vec2(0.0, e.y)) - sampleCav(uv + vec2(0.0, e.y)) * 0.3;
  return normalize(vec3((hL - hR) * 8.2, (hD - hU) * 8.2, 1.6));
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float h = sampleH(uv);
  float extra = min(sampleHeat(uv), 0.38);
  float cav = sampleCav(uv);

  vec3 N = calcNormal(uv);
  vec2 stretchUv = uv - N.xy * h * 0.028;

  float plate = fbm(stretchUv * vec2(4.0, 3.5) + u_time * 0.022);
  float plate2 = fbm(stretchUv * vec2(8.0, 7.2) - u_time * 0.015);
  float seam = pow(1.0 - abs(plate2 - 0.5) * 2.0, 3.0);
  float micro = fbm(stretchUv * 16.0 + h * 1.5);

  float dome = smoothstep(0.02, 0.28, h);
  float domeCore = smoothstep(0.18, 0.88, h);
  // 宽柔接触影：有深度但不描黑边
  float contact = smoothstep(0.012, 0.12, h) * (1.0 - smoothstep(0.12, 0.42, h));
  float shoulder = smoothstep(0.07, 0.22, h) * (1.0 - smoothstep(0.22, 0.55, h));
  float apex = pow(domeCore, 1.35);
  float thinSpot = pow(micro, 2.4) * domeCore;

  float cavFloor = cav * 0.08;
  float cavDeep = pow(cav, 1.4);
  float cavRim = smoothstep(0.03, 0.14, cav) * (1.0 - smoothstep(0.14, 0.4, cav));

  float t = plate * 0.5 * u_heat + 0.26 + seam * 0.18 + micro * 0.045;
  t += extra * 0.7;
  t -= contact * 0.025;
  t += apex * 0.05;
  t += thinSpot * 0.055;
  t += cavFloor;
  t = clamp(t, 0.26, 0.87);

  vec3 col = heatColor(t);

  vec3 L = normalize(vec3(-0.3, 0.42, 0.86));
  vec3 V = vec3(0.0, 0.0, 1.0);
  float wrap = clamp((dot(N, L) + 0.5) / 1.5, 0.0, 1.0);
  float facing = clamp(N.z, 0.0, 1.0);
  float softSpec = pow(max(dot(reflect(-L, N), V), 0.0), 8.5);
  float broadSpec = pow(max(dot(reflect(-L, N), V), 0.0), 3.8);

  // 中等凸感：顶亮 + 根部浅影 + 柔边
  float volume = 0.92 + wrap * 0.12 + facing * apex * 0.13;
  col *= volume;
  col *= 1.0 + h * 0.1 * facing;
  col *= 1.0 - contact * 0.16;
  col = mix(col, heatColor(0.44), contact * 0.12);
  col += heatColor(0.6) * shoulder * wrap * 0.13;
  col += heatColor(0.68) * apex * 0.09;
  col += vec3(1.0, 0.52, 0.16) * softSpec * dome * 0.22 * (0.35 + 0.65 * facing);
  col += vec3(1.0, 0.42, 0.1) * broadSpec * dome * 0.08;
  col += heatColor(0.6) * thinSpot * 0.08;

  col += heatColor(min(0.76, 0.52 + extra)) * pow(extra, 1.35) * 0.22;

  // 爆裂口：深井压暗 + 撕裂唇余温（不是中心白光团）
  col *= 1.0 - cavDeep * 0.38;
  col = mix(col, heatColor(0.34), cavDeep * 0.22);
  col *= 1.0 - cavRim * 0.22;
  col += vec3(1.0, 0.28, 0.04) * cavRim * 0.35;
  col += heatColor(0.58) * pow(cav, 2.8) * 0.05;

  col += (hash(uv * u_res + u_time) - 0.5) * 0.006;
  col = max(col, vec3(0.18, 0.045, 0.015));

  float vig = smoothstep(1.25, 0.35, length(p));
  col *= 0.95 + 0.05 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

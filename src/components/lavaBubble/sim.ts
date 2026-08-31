import { clamp } from '@cos-design/shared';

export const SIM = 192;
export const MAX_DPR = 2;
export const MAX_BLISTERS = 8;

interface Crack {
  a0: number;
  a1: number;
  bend: number;
  width: number;
}

export interface Blister {
  u: number;
  v: number;
  r: number;
  maxR: number;
  z: number;
  phase: 'inflate' | 'thin' | 'burst' | 'cavity';
  t: number;
  seed: number;
  aspect: number;
  rot: number;
  inflate: number;
  thinTime: number;
  cracks: Crack[];
  tear: number;
  bias: number;
}

export interface Spatter {
  u: number;
  v: number;
  vu: number;
  vv: number;
  z: number;
  vz: number;
  life: number;
  heat: number;
  size: number;
  kind: 0 | 1 | 2; // mist | bomb | crust
}

export interface StirState {
  u: number;
  v: number;
  vu: number;
  vv: number;
}

export interface LavaSimStepOpts {
  autoSpawn: boolean;
  activity: number;
  click: { u: number; v: number } | null;
  stir: StirState | null;
}

const rand = () => Math.random();

const spawnBlister = (u: number, v: number): Blister => {
  const crackN = 3 + Math.floor(rand() * 5);
  const cracks: Crack[] = [];
  for (let i = 0; i < crackN; i++) {
    const a0 = rand() * Math.PI * 2;
    cracks.push({
      a0,
      a1: a0 + (0.3 + rand() * 1.1) * (rand() < 0.5 ? 1 : -1),
      bend: (rand() - 0.5) * 0.5,
      width: 0.004 + rand() * 0.007
    });
  }
  return {
    u,
    v,
    r: 0.04,
    maxR: 0.08 + rand() * 0.1,
    z: 0,
    phase: 'inflate',
    t: 0,
    seed: rand() * 1000,
    aspect: 0.72 + rand() * 0.5,
    rot: rand() * Math.PI,
    inflate: 0.32 + rand() * 0.35,
    thinTime: 0.6 + rand() * 0.85,
    cracks,
    tear: rand() * Math.PI * 2,
    bias: 0.25 + rand() * 0.55
  };
};

const pushSpatter = (
  list: Spatter[],
  b: Blister,
  kind: Spatter['kind'],
  ang: number,
  launch: number,
  sp: number,
  extras: Partial<Pick<Spatter, 'z' | 'vz' | 'life' | 'heat' | 'size' | 'vu' | 'vv'>>
) => {
  list.push({
    u: b.u + Math.cos(ang) * b.r * launch * b.aspect,
    v: b.v + Math.sin(ang) * b.r * launch,
    vu: extras.vu ?? Math.cos(ang) * sp,
    vv: extras.vv ?? Math.sin(ang) * sp,
    z: extras.z ?? 0.2,
    vz: extras.vz ?? 1,
    life: extras.life ?? 0.4,
    heat: extras.heat ?? 0.2,
    size: extras.size ?? 0.01,
    kind
  });
};

const autoSpawnCount = () => {
  const roll = rand();
  if (roll < 0.5) return 1;
  if (roll < 0.78) return 2;
  if (roll < 0.93) return 3;
  return 4;
};

const sampleBilinear = (field: Float32Array, x: number, y: number) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const fx = x - x0;
  const fy = y - y0;
  if (x0 < 0 || y0 < 0 || x1 >= SIM || y1 >= SIM) return 0;
  const i00 = x0 + y0 * SIM;
  const i10 = x1 + y0 * SIM;
  const i01 = x0 + y1 * SIM;
  const i11 = x1 + y1 * SIM;
  return (
    (1 - fx) * (1 - fy) * field[i00] + fx * (1 - fy) * field[i10] + (1 - fx) * fy * field[i01] + fx * fy * field[i11]
  );
};

/** 熔岩湖场仿真：高度 / 热量 / 空腔 + 气泡生命周期 */
export const createLavaSim = () => {
  const size = SIM * SIM;
  const heightField = new Float32Array(size);
  const heatF = new Float32Array(size);
  const cavityF = new Float32Array(size);
  const velU = new Float32Array(size);
  const velV = new Float32Array(size);
  const heatAdvect = new Float32Array(size);
  const pixels = new Uint8Array(size * 4);
  const blisters: Blister[] = [];
  const spatters: Spatter[] = [];
  let spawnWait = 0.6 + rand() * 1.4;

  const addHeight = (u: number, v: number, radius: number, amount: number, aspect: number, rot: number, seed = 0) => {
    const cx = u * (SIM - 1);
    const cy = v * (SIM - 1);
    const r = Math.max(radius * SIM, 1.5);
    const extent = Math.ceil(r * Math.max(aspect, 1) * 1.55);
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x <= 0 || x >= SIM - 1 || y <= 0 || y >= SIM - 1) continue;
        const lx = cos * dx + sin * dy;
        const ly = (-sin * dx + cos * dy) / aspect;
        const wobble = 0.9 + 0.1 * Math.sin(lx * 0.28 + seed) * Math.cos(ly * 0.22 + seed * 0.6);
        const d2 = (lx * lx + ly * ly) / (r * r * Math.max(0.75, wobble));
        if (d2 > 1.2) continue;
        const d = Math.sqrt(Math.max(0, d2));
        const core = Math.sqrt(Math.max(0, 1 - Math.min(1, d) * Math.min(1, d)));
        const feather = Math.pow(Math.max(0, 1 - d / 1.15), 1.6);
        const soft = core * (0.55 + 0.45 * feather);
        heightField[y * SIM + x] = Math.max(heightField[y * SIM + x], amount * soft);
      }
    }
  };

  const addHeat = (u: number, v: number, radius: number, amount: number, mode: 'add' | 'max' = 'add') => {
    const cx = u * (SIM - 1);
    const cy = v * (SIM - 1);
    const r = Math.max(radius * SIM, 0.6);
    const r2 = r * r;
    const extent = Math.ceil(r * 1.4);
    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x < 0 || x >= SIM || y < 0 || y >= SIM) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2 * 1.6) continue;
        const w = amount * Math.exp(-d2 / (r2 * 0.5));
        const i = y * SIM + x;
        if (mode === 'max') heatF[i] = Math.max(heatF[i], w);
        else heatF[i] = Math.min(0.5, heatF[i] + w);
      }
    }
  };

  const addHeatStreak = (u: number, v: number, vu: number, vv: number, radius: number, amount: number) => {
    const len = Math.hypot(vu, vv);
    if (len < 1e-4) {
      addHeat(u, v, radius, amount, 'max');
      return;
    }
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const fade = 1 - t * 0.65;
      addHeat(
        u - (vu / len) * radius * 2.2 * t,
        v - (vv / len) * radius * 2.2 * t,
        radius * (0.7 + t * 0.4),
        amount * fade,
        'max'
      );
    }
  };

  const addHeatSplash = (u: number, v: number, radius: number, amount: number) => {
    addHeat(u, v, radius * 0.55, amount * 0.7, 'add');
    const cx = u * (SIM - 1);
    const cy = v * (SIM - 1);
    const r = Math.max(radius * SIM, 1.2);
    const extent = Math.ceil(r * 1.6);
    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x < 0 || x >= SIM || y < 0 || y >= SIM) continue;
        const d = Math.sqrt(dx * dx + dy * dy);
        const ring = Math.exp(-Math.pow(d - r * 0.85, 2) / (r * r * 0.12));
        heatF[y * SIM + x] = Math.min(0.5, heatF[y * SIM + x] + amount * 0.45 * ring);
      }
    }
  };

  const addTearCavity = (b: Blister, strength: number) => {
    if (strength < 0.02) return;
    const cx = b.u * (SIM - 1);
    const cy = b.v * (SIM - 1);
    const rx = Math.max(b.r * SIM * (0.48 + b.bias * 0.2), 2.2);
    const rY = rx * (0.42 + b.bias * 0.18);
    const cos = Math.cos(b.tear);
    const sin = Math.sin(b.tear);
    const extent = Math.ceil(Math.max(rx, rY) * 1.7);
    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x < 0 || x >= SIM || y < 0 || y >= SIM) continue;
        const lx = cos * dx + sin * dy;
        const ly = -sin * dx + cos * dy;
        const jagged =
          0.7 +
          0.28 * Math.sin(lx * 0.55 + b.seed) * Math.cos(ly * 0.7 + b.seed * 0.4) +
          0.12 * Math.sin(lx * 1.4 - ly * 0.9 + b.seed);
        const d2 = (lx * lx) / (rx * rx * jagged) + (ly * ly) / (rY * rY * jagged);
        if (d2 > 1.4) continue;
        const w = Math.pow(Math.max(0, 1 - d2), 0.95) * strength;
        const i = y * SIM + x;
        cavityF[i] = Math.max(cavityF[i], w);
        if (d2 > 0.45 && d2 < 1.15) {
          heatF[i] = Math.max(heatF[i], w * 0.22 * (1.1 - d2));
        }
      }
    }
  };

  const addCrustFlaps = (b: Blister, strength: number) => {
    if (strength < 0.05) return;
    const steps = 28;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const bias = 0.65 + 0.45 * Math.cos(a - b.tear);
      const wob = 0.85 + 0.2 * Math.sin(i * 1.7 + b.seed);
      const rad = b.r * (0.55 + 0.35 * bias) * wob;
      const u = b.u + Math.cos(a) * rad * b.aspect;
      const v = b.v + Math.sin(a) * rad;
      const aspect = 0.55 + 0.25 * Math.sin(i * 2.1 + b.seed * 0.3);
      addHeight(u, v, b.r * 0.08, 0.22 * strength * bias, aspect, a, b.seed + i);
      if (bias > 0.85) addHeat(u, v, b.r * 0.05, 0.08 * strength, 'max');
    }
  };

  const addCrackHeat = (b: Blister, open: number) => {
    if (open < 0.1) return;
    for (const c of b.cracks) {
      const steps = 22;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = c.a0 + (c.a1 - c.a0) * t + Math.sin(t * Math.PI) * c.bend;
        const rad = b.r * (0.18 + t * 0.7);
        addHeat(
          b.u + Math.cos(ang + b.rot) * rad * b.aspect,
          b.v + Math.sin(ang + b.rot) * rad,
          c.width * 0.22,
          open * 0.15 * (0.3 + t * 0.7),
          'max'
        );
      }
    }
  };

  const burst = (b: Blister) => {
    b.phase = 'burst';
    b.t = 0;
    let best = b.cracks[0];
    for (const c of b.cracks) if (Math.abs(c.a1 - c.a0) > Math.abs(best.a1 - best.a0)) best = c;
    b.tear = (best.a0 + best.a1) * 0.5 + (rand() - 0.5) * 0.25;

    addTearCavity(b, 1);
    addHeat(b.u, b.v, b.r * 0.12, 0.16, 'max');
    for (const c of b.cracks) {
      const steps = 14;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = c.a0 + (c.a1 - c.a0) * t + Math.sin(t * Math.PI) * c.bend;
        const rad = b.r * (0.2 + t * 0.75);
        addHeat(
          b.u + Math.cos(ang + b.rot) * rad * b.aspect,
          b.v + Math.sin(ang + b.rot) * rad,
          c.width * 0.4,
          0.18 * (0.4 + t * 0.6),
          'max'
        );
      }
    }

    const mistN = 10 + Math.floor(rand() * 8);
    for (let i = 0; i < mistN; i++) {
      const ang = b.tear + (rand() - 0.5) * (0.9 + b.bias * 0.5);
      const sp = (0.55 + rand() * 0.95) * (0.9 + b.bias * 0.25);
      pushSpatter(spatters, b, 0, ang, 0.2 + rand() * 0.55, sp, {
        z: 0.15 + rand() * 0.35,
        vz: 1.4 + rand() * 1.8,
        life: 0.22 + rand() * 0.25,
        heat: 0.22 + rand() * 0.14,
        size: 0.003 + rand() * 0.006
      });
    }

    const bombN = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < bombN; i++) {
      const ang = b.tear + (rand() - 0.5) * (0.7 + b.bias * 0.4);
      const sp = 0.18 + rand() * 0.42;
      pushSpatter(spatters, b, 1, ang, 0.15 + rand() * 0.4, sp, {
        vu: Math.cos(ang) * sp * (0.7 + rand() * 0.5),
        vv: Math.sin(ang) * sp * (0.7 + rand() * 0.5),
        z: 0.35 + rand() * 0.5,
        vz: 0.55 + rand() * 1.1,
        life: 0.6 + rand() * 0.55,
        heat: 0.2 + rand() * 0.14,
        size: 0.01 + rand() * 0.018
      });
    }

    const crustN = 6 + Math.floor(rand() * 5);
    for (let i = 0; i < crustN; i++) {
      const ang = b.tear + Math.PI + (rand() - 0.5) * 2.0;
      const sp = 0.08 + rand() * 0.28;
      pushSpatter(spatters, b, 2, ang, 0.35 + rand() * 0.4, sp, {
        z: 0.12 + rand() * 0.35,
        vz: 0.25 + rand() * 0.7,
        life: 0.55 + rand() * 0.5,
        heat: 0.03 + rand() * 0.06,
        size: 0.012 + rand() * 0.024
      });
    }
  };

  const pickSpawnPoint = () => {
    for (let tryN = 0; tryN < 8; tryN++) {
      const u = 0.12 + rand() * 0.76;
      const v = 0.12 + rand() * 0.76;
      let ok = true;
      for (const b of blisters) {
        const du = (b.u - u) * 1.2;
        const dv = b.v - v;
        if (du * du + dv * dv < 0.045) {
          ok = false;
          break;
        }
      }
      if (ok) return { u, v };
    }
    return { u: 0.2 + rand() * 0.6, v: 0.2 + rand() * 0.6 };
  };

  const updateBlister = (b: Blister, dt: number, rate: number) => {
    b.t += dt * rate;
    if (b.phase === 'inflate') {
      b.z = clamp(b.z + dt * rate * b.inflate * (1.15 - b.z * 0.55), 0, 1);
      b.r = b.maxR * (0.22 + Math.pow(b.z, 0.85) * 0.78);
      const open = Math.pow(Math.max(0, b.z - 0.28) / 0.72, 1.5);
      addHeight(b.u, b.v, b.r, 0.7 + b.z * 0.6, b.aspect, b.rot, b.seed);
      addCrackHeat(b, open);
      if (b.z >= 1) {
        b.phase = 'thin';
        b.t = 0;
      }
      return;
    }
    if (b.phase === 'thin') {
      b.r += dt * rate * 0.008;
      addHeight(b.u, b.v, b.r, 1.18, b.aspect, b.rot, b.seed);
      addCrackHeat(b, 0.65 + Math.min(0.3, b.t * 0.35));
      if (b.t > b.thinTime) burst(b);
      return;
    }
    if (b.phase === 'burst') {
      const flash = Math.max(0, 1 - b.t * 6);
      addTearCavity(b, 0.9 + flash * 0.1);
      addCrustFlaps(b, 0.7 + flash * 0.3);
      addHeat(b.u, b.v, b.r * 0.1, flash * 0.1, 'max');
      if (b.t > 0.1) {
        b.phase = 'cavity';
        b.t = 0;
      }
      return;
    }
    const fill = clamp(b.t / 1.55, 0, 1);
    const strength = Math.pow(1 - fill, 1.05);
    addTearCavity(b, strength);
    addCrustFlaps(b, strength * (1 - fill * 0.6));
    if (fill > 0.2 && fill < 0.4) {
      const jet = Math.sin(((fill - 0.2) / 0.2) * Math.PI);
      addHeat(b.u, b.v, b.r * 0.1, jet * 0.14, 'max');
      addHeight(b.u, b.v, b.r * 0.1, jet * 0.22, 0.75, b.tear, b.seed);
    }
    if (fill > 0.7) addHeat(b.u, b.v, b.r * 0.35, 0.04 * (1 - fill), 'max');
    if (b.t > 1.65) b.t = 99;
  };

  const updateSpatter = (s: Spatter, dt: number) => {
    const drag = s.kind === 0 ? 2.2 : 1.5;
    s.vu *= Math.exp(-dt * drag);
    s.vv *= Math.exp(-dt * drag);
    s.u += s.vu * dt;
    s.v += s.vv * dt;
    s.vz -= (s.kind === 0 ? 5.2 : s.kind === 1 ? 3.6 : 2.8) * dt;
    s.z += s.vz * dt;
    if (s.z > 0) {
      if (s.kind !== 2) {
        addHeatStreak(s.u, s.v, s.vu, s.vv, s.size * (0.6 + s.z * 0.55), s.heat * 0.1 * Math.min(1, s.z + 0.15));
      }
    } else {
      s.z = 0;
      if (s.kind === 2) {
        addHeat(s.u, s.v, s.size * 1.4, 0.035, 'max');
      } else {
        const len = Math.hypot(s.vu, s.vv) || 1;
        addHeatSplash(s.u, s.v, s.size * (s.kind === 0 ? 1.2 : 1.8), s.heat * (s.kind === 0 ? 0.14 : 0.22));
        addHeatStreak(s.u, s.v, s.vu / len, s.vv / len, s.size * 1.6, s.heat * 0.12);
      }
      s.life = 0;
    }
    s.life -= dt * (s.kind === 0 ? 1.6 : 0.9);
  };

  const diffuseHeat = () => {
    for (let y = 1; y < SIM - 1; y++) {
      for (let x = 1; x < SIM - 1; x++) {
        const i = x + y * SIM;
        const avg = (heatF[i - 1] + heatF[i + 1] + heatF[i - SIM] + heatF[i + SIM]) * 0.25;
        heatF[i] = Math.min(0.48, heatF[i] * 0.96 + avg * 0.04);
      }
    }
  };

  const injectVortex = (u: number, v: number, vu: number, vv: number) => {
    const speed = Math.hypot(vu, vv);
    if (speed < 1e-5) return;
    const cx = u * (SIM - 1);
    const cy = v * (SIM - 1);
    const radius = (0.055 + speed * 0.09) * SIM;
    const r2 = radius * radius;
    const extent = Math.ceil(radius * 1.15);
    const twist = speed * 14;

    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > r2 || d2 < 0.25) continue;
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x < 1 || x >= SIM - 1 || y < 1 || y >= SIM - 1) continue;
        const d = Math.sqrt(d2);
        const tx = -dy / d;
        const ty = dx / d;
        const falloff = Math.exp(-d2 / (r2 * 0.32));
        const i = y * SIM + x;
        velU[i] += tx * twist * falloff;
        velV[i] += ty * twist * falloff;
        velU[i] -= (dx / d) * speed * 1.8 * falloff;
        velV[i] -= (dy / d) * speed * 1.8 * falloff;
      }
    }
  };

  const addVortexHeat = (u: number, v: number, vu: number, vv: number, strength: number) => {
    const speed = Math.hypot(vu, vv);
    if (speed < 1e-5 || strength < 0.02) return;
    const cx = u * (SIM - 1);
    const cy = v * (SIM - 1);
    const radius = (0.04 + speed * 0.05) * SIM;
    const r2 = radius * radius;
    const moveAng = Math.atan2(vv, vu);
    const arms = 3;
    const extent = Math.ceil(radius * 1.2);

    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const ang = Math.atan2(dy, dx);
        const spiral = ang + Math.sqrt(d2) * 0.18 - moveAng * 1.4;
        const arm = Math.pow(Math.abs(Math.sin(spiral * arms)), 0.5);
        const falloff = Math.exp(-d2 / (r2 * 0.38));
        const amount = strength * arm * falloff * 0.24;
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x < 0 || x >= SIM || y < 0 || y >= SIM) continue;
        const i = y * SIM + x;
        heatF[i] = Math.min(0.5, heatF[i] + amount);
      }
    }
  };

  const addStirShellCrack = (u: number, v: number, vu: number, vv: number, strength: number) => {
    const speed = Math.hypot(vu, vv);
    if (speed < 1e-5 || strength < 0.02) return;

    addHeatStreak(u, v, vu, vv, 0.035 + speed * 0.025, strength * 0.16);
    addVortexHeat(u, v, vu, vv, strength);

    const cx = u * (SIM - 1);
    const cy = v * (SIM - 1);
    const rx = (0.028 + speed * 0.02) * SIM;
    const ry = rx * 0.72;
    const tear = Math.atan2(vv, vu);
    const cos = Math.cos(tear);
    const sin = Math.sin(tear);
    const extent = Math.ceil(rx * 1.6);

    for (let dy = -extent; dy <= extent; dy++) {
      for (let dx = -extent; dx <= extent; dx++) {
        const x = Math.round(cx + dx);
        const y = Math.round(cy + dy);
        if (x < 0 || x >= SIM || y < 0 || y >= SIM) continue;
        const lx = cos * dx + sin * dy;
        const ly = -sin * dx + cos * dy;
        const jagged =
          0.72 + 0.22 * Math.sin(lx * 0.9 + u * 40) * Math.cos(ly * 1.1 + v * 35) + 0.1 * Math.sin(lx * 2.1 - ly * 1.3);
        const d2 = (lx * lx) / (rx * rx * jagged) + (ly * ly) / (ry * ry * jagged);
        if (d2 > 1.35) continue;
        const w = Math.pow(Math.max(0, 1 - d2), 1.1) * strength * 0.55;
        const i = y * SIM + x;
        cavityF[i] = Math.max(cavityF[i], w);
        if (d2 > 0.35 && d2 < 1.1) {
          heatF[i] = Math.max(heatF[i], w * 0.42 * (1.05 - d2));
        } else if (d2 <= 0.35) {
          heatF[i] = Math.max(heatF[i], w * 0.28);
        }
      }
    }

    const crackN = 4 + Math.floor(speed * 18);
    for (let c = 0; c < crackN; c++) {
      const seed = c * 1.7 + u * 31 + v * 17;
      const a0 = tear + (c / crackN) * Math.PI * 2 + Math.sin(seed) * 0.35;
      const a1 = a0 + (0.35 + (Math.sin(seed * 2.1) * 0.5 + 0.5) * 0.85) * (Math.sin(seed * 3.3) < 0 ? 1 : -1);
      const steps = 16;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = a0 + (a1 - a0) * t + Math.sin(t * Math.PI + seed) * 0.25;
        const rad = (0.012 + t * 0.045) * (0.85 + speed * 0.35);
        addHeat(
          u + Math.cos(ang) * rad,
          v + Math.sin(ang) * rad,
          0.004 + t * 0.006,
          strength * 0.14 * (0.25 + t * 0.75),
          'max'
        );
      }
    }
  };

  const stirBlister = (b: Blister, u: number, v: number, vu: number, vv: number, strength: number) => {
    const du = (b.u - u) * 1.15;
    const dv = b.v - v;
    const dist = Math.hypot(du, dv);
    if (dist > b.r * 1.35) return;
    const proximity = 1 - dist / Math.max(b.r * 1.35, 0.01);
    const boost = strength * (0.45 + proximity * 0.55);

    if (b.phase === 'inflate' || b.phase === 'thin') {
      const open = Math.pow(Math.max(0, b.z - 0.15) / 0.85, 1.2);
      addCrackHeat(b, open * 0.35 + boost * 0.55);
      if (boost > 0.12) {
        addTearCavity(b, boost * 0.22);
        addHeat(b.u, b.v, b.r * 0.08, boost * 0.12, 'max');
      }
      return;
    }

    if (b.phase === 'burst' || b.phase === 'cavity') {
      addTearCavity(b, boost * 0.18);
      addCrustFlaps(b, boost * 0.25);
      addHeat(b.u, b.v, b.r * 0.12, boost * 0.08, 'max');
    }
  };

  const advectHeat = (dt: number, rate: number) => {
    const scale = dt * rate * 0.9;
    for (let y = 1; y < SIM - 1; y++) {
      for (let x = 1; x < SIM - 1; x++) {
        const i = x + y * SIM;
        const u = x - velU[i] * scale;
        const v = y - velV[i] * scale;
        heatAdvect[i] = sampleBilinear(heatF, u, v);
      }
    }
    for (let i = 0; i < size; i++) {
      heatF[i] = heatAdvect[i];
    }
  };

  const decayVelocity = (dt: number, rate: number) => {
    const damp = Math.exp(-dt * rate * 2.8);
    for (let i = 0; i < size; i++) {
      velU[i] *= damp;
      velV[i] *= damp;
    }
  };

  const applyStir = (stir: StirState) => {
    const speed = Math.hypot(stir.vu, stir.vv);
    if (speed < 0.0004) return;
    const strength = clamp(speed * 28, 0.08, 1);

    injectVortex(stir.u, stir.v, stir.vu, stir.vv);
    addStirShellCrack(stir.u, stir.v, stir.vu, stir.vv, strength);
    for (const b of blisters) stirBlister(b, stir.u, stir.v, stir.vu, stir.vv, strength);
  };

  const step = (dt: number, rate: number, opts: LavaSimStepOpts) => {
    if (opts.click) blisters.push(spawnBlister(opts.click.u, opts.click.v));

    if (opts.autoSpawn) {
      const act = clamp(opts.activity, 0, 2);
      spawnWait -= dt * rate * (0.55 + act * 0.7);
      if (spawnWait <= 0 && blisters.length < MAX_BLISTERS) {
        const n = Math.min(autoSpawnCount(), MAX_BLISTERS - blisters.length);
        for (let i = 0; i < n; i++) {
          const p = pickSpawnPoint();
          blisters.push(spawnBlister(p.u, p.v));
        }
        spawnWait = (1.1 + rand() * 3.4) / Math.max(0.35, act);
      }
    }

    heightField.fill(0);
    cavityF.fill(0);
    for (let i = 0; i < size; i++) heatF[i] *= Math.exp(-dt * rate * 0.75);

    for (const b of blisters) updateBlister(b, dt, rate);
    for (let i = blisters.length - 1; i >= 0; i--) if (blisters[i].t >= 90) blisters.splice(i, 1);

    for (const s of spatters) updateSpatter(s, dt);
    for (let i = spatters.length - 1; i >= 0; i--) if (spatters[i].life <= 0) spatters.splice(i, 1);

    if (opts.stir) applyStir(opts.stir);
    advectHeat(dt, rate);
    diffuseHeat();
    decayVelocity(dt, rate);
  };

  const upload = (gl: WebGLRenderingContext, fieldTex: WebGLTexture) => {
    for (let i = 0; i < size; i++) {
      const o = i * 4;
      pixels[o] = Math.floor(clamp(heightField[i], 0, 1) * 255);
      pixels[o + 1] = Math.floor(clamp(heatF[i], 0, 1) * 255);
      pixels[o + 2] = Math.floor(clamp(cavityF[i], 0, 1) * 255);
      pixels[o + 3] = 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM, SIM, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  };

  return { step, upload };
};

export type LavaSim = ReturnType<typeof createLavaSim>;

import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  lerp,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize
} from '@cos-design/shared';
import {
  FLOWER_HEAD_GROW,
  FLOWER_WILT_YELLOW_END,
  GERMINATION_CHANCE,
  GERMINATION_DELAY_MAX,
  GERMINATION_DELAY_MIN,
  GERMINATION_NEAR_CHANCE,
  INTRO_DURATION,
  MAX_PLANTS,
  MIN_PLANT_GAP,
  NEAR_PARENT_RADIUS,
  PHASE,
  PUFF_HEAD_START,
  RELEASE_BOOST_MULT,
  SEED_DRIFT_SCALE,
  SEED_FALL_DURATION_MAX,
  SEED_FALL_DURATION_MIN,
  SEED_GROUND_FADE_RATE,
  SEED_SETTLE_SPEED,
  SEED_VY_TRACK,
  WIND_BLOW_GUST_MIN,
  WIND_BLOW_SPEED_MIN
} from '../constants';
import { drawHeadGlow, drawPlantHead, drawRosetteLeaves, drawSeed, drawStem, drawWitheredStub } from '../draw';
import { AttachedSeedTracker, PlantFrameCache } from '../frame-cache';
import {
  buildIntroQueue,
  buildPlantTraits,
  headLifecycle,
  makePlant,
  matureLife,
  plantDepthAlpha,
  rollMatureHold,
  rollReleaseDuration,
  sproutLife,
  updateAttachedFluff,
  updateStemWind
} from '../plant';
import { appendSeedsForPlant, makePappusSprite, puffSeedMotion, seedFallTargetVy } from '../seed';
import { buildGrassField, buildSceneBackdrop, drawGrassField, updateGrassFieldWind } from '../scene';
import { MAX_DPR } from '../types';
import type { IntroSpawn, Plant, PlantLayout, Seed } from '../types';
import {
  easeInOutCubic,
  easeOutCubic,
  groundAt,
  hash,
  smoothstep,
  windGustFromSpeed,
  windVisualStrength
} from '../utils';
import type { DandelionFieldController, DandelionFieldOptions } from './types';

const P = 'cos-dandelion-field';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

export function createDandelionField(
  container: HTMLElement,
  initial: DandelionFieldOptions = {}
): DandelionFieldController {
  let options: DandelionFieldOptions = {
    fill: false,
    plantCount: 10,
    seedCount: 32,
    speed: 1,
    interactive: true,
    ariaLabel: '蒲公英播种背景',
    ...initial
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  let cleanupLoop: (() => void) | null = null;

  const plants: Plant[] = [];
  const seeds: Seed[] = [];
  let nextPlantId = 1;
  let introQueue: IntroSpawn[] = [];
  let introElapsed = 0;
  let introDone = false;
  let fluffSprite: HTMLCanvasElement | null = null;
  const wind = { x: 0, y: 0, speed: 0 };
  const pointer = { x: 0, y: 0, active: false };
  let time = 0;
  let flash: { x: number; y: number; t: number } | null = null;
  const attached = new AttachedSeedTracker();
  const plantSortScratch: Plant[] = [];
  const seedSortScratch: Seed[] = [];

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const applyLayout = () => {
    if (options.fill) {
      root.style.width = '100%';
      root.style.height = '100%';
    } else {
      root.style.width = String(width) + 'px';
      root.style.height = String(height) + 'px';
    }
    canvas.style.width = String(width) + 'px';
    canvas.style.height = String(height) + 'px';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', options.ariaLabel ?? '蒲公英播种背景');
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      initScene();
      startLoop();
      return;
    }
    sizeCleanup = observeElementSize(container, (m) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured: m
      });
      width = box.width;
      height = box.height;
      applyLayout();
      initScene();
      startLoop();
    });
  };

  const initScene = () => {
    const count = clamp(Math.round(plantCount), 1, MAX_PLANTS);
    const perPlant = Math.max(24, Math.min(90, Math.round(seedCount)));
    nextPlantId = 1;
    introQueue = buildIntroQueue(count, width, height, perPlant);
    introElapsed = 0;
    introDone = false;
    plants = [];
    seeds = [];
    attached.clear();
    wind = { x: 0, y: 0, speed: 0 };
    flash = null;
    time = 0;
  };

  const startLoop = () => {
    cleanupLoop?.();
    cleanupLoop = null;
    cancelAnimationFrame(frameId);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!fluffSprite) fluffSprite = makePappusSprite();
    const fluff = fluffSprite;
    const attached = attached;

    let localFrameId = 0;
    let lastTs = 0;

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (width / Math.max(rect.width, 1)),
        y: (event.clientY - rect.top) * (height / Math.max(rect.height, 1))
      };
    };

    const buildPlantMap = () => new Map(plants.map((p) => [p.id, p]));

    const tooCloseToOthers = (x: number, ground: number, ignoreId?: number) => {
      const gap = width * MIN_PLANT_GAP;
      return plants.some((p) => {
        if (p.id === ignoreId) return false;
        return Math.hypot(p.x - x, p.ground - ground) < gap;
      });
    };

    const spawnPlantFromLayout = (layout: PlantLayout, life: PlantLife = sproutLife()) => {
      const id = nextPlantId++;
      const plant = makePlant({ ...layout }, id, life);
      plants.push(plant);
      return plant;
    };

    const flushIntroSpawns = (mature = false) => {
      for (const item of introQueue) {
        if (item.spawned) continue;
        const plant = spawnPlantFromLayout(item.layout, mature ? matureLife() : sproutLife());
        if (mature) {
          appendSeedsForPlant(seeds, plant, true);
          attached.increment(plant.id, plant.seedQuota);
        }
        item.spawned = true;
      }
      introDone = true;
      introElapsed = INTRO_DURATION;
    };

    const tickIntroSpawns = (dt: number) => {
      if (introDone) return;
      introElapsed += dt;
      for (const item of introQueue) {
        if (item.spawned || introElapsed < item.at) continue;
        spawnPlantFromLayout(item.layout);
        item.spawned = true;
      }
      if (introQueue.every((item) => item.spawned)) {
        introDone = true;
      }
    };

    const kickFirstIntroSpawn = () => {
      if (introDone) return;
      const first = introQueue.find((item) => !item.spawned && item.at <= 0);
      if (!first) return;
      spawnPlantFromLayout(first.layout);
      first.spawned = true;
    };

    const spawnPlantAt = (x: number, landY: number) => {
      if (plants.length >= MAX_PLANTS) return null;
      const margin = width * 0.04;
      const px = clamp(x, margin, width - margin);
      const ground = clamp(landY, height * 0.68, height * 0.93);
      if (tooCloseToOthers(px, ground)) return null;

      const id = nextPlantId++;
      const perPlant = Math.max(24, Math.min(90, Math.round(options.seedCount)));
      const layout = buildPlantTraits(px, ground, height, perPlant, id);
      const plant = makePlant(layout, id, sproutLife(hash(id * 7.3) * 0.12));
      plants.push(plant);
      return plant;
    };

    const removePlant = (plantId: number) => {
      plants = plants.filter((p) => p.id !== plantId);
      seeds = seeds.filter((s) => s.plantId !== plantId || !s.attached);
      attached.remove(plantId);
    };

    const beginPuffing = (plant: Plant) => {
      if (plant.phase === 'puffing' || plant.phase === 'mature') return;
      plant.phase = 'puffing';
      plant.phaseTime = clamp(plant.puffReveal, 0, 1) * PHASE.PUFFING;
      plant.grow = FLOWER_HEAD_GROW;
      if (!attached.has(plant.id)) {
        appendSeedsForPlant(seeds, plant, true);
        attached.increment(plant.id, plant.seedQuota);
      }
    };

    const planSeedFall = (seed: Seed) => {
      const ground = groundAt(seed.x, seed.depth, height);
      const fallDist = Math.max(14, ground - seed.y);
      const duration =
        SEED_FALL_DURATION_MIN +
        hash(seed.hairPhase * 3.1 + seed.plantId) * (SEED_FALL_DURATION_MAX - SEED_FALL_DURATION_MIN);
      seed.terminalVy = fallDist / duration;
      seed.vy = seed.terminalVy * (0.22 + hash(seed.hairPhase * 1.9) * 0.22);
      seed.fallFreqA = 0.62 + hash(seed.hairPhase * 4.3) * 1.25;
      seed.fallFreqB = 1.55 + hash(seed.hairPhase * 6.7) * 3.1;
    };

    const detachSeed = (seed: Seed, vx: number, vy: number, spin: number, origin?: { x: number; ground: number }) => {
      seed.attached = false;
      attached.decrement(seed.plantId);
      seed.canGerminate = true;
      seed.fluffOx = 0;
      seed.fluffOy = 0;
      seed.vx = vx;
      seed.spin = spin;
      seed.life = 1;
      seed.landed = false;
      seed.landedAt = -1;
      seed.germinateDelay =
        GERMINATION_DELAY_MIN + hash(seed.hairPhase * 4.1) * (GERMINATION_DELAY_MAX - GERMINATION_DELAY_MIN);
      seed.germinateChecked = false;
      seed.settleT = 0;
      seed.restGroundY = -1;
      seed.swayPhase = seed.hairPhase;
      seed.driftBias = (hash(seed.hairPhase * 5.3 + seed.rot) - 0.5) * 0.22;
      planSeedFall(seed);
      seed.vy = seed.terminalVy * (0.22 + hash(seed.hairPhase * 1.9) * 0.22) + vy;
      if (origin) {
        seed.originX = origin.x;
        seed.originGround = origin.ground;
      }
    };

    const beginSeedSettling = (seed: Seed, ground: number) => {
      if (seed.settleT > 0) return;
      seed.restGroundY = ground;
      seed.settleT = 0.001;
    };

    const updateFlyingSeed = (seed: Seed, dt: number, time: number, rate: number, wind: { x: number; y: number }) => {
      const sway = Math.sin(time * 1.55 + seed.swayPhase);
      const drift = Math.cos(time * 0.95 + seed.swayPhase * 1.4);
      const targetVy = seedFallTargetVy(seed, time, wind, sway);

      seed.vy += (targetVy - seed.vy) * SEED_VY_TRACK;
      const step = dt * 60;
      const windStr = windVisualStrength(wind);
      seed.vx += (wind.x * (0.022 + windStr * 0.018) + seed.driftBias * 0.014 + sway * 0.011 + drift * 0.006) * step;
      seed.vy += wind.y * (0.032 + windStr * 0.028) * step;
      seed.vx *= 0.992;
      seed.vy = seed.vy * 0.994 + seed.terminalVy * 0.006;
      seed.spin *= 0.94;

      seed.x += seed.vx * SEED_DRIFT_SCALE * dt * rate;
      seed.y += seed.vy * dt * rate;
      seed.rot = seed.vx * 0.42 + seed.vy * 0.018 + sway * 0.08 + seed.spin;

      const ground = groundAt(seed.x, seed.depth, height);
      if (seed.y >= ground - 0.8) {
        seed.y = Math.min(seed.y, ground);
        beginSeedSettling(seed, ground);
      }
    };

    const updateSettlingSeed = (seed: Seed, dt: number, time: number, rate: number) => {
      seed.settleT = Math.min(1, seed.settleT + dt * SEED_SETTLE_SPEED);
      const ease = easeOutCubic(seed.settleT);
      const flutter = Math.sin(time * 10 + seed.swayPhase) * (1 - ease) * 0.35;

      seed.vx *= 0.75;
      seed.x += seed.vx * 4 * dt * rate;
      const settleStep = Math.min(0.12, dt * 1.8 + ease * 0.06);
      seed.y = lerp(seed.y, seed.restGroundY, settleStep) + flutter;
      if (seed.y > seed.restGroundY) seed.y = seed.restGroundY + flutter;
      seed.vy = 0;
      seed.spin *= 0.8;
      seed.rot = lerp(seed.rot, 0.08 + hash(seed.swayPhase * 1.9) * 0.22, settleStep * 2.5);

      if (seed.settleT >= 1) {
        seed.y = seed.restGroundY;
        seed.vx = 0;
        seed.landed = true;
        seed.landedAt = time;
      }
    };

    const updateRestingSeed = (seed: Seed) => {
      seed.y = seed.restGroundY;
      seed.vx = 0;
      seed.vy = 0;
      seed.rot = 0.08 + hash(seed.swayPhase * 1.9) * 0.22;
    };

    const tryGerminate = (seed: Seed) => {
      if (!seed.canGerminate || seed.attached || !seed.landed) return false;
      const ground = groundAt(seed.x, seed.depth, height);

      const hasOrigin = seed.originX !== undefined && seed.originGround !== undefined;
      const nearParent =
        hasOrigin && Math.hypot(seed.x - seed.originX!, seed.y - seed.originGround!) < width * NEAR_PARENT_RADIUS;
      const chance = nearParent ? GERMINATION_NEAR_CHANCE : GERMINATION_CHANCE;
      if (hash(seed.x * 0.31 + seed.y * 0.17 + seed.hairPhase) > chance) return false;

      const spawnX = nearParent
        ? clamp(seed.originX! + (hash(seed.hairPhase * 2.1) - 0.5) * width * 0.14, width * 0.04, width * 0.96)
        : seed.x;
      const spawnGround = nearParent
        ? clamp(seed.originGround! + (hash(seed.hairPhase * 3.3) - 0.5) * height * 0.035, height * 0.68, height * 0.93)
        : ground;
      return spawnPlantAt(spawnX, spawnGround) !== null;
    };

    const scheduleSeedReleases = (plant: Plant) => {
      const attachedSeeds = seeds
        .filter((s) => s.plantId === plant.id && s.attached)
        .sort((a, b) => Math.hypot(b.lx, b.ly) - Math.hypot(a.lx, a.ly));
      const n = attachedSeeds.length;
      const duration = plant.releaseDuration;
      attachedSeeds.forEach((seed, i) => {
        const order = n <= 1 ? 1 : i / (n - 1);
        const irregular = hash(i * 2.71 + plant.id * 1.3);
        const t = clamp(0.05 + order * 0.8 + irregular * 0.15, 0.05, 1);
        seed.scheduledRelease = t * duration;
      });
    };

    const releaseSeedsIrregular = (plant: Plant, dt: number) => {
      plant.releaseElapsed += dt;
      const boost = plant.releaseBoost > 0.01 ? 1 + plant.releaseBoost * RELEASE_BOOST_MULT : 1;
      const elapsed = plant.releaseElapsed * boost;
      const duration = plant.releaseDuration;

      const attachedSeeds = seeds
        .filter((s) => s.plantId === plant.id && s.attached)
        .sort((a, b) => (a.scheduledRelease ?? duration) - (b.scheduledRelease ?? duration));
      if (!attachedSeeds.length) return;

      const origin = { x: plant.x, ground: plant.ground };
      let due =
        elapsed >= duration ? attachedSeeds : attachedSeeds.filter((s) => elapsed >= (s.scheduledRelease ?? duration));
      const maxPerFrame = plant.releaseBoost > 0.15 ? 6 : 2;
      if (due.length > maxPerFrame) due = due.slice(0, maxPerFrame);

      for (let i = 0; i < due.length; i++) {
        const seed = due[i];
        const burstDir = hash(seed.hairPhase * 2.3 + i * 1.7 + plant.id) * Math.PI * 2;
        const sp = 0.12 + hash(seed.hairPhase * 1.7 + i * 0.9) * 0.34;
        const lateral = (hash(seed.lx * 1.3 + i * 2.4) - 0.5) * 0.16;
        const velBoost = 1 + plant.releaseBoost * 0.22;
        detachSeed(
          seed,
          (Math.cos(burstDir) * sp + wind.x * 0.05 + lateral) * velBoost,
          (Math.sin(burstDir) * sp * 0.35 + wind.y * 0.05 + 0.03 + hash(seed.hairPhase + i * 0.6) * 0.04) * velBoost,
          (hash(seed.rot + plant.id + i) - 0.5) * 0.022,
          origin
        );
        seed.scheduledRelease = undefined;
      }
    };

    const beginReleasing = (plant: Plant) => {
      if (plant.releasing) return;
      plant.releasing = true;
      plant.releaseElapsed = 0;
      plant.releaseSeedTotal = attached.get(plant.id);
      scheduleSeedReleases(plant);
    };

    const canBurstPuffBall = (plant: Plant) =>
      (plant.phase === 'mature' || plant.phase === 'puffing') && plant.puffReveal >= 0.85 && attached.has(plant.id);

    const finishBurstIfEmpty = (plant: Plant) => {
      if (!plant.releasing) return false;
      if (attached.has(plant.id)) return false;
      plant.phase = 'wither';
      plant.phaseTime = 0;
      plant.releasing = false;
      plant.releaseBoost = 0;
      plant.releaseElapsed = 0;
      plant.releaseSeedTotal = 0;
      return true;
    };

    const boostPlantRelease = (plant: Plant, amount: number) => {
      if (!canBurstPuffBall(plant)) return;
      if (plant.phase === 'mature') plant.matureHoldLeft = 0;
      beginReleasing(plant);
      plant.releaseBoost = clamp(plant.releaseBoost + amount, 0, 4);
      if (amount >= 1.2) plant.releaseElapsed += 0.12;
    };

    const enterMaturePhase = (plant: Plant) => {
      plant.phase = 'mature';
      plant.phaseTime = 0;
      plant.grow = FLOWER_HEAD_GROW;
      plant.puffReveal = 1;
      plant.matureHoldLeft = rollMatureHold();
      plant.releaseDuration = rollReleaseDuration(plant.id);
      plant.releaseElapsed = 0;
      plant.releaseSeedTotal = 0;
      plant.releasing = false;
      plant.releaseBoost = 0;
    };

    const updateReleaseBoost = (plant: Plant, dt: number) => {
      plant.releaseBoost = Math.max(0, plant.releaseBoost - dt * 0.65);
    };

    const updatePlantLifecycle = (plant: Plant, dt: number) => {
      plant.phaseTime += dt;

      switch (plant.phase) {
        case 'mature': {
          if (!plant.releasing) {
            if (plant.matureHoldLeft > 0) {
              plant.matureHoldLeft = Math.max(0, plant.matureHoldLeft - dt);
            }
            if (plant.matureHoldLeft <= 0) {
              beginReleasing(plant);
            }
          }
          if (plant.releasing) {
            releaseSeedsIrregular(plant, dt);
          }
          updateReleaseBoost(plant, dt);
          finishBurstIfEmpty(plant);
          break;
        }
        case 'wither': {
          const t = easeInOutCubic(plant.phaseTime / PHASE.WITHER);
          plant.wilt = t;
          plant.stemBrown = t;
          plant.fade = 1 - easeOutCubic(Math.max(0, (t - 0.35) / 0.65));
          plant.leafScale = 1 - t * 0.85;
          plant.puffReveal = 0;
          if (plant.phaseTime >= PHASE.WITHER) removePlant(plant.id);
          break;
        }
        case 'sprout': {
          const t = easeInOutCubic(plant.phaseTime / PHASE.SPROUT);
          plant.stemLen = plant.stem * t;
          plant.leafScale = 0.08 + t * 0.92;
          plant.fade = Math.min(1, smoothstep(0.08, 0.72, t) * 1.08);
          if (plant.phaseTime >= PHASE.SPROUT) {
            plant.phase = 'flower';
            plant.phaseTime = 0;
            plant.stemLen = plant.stem;
            plant.leafScale = 1;
            plant.fade = 1;
            plant.grow = 0;
          }
          break;
        }
        case 'flower': {
          const life = headLifecycle(plant);
          plant.grow = life.bloom * FLOWER_HEAD_GROW;
          if (life.wilt >= FLOWER_WILT_YELLOW_END) {
            if (!attached.has(plant.id)) {
              appendSeedsForPlant(seeds, plant, true);
              attached.increment(plant.id, plant.seedQuota);
            }
            plant.puffReveal = Math.max(plant.puffReveal, PUFF_HEAD_START);
            beginPuffing(plant);
          }
          break;
        }
        case 'puffing': {
          plant.grow = FLOWER_HEAD_GROW;
          if (!plant.releasing) {
            plant.puffReveal = clamp(plant.phaseTime / PHASE.PUFFING, 0, 1);
            if (plant.phaseTime >= PHASE.PUFFING) {
              enterMaturePhase(plant);
            }
          }
          if (plant.releasing) {
            releaseSeedsIrregular(plant, dt);
            updateReleaseBoost(plant, dt);
            finishBurstIfEmpty(plant);
          }
          break;
        }
      }
    };

    const onMove = (event: PointerEvent) => {
      if (!options.interactive) return;
      const { x, y } = toLocal(event);
      const ptr = pointer;
      if (!pointer.active) {
        pointer.x = x;
        pointer.y = y;
        pointer.active = true;
        return;
      }
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      pointer.x = x;
      pointer.y = y;
      const moveSpeed = Math.hypot(dx, dy);
      const gust = windGustFromSpeed(moveSpeed);
      wind.speed = Math.max(gust, wind.speed * 0.72);
      const push = 0.06 + gust * 0.2;
      wind.x = clamp(wind.x * 0.82 + dx * push, -5.5, 5.5);
      wind.y = clamp(wind.y * 0.82 + dy * push, -5.5, 5.5);

      if (gust >= WIND_BLOW_GUST_MIN && moveSpeed >= WIND_BLOW_SPEED_MIN) {
        const blowAmount = moveSpeed * 0.018 * clamp((gust - WIND_BLOW_GUST_MIN) / (1 - WIND_BLOW_GUST_MIN), 0.35, 1);
        const frameCache = new PlantFrameCache();
        for (const plant of plants) {
          if (!canBurstPuffBall(plant)) continue;
          const head = frameCache.get(plant).head;
          const d = Math.hypot(head.x - x, head.y - y);
          if (d < 105 * plant.scale) {
            boostPlantRelease(plant, blowAmount);
          }
        }
      }
    };

    const onDown = (event: PointerEvent) => {
      if (!options.interactive) return;
      const { x, y } = toLocal(event);
      Object.assign(pointer, { x, y, active: true });
      let best: Plant | null = null;
      let bestD = Infinity;
      const frameCache = new PlantFrameCache();
      for (const plant of plants) {
        if (!canBurstPuffBall(plant)) continue;
        const head = frameCache.get(plant).head;
        const d = Math.hypot(head.x - x, head.y - y);
        if (d < bestD) {
          bestD = d;
          best = plant;
        }
      }
      if (best && bestD < 130 * best.scale) {
        boostPlantRelease(best, 2.8);
        const head = frameCache.get(best).head;
        flash = { x: head.x, y: head.y, t: 0.35 };
      }
    };

    const onEnter = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      Object.assign(pointer, { x, y, active: true });
    };

    const onLeave = () => {
      pointer.active = false;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerleave', onLeave);

    const bgCanvas = buildSceneBackdrop(width, height);
    const grassTufts = buildGrassField(width, height);
    const grassWindStates = grassTufts.map(() => ({
      sway: 0,
      swayVel: 0,
      lift: 0,
      liftVel: 0
    }));

    const paint = (
      staticFrame: boolean,
      time = 0,
      plantsById?: Map<number, Plant>,
      frameCache = new PlantFrameCache()
    ) => {
      const idMap = plantsById ?? buildPlantMap();

      ctx.drawImage(bgCanvas, 0, 0, width, height);
      drawGrassField(ctx, grassTufts, grassWindStates, height, time);

      const order = plantSortScratch;
      order.length = 0;
      order.push(...plants);
      order.sort((pa, pb) => pa.ground + (1 - pa.depth) * 8 - (pb.ground + (1 - pb.depth) * 8));

      for (const plant of order) {
        drawRosetteLeaves(ctx, plant);
      }

      for (const plant of order) {
        const { head } = frameCache.get(plant);
        drawStem(ctx, plant);
        drawPlantHead(ctx, plant, head);

        if (plant.phase === 'wither') {
          drawWitheredStub(ctx, head, plant);
        } else if (plant.phase === 'mature' || plant.phase === 'puffing') {
          const life = frameCache.get(plant).life;
          const vis = plant.fade * plantDepthAlpha(plant);
          if (attached.get(plant.id) > 0 && life.puff > 0.02) {
            drawHeadGlow(ctx, head, plant.radius * (0.08 + life.puff * 0.92), life.glow * vis * 0.65);
          }
        }
      }

      const drawOrder = seedSortScratch;
      drawOrder.length = 0;
      drawOrder.push(...seeds);
      drawOrder.sort((a, b) => {
        const pa = idMap.get(a.plantId);
        const pb = idMap.get(b.plantId);
        const da = a.attached && pa ? 1 - pa.depth : 1 - a.depth;
        const db = b.attached && pb ? 1 - pb.depth : 1 - b.depth;
        return a.y + da * 12 - (b.y + db * 12);
      });

      for (const seed of drawOrder) {
        if (staticFrame && !seed.attached) continue;
        const plant = idMap.get(seed.plantId);
        if (seed.attached) {
          const life = plant ? frameCache.get(plant).life : null;
          if (!plant || plant.phase === 'sprout') continue;
          if (plant.phase === 'flower' && (!life || life.puff <= 0.008)) continue;
          if (plant.phase === 'wither' && plant.puffReveal <= 0.02) continue;
        }
        const depthFade = seed.attached && plant ? plantDepthAlpha(plant) : 0.58 + seed.depth * 0.42;
        const plantFade = seed.attached ? (plant ? plant.fade * depthFade : 0.78) : depthFade;
        const motion = plant ? puffSeedMotion(plant, seed) : { reveal: 1, fluffLen: 1, expand: 1 };
        const reveal = seed.attached && plant ? motion.reveal : 1;
        const onPuffBall =
          plant &&
          (plant.phase === 'puffing' ||
            plant.phase === 'mature' ||
            (plant.phase === 'flower' && plant.puffReveal > 0.008));
        const growing = Boolean(onPuffBall && plant.phase !== 'mature' && motion.fluffLen < 0.995);
        drawSeed(ctx, fluff, seed, time, staticFrame, reveal, plantFade, growing, motion.fluffLen);
      }

      const flash = flash;
      if (flash && !staticFrame) {
        const g = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, 28);
        g.addColorStop(0, `rgba(255, 252, 240, ${0.08 * flash.t})`);
        g.addColorStop(1, 'rgba(255, 252, 240, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, 28, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const cleanup = () => {
      cancelAnimationFrame(localFrameId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
      unbindVisibility();
      unbindMotion();
    };

    if (reduced) {
      flushIntroSpawns(true);
      paint(true);
      return cleanup;
    }

    const draw = (ts: number) => {
      localFrameId = requestAnimationFrame(draw);
      if (paused) return;
      if (!lastTs) lastTs = ts;
      const dt = clamp((ts - lastTs) / 1000, 0.008, 0.04);
      lastTs = ts;
      const rate = options.speed;
      time += dt * rate;
      const time = time;
      const wind = wind;
      wind.x *= Math.exp(-dt * 1.05);
      wind.y *= Math.exp(-dt * 1.05);
      wind.speed *= Math.exp(-dt * 2.6);
      if (flash) {
        flash.t -= dt * 2.8;
        if (flash.t <= 0) flash = null;
      }

      tickIntroSpawns(dt * rate);
      updateGrassFieldWind(grassWindStates, grassTufts, wind, time, dt);

      const frameCache = new PlantFrameCache();
      const plantsById = buildPlantMap();
      const snapshot = plants.slice();
      for (const plant of snapshot) {
        const idle = Math.sin(time * (0.85 + hash(plant.id * 2.3) * 0.35) + plant.swayPhase) * plant.swayAmp;
        updateStemWind(plant, wind, idle, dt);
        updatePlantLifecycle(plant, dt);
      }

      for (const seed of seeds) {
        const plant = plantsById.get(seed.plantId);
        if (seed.attached && plant) {
          const head = frameCache.get(plant).head;
          const onPuffBall =
            plant.phase === 'puffing' ||
            plant.phase === 'mature' ||
            (plant.phase === 'flower' && plant.puffReveal > 0.008);
          const {
            offX: windOffX,
            offY: windOffY,
            tiltX,
            tiltY
          } = updateAttachedFluff(seed, plant, wind, time, dt, onPuffBall, plant.radius);
          const scale = onPuffBall ? 1 : 0;
          const { expand } = puffSeedMotion(plant, seed);
          const radial = onPuffBall ? expand : 0;
          const localX = seed.lx * scale * radial;
          const localY = seed.ly * scale * radial;
          seed.x = head.x + localX + windOffX;
          seed.y = head.y + localY + windOffY;
          seed.rot = Math.atan2(localY + tiltY, localX + tiltX) * 0.11 + seed.hairPhase * 0.02;
        } else if (!seed.attached) {
          if (seed.settleT <= 0) {
            updateFlyingSeed(seed, dt, time, rate, wind);
          } else if (!seed.landed) {
            updateSettlingSeed(seed, dt, time, rate);
          } else {
            updateRestingSeed(seed);
          }

          if (seed.landed && seed.landedAt >= 0 && time - seed.landedAt >= seed.germinateDelay) {
            if (!seed.germinateChecked) {
              seed.germinateChecked = true;
              if (tryGerminate(seed)) {
                seed.life = 0;
              } else {
                seed.canGerminate = false;
              }
            } else if (seed.life > 0) {
              seed.life -= dt * SEED_GROUND_FADE_RATE;
            }
          }
        }
      }

      seeds = seeds.filter((s) => (s.attached && plantsById.has(s.plantId)) || (!s.attached && s.life > 0));
      paint(false, time, plantsById, frameCache);
    };

    paint(false, 0);
    kickFirstIntroSpawn();
    draw(0);
    return cleanup;
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
    startLoop();
  });
  applyLayout();
  bindSize();

  return {
    update(next) {
      options = { ...options, ...next };
      bindSize();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanupLoop?.();
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      root.remove();
    }
  };
}

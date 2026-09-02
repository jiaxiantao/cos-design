import type { BurnAwayController, BurnAwayOptions } from './types';
const P = 'cos-burn-away';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function createBurnAway(container: HTMLElement, initial: BurnAwayOptions = {}): BurnAwayController {
  let opts: BurnAwayOptions = { text: 'BURN', fontSize: 64, completedText: 'Gone.', ...initial };
  let burning = false;
  let done = false;
  let completed = false;
  let frameId = 0;
  let animCancelled = false;
  const onCompleteRef = { current: opts.onComplete };

  const root = document.createElement('div');
  root.className = P;
  const stage = document.createElement('div');
  stage.className = `${P}__stage`;
  const textEl = document.createElement('span');
  textEl.className = `${P}__text`;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = `${P}__trigger`;
  trigger.textContent = 'Ignite';
  const hint = document.createElement('p');
  hint.className = `${P}__hint`;
  stage.append(textEl, canvas);
  root.append(stage, trigger, hint);
  container.appendChild(root);

  const syncUi = () => {
    textEl.textContent = opts.text ?? 'BURN';
    textEl.style.fontSize = `${opts.fontSize ?? 64}px`;
    textEl.style.opacity = burning ? '0' : '1';
    textEl.hidden = done;
    trigger.hidden = burning || done;
    hint.hidden = !done;
    hint.textContent = opts.completedText ?? 'Gone.';
  };

  const startBurnAnim = () => {
    animCancelled = false;
    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const offscreen = document.createElement('canvas');
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.scale(dpr, dpr);
    offCtx.font = `900 ${opts.fontSize ?? 64}px system-ui, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = '#f8fafc';
    offCtx.fillText(opts.text ?? 'BURN', w / 2, h / 2);

    const imageData = offCtx.getImageData(0, 0, w * dpr, h * dpr);
    const pixels = imageData.data;
    const particles: Particle[] = [];
    const step = 4;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (Math.floor(y * dpr) * w * dpr + Math.floor(x * dpr)) * 4;
        if (pixels[idx + 3] > 128) {
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1,
            maxLife: 0.6 + Math.random() * 0.6,
            size: 2 + Math.random() * 3
          });
        }
      }
    }

    let elapsed = 0;
    const duration = 2500;
    const animate = (now: number, prev: number) => {
      if (animCancelled) return;
      const dt = Math.min((now - prev) / 16, 2);
      elapsed += dt * 16;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        p.life -= (dt * 0.012) / p.maxLife;
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.04 * dt;
        const alpha = p.life;
        const heat = 1 - p.life;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(255,${Math.max(0, 200 - heat * 200)},${Math.max(0, 80 - heat * 80)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (elapsed < duration && alive > 0) {
        frameId = requestAnimationFrame((t) => animate(t, now));
      } else if (!animCancelled) {
        done = true;
        if (!completed) {
          completed = true;
          onCompleteRef.current?.();
        }
        syncUi();
      }
    };
    frameId = requestAnimationFrame((t) => animate(t, t));
  };

  const ignite = () => {
    if (burning || done) return;
    burning = true;
    syncUi();
    startBurnAnim();
  };

  trigger.addEventListener('click', ignite);
  syncUi();

  return {
    update(n) {
      opts = { ...opts, ...n };
      if (n.onComplete !== undefined) onCompleteRef.current = n.onComplete;
      syncUi();
    },
    ignite,
    destroy() {
      animCancelled = true;
      cancelAnimationFrame(frameId);
      trigger.removeEventListener('click', ignite);
      root.remove();
    }
  };
}

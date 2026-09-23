/** Batch A engine definitions (part 2) */
function p(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/^/, 'cos-');
}

export const ENGINES_PART2 = {
  blurText: {
    types: `export interface BlurTextOptions {
  text?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  stagger?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  onAnimationComplete?: () => void;
}
export interface BlurTextController {
  update(options: Partial<BlurTextOptions>): void;
  destroy(): void;
}
export type BlurTextProps = BlurTextOptions;`,
    engine: `
import type { BlurTextController, BlurTextOptions } from './types';
const P = '${p('blurText')}';
export function createBlurText(container: HTMLElement, initial: BlurTextOptions = {}): BlurTextController {
  let opts: BlurTextOptions = {
    text: 'BLUR TEXT', animateBy: 'words', direction: 'top', stagger: 120, duration: 500,
    fontSize: 56, color: '#f8fafc', ...initial
  };
  let destroyed = false;
  let inView = false;
  let done = false;
  let observer: IntersectionObserver | null = null;
  let completeTimer = 0;
  const onCompleteRef = { current: opts.onAnimationComplete };

  const root = document.createElement('div');
  root.className = P;
  const pEl = document.createElement('p');
  pEl.className = \`\${P}__text\`;
  root.appendChild(pEl);
  container.appendChild(root);

  const getElements = () =>
    (opts.animateBy === 'words' ? (opts.text ?? '').split(' ') : (opts.text ?? '').split(''));

  const render = () => {
    pEl.style.fontSize = \`\${opts.fontSize ?? 56}px\`;
    pEl.style.setProperty('--blur-color', opts.color ?? '#f8fafc');
    pEl.style.setProperty('--blur-duration', \`\${opts.duration ?? 500}ms\`);
    pEl.replaceChildren();
    const elements = getElements();
    const dir = opts.direction ?? 'top';
    elements.forEach((item, i) => {
      const span = document.createElement('span');
      span.className = \`\${P}__unit \${P}__\${dir} \${inView ? \`\${P}__enter\` : \`\${P}__idle\`}\`;
      span.style.animationDelay = \`\${i * (opts.stagger ?? 120)}ms\`;
      span.textContent = item === ' ' ? '\\u00A0' : item;
      pEl.appendChild(span);
      if (opts.animateBy === 'words' && i < elements.length - 1) {
        pEl.appendChild(document.createTextNode('\\u00A0'));
      }
    });
  };

  const scheduleComplete = () => {
    if (completeTimer) window.clearTimeout(completeTimer);
    if (!inView || done || !onCompleteRef.current) return;
    const total = getElements().length * (opts.stagger ?? 120) + (opts.duration ?? 500);
    completeTimer = window.setTimeout(() => {
      done = true;
      onCompleteRef.current?.();
    }, total);
  };

  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      inView = true;
      observer?.disconnect();
      observer = null;
      render();
      scheduleComplete();
    }
  }, { threshold: 0.15 });
  observer.observe(root);
  render();

  return {
    update(next) {
      opts = { ...opts, ...next };
      if (next.onAnimationComplete !== undefined) onCompleteRef.current = next.onAnimationComplete;
      done = false;
      render();
      scheduleComplete();
    },
    destroy() {
      destroyed = true;
      observer?.disconnect();
      if (completeTimer) window.clearTimeout(completeTimer);
      root.remove();
    }
  };
}`,
    element: `${'  if (el.hasAttribute(\'text\')) options.text = el.getAttribute(\'text\') ?? undefined;\n  if (el.hasAttribute(\'animate-by\')) options.animateBy = el.getAttribute(\'animate-by\') as BlurTextOptions[\'animateBy\'];\n  if (el.hasAttribute(\'direction\')) options.direction = el.getAttribute(\'direction\') as BlurTextOptions[\'direction\'];\n  if (el.hasAttribute(\'stagger\')) options.stagger = Number(el.getAttribute(\'stagger\'));\n  if (el.hasAttribute(\'duration\')) options.duration = Number(el.getAttribute(\'duration\'));\n  if (el.hasAttribute(\'font-size\')) options.fontSize = Number(el.getAttribute(\'font-size\'));\n  if (el.hasAttribute(\'color\')) options.color = el.getAttribute(\'color\') ?? undefined;\n  options.onAnimationComplete = () => el.dispatchEvent(new CustomEvent(\'animation-complete\', { bubbles: true }));'}`,
    observed: ['text', 'animate-by', 'direction', 'stagger', 'duration', 'font-size', 'color']
  },

  circularText: {
    types: `export interface CircularTextOptions {
  text?: string;
  spinDuration?: number;
  onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
  fontSize?: number;
  radius?: number;
  color?: string;
}
export interface CircularTextController { update(o: Partial<CircularTextOptions>): void; destroy(): void; }
export type CircularTextProps = CircularTextOptions;`,
    engine: `
import type { CircularTextController, CircularTextOptions } from './types';
const P = '${p('circularText')}';
export function createCircularText(container: HTMLElement, initial: CircularTextOptions = {}): CircularTextController {
  let opts: CircularTextOptions = {
    text: 'COS DESIGN • REACT BITS • ', spinDuration: 20, onHover: 'speedUp',
    fontSize: 22, radius: 90, color: '#f8fafc', ...initial
  };
  let hovered = false;
  const root = document.createElement('div'); root.className = P;
  const scaleWrap = document.createElement('div'); scaleWrap.className = \`\${P}__scale-wrap\`;
  const ring = document.createElement('div'); ring.className = \`\${P}__ring\`;
  scaleWrap.appendChild(ring); root.appendChild(scaleWrap); container.appendChild(root);

  const getDuration = () => {
    if (!hovered) return opts.spinDuration ?? 20;
    switch (opts.onHover) {
      case 'slowDown': return (opts.spinDuration ?? 20) * 2;
      case 'speedUp': return (opts.spinDuration ?? 20) / 4;
      case 'pause': return 0;
      case 'goBonkers': return Math.max((opts.spinDuration ?? 20) / 20, 0.2);
      default: return opts.spinDuration ?? 20;
    }
  };

  const render = () => {
    const letters = Array.from(opts.text ?? '');
    const radius = opts.radius ?? 90;
    const fontSize = opts.fontSize ?? 22;
    const size = radius * 2 + fontSize * 2;
    const duration = getDuration();
    scaleWrap.classList.toggle(\`\${P}__bonkers\`, hovered && opts.onHover === 'goBonkers');
    ring.style.width = \`\${size}px\`;
    ring.style.height = \`\${size}px\`;
    ring.style.color = opts.color ?? '#f8fafc';
    ring.style.fontSize = \`\${fontSize}px\`;
    ring.style.animationDuration = duration > 0 ? \`\${duration}s\` : '';
    ring.style.animationPlayState = duration === 0 ? 'paused' : 'running';
    ring.replaceChildren();
    letters.forEach((letter, i) => {
      const span = document.createElement('span');
      span.className = \`\${P}__char\`;
      const rot = (360 / letters.length) * i;
      span.style.transform = \`rotate(\${rot}deg) translateY(-\${radius}px)\`;
      span.textContent = letter === ' ' ? '\\u00A0' : letter;
      ring.appendChild(span);
    });
  };

  const onEnter = () => { hovered = true; render(); };
  const onLeave = () => { hovered = false; render(); };
  scaleWrap.addEventListener('mouseenter', onEnter);
  scaleWrap.addEventListener('mouseleave', onLeave);
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    destroy() {
      scaleWrap.removeEventListener('mouseenter', onEnter);
      scaleWrap.removeEventListener('mouseleave', onLeave);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('spin-duration')) options.spinDuration = Number(el.getAttribute('spin-duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['text', 'spin-duration', 'font-size', 'radius', 'color']
  },

  splitText: {
    types: `export interface SplitTextOptions {
  text?: string;
  animation?: 'fadeUp' | 'scale' | 'rotate' | 'blur';
  stagger?: number;
  duration?: number;
  loop?: boolean;
  loopPause?: number;
  fontSize?: number;
  color?: string;
}
export interface SplitTextController { update(o: Partial<SplitTextOptions>): void; destroy(): void; }
export type SplitTextProps = SplitTextOptions;`,
    engine: `
import type { SplitTextController, SplitTextOptions } from './types';
const P = '${p('splitText')}';
export function createSplitText(container: HTMLElement, initial: SplitTextOptions = {}): SplitTextController {
  let opts: SplitTextOptions = {
    text: 'SPLIT TEXT', animation: 'fadeUp', stagger: 50, duration: 500,
    loop: true, loopPause: 2400, fontSize: 56, color: '#f8fafc', ...initial
  };
  let visible = true;
  let hideTimer = 0;
  let showTimer = 0;
  let cancelled = false;

  const root = document.createElement('div'); root.className = P;
  const textEl = document.createElement('div'); textEl.className = \`\${P}__text\`;
  root.appendChild(textEl); container.appendChild(root);

  const getChars = () => (opts.text ?? '').split('');
  const totalDuration = () => getChars().length * (opts.stagger ?? 50) + (opts.duration ?? 500);

  const render = () => {
    textEl.style.fontSize = \`\${opts.fontSize ?? 56}px\`;
    textEl.style.setProperty('--split-color', opts.color ?? '#f8fafc');
    textEl.style.setProperty('--split-duration', \`\${opts.duration ?? 500}ms\`);
    textEl.replaceChildren();
    const anim = opts.animation ?? 'fadeUp';
    getChars().forEach((char, i) => {
      const s = document.createElement('span');
      s.className = \`\${P}__char \${P}__\${anim} \${visible ? \`\${P}__enter\` : \`\${P}__exit\`}\`;
      s.style.animationDelay = \`\${i * (opts.stagger ?? 50)}ms\`;
      s.textContent = char === ' ' ? '\\u00A0' : char;
      textEl.appendChild(s);
    });
  };

  const clearTimers = () => {
    if (hideTimer) window.clearTimeout(hideTimer);
    if (showTimer) window.clearTimeout(showTimer);
    hideTimer = showTimer = 0;
  };

  const startLoop = () => {
    clearTimers();
    cancelled = false;
    if (!(opts.loop ?? true)) return;
    const cycle = () => {
      if (cancelled) return;
      visible = true;
      render();
      hideTimer = window.setTimeout(() => {
        if (cancelled) return;
        visible = false;
        render();
        showTimer = window.setTimeout(cycle, Math.max(opts.duration ?? 500, 600));
      }, totalDuration() + (opts.loopPause ?? 2400));
    };
    cycle();
  };

  render();
  startLoop();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
      startLoop();
    },
    destroy() {
      cancelled = true;
      clearTimers();
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('animation')) options.animation = el.getAttribute('animation') as SplitTextOptions['animation'];
  if (el.hasAttribute('stagger')) options.stagger = Number(el.getAttribute('stagger'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('loop')) options.loop = true;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['text', 'animation', 'stagger', 'duration', 'loop', 'font-size', 'color']
  },

  holographicCard: {
    types: `export interface HolographicCardOptions { title?: string; subtitle?: string; image?: string; }
export interface HolographicCardController { update(o: Partial<HolographicCardOptions>): void; destroy(): void; }
export type HolographicCardProps = HolographicCardOptions;`,
    engine: `
import type { HolographicCardController, HolographicCardOptions } from './types';
const P = '${p('holographicCard')}';
export function createHolographicCard(container: HTMLElement, initial: HolographicCardOptions = {}): HolographicCardController {
  let opts: HolographicCardOptions = { title: '全息卡片', subtitle: '移动鼠标体验 3D 效果', ...initial };
  const root = document.createElement('div'); root.className = P;
  const card = document.createElement('div'); card.className = \`\${P}__card\`;
  const shine = document.createElement('div'); shine.className = \`\${P}__shine\`;
  const info = document.createElement('div'); info.className = \`\${P}__info\`;
  const h3 = document.createElement('h3');
  const pEl = document.createElement('p');
  info.append(h3, pEl);
  card.append(shine, info);
  root.appendChild(card); container.appendChild(root);
  let mediaEl: HTMLElement | null = null;

  const onMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--rx', \`\${-y * 20}deg\`);
    card.style.setProperty('--ry', \`\${x * 20}deg\`);
    card.style.setProperty('--gx', \`\${(x + 0.5) * 100}%\`);
    card.style.setProperty('--gy', \`\${(y + 0.5) * 100}%\`);
  };
  const onLeave = () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--gx', '50%');
    card.style.setProperty('--gy', '50%');
  };
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', onLeave);

  const render = () => {
    if (mediaEl) { mediaEl.remove(); mediaEl = null; }
    if (opts.image) {
      const img = document.createElement('img');
      img.className = \`\${P}__image\`;
      img.src = opts.image;
      img.alt = opts.title ?? '';
      mediaEl = img;
    } else {
      const ph = document.createElement('div');
      ph.className = \`\${P}__placeholder\`;
      const span = document.createElement('span'); span.textContent = '✦';
      ph.appendChild(span);
      mediaEl = ph;
    }
    card.insertBefore(mediaEl, shine);
    h3.textContent = opts.title ?? '';
    pEl.textContent = opts.subtitle ?? '';
  };
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    destroy() {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('title')) options.title = el.getAttribute('title') ?? undefined;
  if (el.hasAttribute('subtitle')) options.subtitle = el.getAttribute('subtitle') ?? undefined;
  if (el.hasAttribute('image')) options.image = el.getAttribute('image') ?? undefined;`,
    observed: ['title', 'subtitle', 'image']
  },

  liquidGlass: {
    types: `export interface LiquidGlassOptions {
  blur?: number;
  borderRadius?: number;
  slotElement?: HTMLElement;
  defaultContent?: string;
}
export interface LiquidGlassController {
  update(o: Partial<LiquidGlassOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type LiquidGlassProps = LiquidGlassOptions;`,
    engine: `
import type { LiquidGlassController, LiquidGlassOptions } from './types';
const P = '${p('liquidGlass')}';
export function createLiquidGlass(container: HTMLElement, initial: LiquidGlassOptions = {}): LiquidGlassController {
  let opts: LiquidGlassOptions = { blur: 16, borderRadius: 20, defaultContent: '液态玻璃面板', ...initial };
  const root = document.createElement('div'); root.className = P;
  const panel = document.createElement('div'); panel.className = \`\${P}__panel\`;
  const content = document.createElement('div'); content.className = \`\${P}__content\`;
  panel.appendChild(content); root.appendChild(panel); container.appendChild(root);

  const mountSlot = () => {
    content.replaceChildren();
    if (opts.slotElement) {
      content.appendChild(opts.slotElement);
    } else {
      content.textContent = opts.defaultContent ?? '液态玻璃面板';
    }
  };

  const render = () => {
    panel.style.setProperty('--glass-blur', \`\${opts.blur ?? 16}px\`);
    panel.style.setProperty('--glass-radius', \`\${opts.borderRadius ?? 20}px\`);
    mountSlot();
  };
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    getSlot: () => content,
    destroy() { root.remove(); }
  };
}`,
    element: `  if (el.hasAttribute('blur')) options.blur = Number(el.getAttribute('blur'));
  if (el.hasAttribute('border-radius')) options.borderRadius = Number(el.getAttribute('border-radius'));`,
    observed: ['blur', 'border-radius']
  },

  magneticButton: {
    types: `export interface MagneticButtonOptions {
  strength?: number;
  color?: string;
  slotElement?: HTMLElement;
  defaultContent?: string;
}
export interface MagneticButtonController {
  update(o: Partial<MagneticButtonOptions>): void;
  getSlot(): HTMLButtonElement;
  destroy(): void;
}
export type MagneticButtonProps = MagneticButtonOptions;`,
    engine: `
import type { MagneticButtonController, MagneticButtonOptions } from './types';
const P = '${p('magneticButton')}';
export function createMagneticButton(container: HTMLElement, initial: MagneticButtonOptions = {}): MagneticButtonController {
  let opts: MagneticButtonOptions = { strength: 0.4, color: '#6366f1', defaultContent: '磁吸按钮', ...initial };
  const wrap = document.createElement('div'); wrap.className = P;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = \`\${P}__btn\`;
  wrap.appendChild(btn); container.appendChild(wrap);

  const mountSlot = () => {
    btn.replaceChildren();
    if (opts.slotElement) {
      btn.appendChild(opts.slotElement);
    } else {
      btn.textContent = opts.defaultContent ?? '磁吸按钮';
    }
  };

  const onMove = (e: MouseEvent) => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const s = opts.strength ?? 0.4;
    btn.style.transform = \`translate(\${(e.clientX - cx) * s}px, \${(e.clientY - cy) * s}px)\`;
  };
  const onLeave = () => { btn.style.transform = 'translate(0, 0)'; };

  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', onLeave);

  const render = () => {
    btn.style.setProperty('--btn-color', opts.color ?? '#6366f1');
    mountSlot();
  };
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    getSlot: () => btn,
    destroy() {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('strength')) options.strength = Number(el.getAttribute('strength'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['strength', 'color']
  },

  spotlight: {
    types: `export interface SpotlightOptions {
  radius?: number;
  dimColor?: string;
  slotElement?: HTMLElement;
}
export interface SpotlightController {
  update(o: Partial<SpotlightOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type SpotlightProps = SpotlightOptions;`,
    engine: `
import type { SpotlightController, SpotlightOptions } from './types';
const P = '${p('spotlight')}';
export function createSpotlight(container: HTMLElement, initial: SpotlightOptions = {}): SpotlightController {
  let opts: SpotlightOptions = { radius: 120, dimColor: 'rgba(0, 0, 0, 0.85)', ...initial };
  const root = document.createElement('div'); root.className = P;
  const content = document.createElement('div'); content.className = \`\${P}__content\`;
  const overlay = document.createElement('div'); overlay.className = \`\${P}__overlay\`;
  root.append(content, overlay); container.appendChild(root);

  const onMove = (e: MouseEvent) => {
    const rect = root.getBoundingClientRect();
    root.style.setProperty('--spot-x', \`\${e.clientX - rect.left}px\`);
    root.style.setProperty('--spot-y', \`\${e.clientY - rect.top}px\`);
  };
  root.addEventListener('mousemove', onMove);

  const mountSlot = () => {
    if (opts.slotElement && !content.contains(opts.slotElement)) {
      content.replaceChildren();
      content.appendChild(opts.slotElement);
    }
  };

  const render = () => {
    root.style.setProperty('--spot-radius', \`\${opts.radius ?? 120}px\`);
    root.style.setProperty('--dim-color', opts.dimColor ?? 'rgba(0, 0, 0, 0.85)');
    mountSlot();
  };
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    getSlot: () => content,
    destroy() {
      root.removeEventListener('mousemove', onMove);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('radius')) options.radius = Number(el.getAttribute('radius'));
  if (el.hasAttribute('dim-color')) options.dimColor = el.getAttribute('dim-color') ?? undefined;`,
    observed: ['radius', 'dim-color']
  },

  barcodeScan: {
    types: `export interface BarcodeScanOptions {
  scanColor?: string;
  speed?: number;
  slotElement?: HTMLElement;
  defaultContent?: string;
}
export interface BarcodeScanController {
  update(o: Partial<BarcodeScanOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type BarcodeScanProps = BarcodeScanOptions;`,
    engine: `
import type { BarcodeScanController, BarcodeScanOptions } from './types';
const P = '${p('barcodeScan')}';
export function createBarcodeScan(container: HTMLElement, initial: BarcodeScanOptions = {}): BarcodeScanController {
  let opts: BarcodeScanOptions = { scanColor: '#22c55e', speed: 2.5, defaultContent: 'SCAN ME', ...initial };
  const root = document.createElement('div'); root.className = P;
  const content = document.createElement('div'); content.className = \`\${P}__content\`;
  const overlay = document.createElement('div'); overlay.className = \`\${P}__overlay\`;
  const scanLine = document.createElement('div'); scanLine.className = \`\${P}__scan-line\`;
  const glitchLayer = document.createElement('div'); glitchLayer.className = \`\${P}__glitch-layer\`;
  overlay.append(scanLine, glitchLayer);
  const corners = document.createElement('div'); corners.className = \`\${P}__corners\`;
  for (let i = 0; i < 4; i++) corners.appendChild(document.createElement('span'));
  root.append(content, overlay, corners); container.appendChild(root);

  const mountSlot = () => {
    content.replaceChildren();
    if (opts.slotElement) {
      content.appendChild(opts.slotElement);
    } else {
      const ph = document.createElement('span');
      ph.className = \`\${P}__placeholder\`;
      ph.textContent = opts.defaultContent ?? 'SCAN ME';
      content.appendChild(ph);
    }
  };

  const render = () => {
    root.style.setProperty('--scan-color', opts.scanColor ?? '#22c55e');
    root.style.setProperty('--scan-speed', \`\${opts.speed ?? 2.5}s\`);
    mountSlot();
  };
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    getSlot: () => content,
    destroy() { root.remove(); }
  };
}`,
    element: `  if (el.hasAttribute('scan-color')) options.scanColor = el.getAttribute('scan-color') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));`,
    observed: ['scan-color', 'speed']
  },

  waveButton: {
    types: `export interface WaveButtonOptions {
  text?: string;
  color?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  buttonProps?: Record<string, unknown>;
}
export interface WaveButtonController {
  update(o: Partial<WaveButtonOptions>): void;
  getButton(): HTMLButtonElement;
  destroy(): void;
}
export type WaveButtonProps = WaveButtonOptions;`,
    engine: `
import type { WaveButtonController, WaveButtonOptions } from './types';
const P = '${p('waveButton')}';
export function createWaveButton(container: HTMLElement, initial: WaveButtonOptions = {}): WaveButtonController {
  let opts: WaveButtonOptions = { text: '点我试试', color: '#38bdf8', ...initial };
  const root = document.createElement('div'); root.className = P;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = \`\${P}__btn\`;
  const label = document.createElement('span'); label.className = \`\${P}__label\`;
  btn.append(
    Object.assign(document.createElement('span'), { className: \`\${P}__wave\` }),
    Object.assign(document.createElement('span'), { className: \`\${P}__wave\` }),
    label
  );
  root.appendChild(btn); container.appendChild(root);

  const render = () => {
    label.textContent = opts.text ?? '点我试试';
    btn.style.setProperty('--wave-color', opts.color ?? '#38bdf8');
    btn.className = \`\${P}__btn\${opts.className ? \` \${opts.className}\` : ''}\`.trim();
    if (opts.style) {
      Object.entries(opts.style).forEach(([k, v]) => {
        if (v != null) (btn.style as Record<string, string>)[k] = String(v);
      });
    }
  };
  render();

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    getButton: () => btn,
    destroy() { root.remove(); }
  };
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['text', 'color']
  },

  scrambleText: {
    types: `export interface ScrambleTextOptions { text?: string; duration?: number; charset?: string; }
export interface ScrambleTextController { update(o: Partial<ScrambleTextOptions>): void; destroy(): void; }
export type ScrambleTextProps = ScrambleTextOptions;`,
    engine: `
import type { ScrambleTextController, ScrambleTextOptions } from './types';
const P = '${p('scrambleText')}';
const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
export function createScrambleText(container: HTMLElement, initial: ScrambleTextOptions = {}): ScrambleTextController {
  let opts: ScrambleTextOptions = { text: 'DECRYPTED', duration: 2000, charset: DEFAULT_CHARSET, ...initial };
  let frameId = 0;
  let start = 0;
  let cancelled = false;

  const root = document.createElement('div'); root.className = P;
  const pEl = document.createElement('p'); pEl.className = \`\${P}__text\`;
  const cursor = document.createElement('span'); cursor.className = \`\${P}__cursor\`;
  pEl.appendChild(cursor);
  root.appendChild(pEl); container.appendChild(root);

  const run = () => {
    cancelled = false;
    if (frameId) cancelAnimationFrame(frameId);
    start = performance.now();
    const chars = (opts.charset?.length ?? 0) > 0 ? opts.charset! : DEFAULT_CHARSET;
    const target = opts.text ?? 'DECRYPTED';

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / (opts.duration ?? 2000), 1);
      const revealed = Math.floor(progress * target.length);
      const display = target.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i < revealed) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      pEl.firstChild?.nodeType === Node.TEXT_NODE
        ? (pEl.firstChild as Text).data = display
        : pEl.insertBefore(document.createTextNode(display), cursor);
      if (pEl.childNodes.length > 2) pEl.childNodes[0]?.remove();
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else {
        pEl.replaceChildren(document.createTextNode(target), cursor);
      }
    };
    frameId = requestAnimationFrame(tick);
  };

  run();

  return {
    update(n) { opts = { ...opts, ...n }; run(); },
    destroy() {
      cancelled = true;
      cancelAnimationFrame(frameId);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));`,
    observed: ['text', 'duration']
  },

  rotatingText: {
    types: `export interface RotatingTextOptions {
  texts?: string[];
  interval?: number;
  stagger?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  highlightColor?: string;
}
export interface RotatingTextController { update(o: Partial<RotatingTextOptions>): void; destroy(): void; }
export type RotatingTextProps = RotatingTextOptions;`,
    engine: `
import type { RotatingTextController, RotatingTextOptions } from './types';
const P = '${p('rotatingText')}';
const DEFAULT_TEXTS = ['React', 'Motion', 'Design', 'COS'];

const splitChars = (text: string): string[] => {
  const IntlWith = Intl as typeof Intl & { Segmenter?: new (l: string, o: { granularity: 'grapheme' }) => { segment(i: string): Iterable<{ segment: string }> } };
  if (IntlWith.Segmenter) {
    return Array.from(new IntlWith.Segmenter('en', { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
};

export function createRotatingText(container: HTMLElement, initial: RotatingTextOptions = {}): RotatingTextController {
  let opts: RotatingTextOptions = {
    texts: DEFAULT_TEXTS, interval: 2200, stagger: 40, duration: 420,
    fontSize: 56, color: '#0f172a', highlightColor: '#38bdf8', ...initial
  };
  let index = 0;
  let phase: 'enter' | 'exit' = 'enter';
  let exitTimer = 0;
  let swapTimer = 0;
  let cancelled = false;

  const root = document.createElement('div'); root.className = P;
  const badge = document.createElement('div'); badge.className = \`\${P}__badge\`;
  root.appendChild(badge); container.appendChild(root);

  const safeTexts = () => (opts.texts?.length ? opts.texts! : DEFAULT_TEXTS);

  const render = () => {
    const texts = safeTexts();
    const chars = splitChars(texts[index] ?? '');
    badge.style.fontSize = \`\${opts.fontSize ?? 56}px\`;
    badge.style.color = opts.color ?? '#0f172a';
    badge.style.setProperty('--rt-bg', opts.highlightColor ?? '#38bdf8');
    badge.style.setProperty('--rt-duration', \`\${opts.duration ?? 420}ms\`);
    badge.replaceChildren();
    chars.forEach((char, i) => {
      const s = document.createElement('span');
      s.className = \`\${P}__char \${phase === 'enter' ? \`\${P}__enter\` : \`\${P}__exit\`}\`;
      const delay = phase === 'enter' ? i * (opts.stagger ?? 40) : (chars.length - 1 - i) * (opts.stagger ?? 40);
      s.style.animationDelay = \`\${delay}ms\`;
      s.textContent = char === ' ' ? '\\u00A0' : char;
      badge.appendChild(s);
    });
  };

  const clearTimers = () => {
    if (exitTimer) clearTimeout(exitTimer);
    if (swapTimer) clearTimeout(swapTimer);
    exitTimer = swapTimer = 0;
  };

  const schedule = () => {
    clearTimers();
    if (cancelled) return;
    const texts = safeTexts();
    const chars = splitChars(texts[index] ?? '');
    exitTimer = window.setTimeout(() => {
      if (cancelled) return;
      phase = 'exit';
      render();
      swapTimer = window.setTimeout(() => {
        if (cancelled) return;
        index = (index + 1) % texts.length;
        phase = 'enter';
        render();
        schedule();
      }, chars.length * (opts.stagger ?? 40) + (opts.duration ?? 420));
    }, opts.interval ?? 2200);
  };

  render();
  schedule();

  return {
    update(n) {
      opts = { ...opts, ...n };
      index = 0;
      phase = 'enter';
      render();
      schedule();
    },
    destroy() {
      cancelled = true;
      clearTimers();
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['interval', 'font-size', 'color']
  },

  textMorph: {
    types: `export interface TextMorphOptions {
  texts?: string[];
  interval?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
}
export interface TextMorphController { update(o: Partial<TextMorphOptions>): void; destroy(): void; }
export type TextMorphProps = TextMorphOptions;`,
    engine: `
import { clamp } from '@cos-design/shared';
import type { TextMorphController, TextMorphOptions } from './types';
const P = '${p('textMorph')}';
const DEFAULT_TEXTS = ['COS DESIGN', 'TEXT MORPH', 'SMOOTH TRANSITION'];

export function createTextMorph(container: HTMLElement, initial: TextMorphOptions = {}): TextMorphController {
  let opts: TextMorphOptions = {
    texts: DEFAULT_TEXTS, interval: 2200, duration: 680, fontSize: 64, color: '#f8fafc', ...initial
  };
  let index = 0;
  let progress = 0;
  let frameId = 0;
  let timerId = 0;
  let cancelled = false;

  const root = document.createElement('div'); root.className = P;
  const stage = document.createElement('div'); stage.className = \`\${P}__stage\`;
  const currentEl = document.createElement('span');
  currentEl.className = \`\${P}__layer \${P}__current\`;
  const nextEl = document.createElement('span');
  nextEl.className = \`\${P}__layer \${P}__next\`;
  stage.append(currentEl, nextEl); root.appendChild(stage); container.appendChild(root);

  const safeTexts = () => (opts.texts?.length ? opts.texts! : DEFAULT_TEXTS);

  const applyStyles = () => {
    root.style.setProperty('--morph-color', opts.color ?? '#f8fafc');
    stage.style.fontSize = \`\${opts.fontSize ?? 64}px\`;
    const texts = safeTexts();
    const current = texts[index];
    const next = texts[(index + 1) % texts.length];
    currentEl.textContent = current;
    nextEl.textContent = next;
    currentEl.style.opacity = String(1 - progress);
    nextEl.style.opacity = String(progress);
    currentEl.style.filter = \`blur(\${progress * 14}px)\`;
    nextEl.style.filter = \`blur(\${(1 - progress) * 14}px)\`;
    currentEl.style.transform = \`scale(\${1 - progress * 0.08}) translateY(\${progress * -8}px)\`;
    nextEl.style.transform = \`scale(\${0.92 + progress * 0.08}) translateY(\${(1 - progress) * 8}px)\`;
  };

  const schedule = () => {
    if (cancelled) return;
    timerId = window.setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        if (cancelled) return;
        progress = clamp((now - start) / Math.max(opts.duration ?? 680, 16), 0, 1);
        applyStyles();
        if (progress < 1) frameId = requestAnimationFrame(animate);
        else {
          index = (index + 1) % safeTexts().length;
          progress = 0;
          applyStyles();
          schedule();
        }
      };
      frameId = requestAnimationFrame(animate);
    }, opts.interval ?? 2200);
  };

  applyStyles();
  schedule();

  return {
    update(n) {
      opts = { ...opts, ...n };
      index = 0;
      progress = 0;
      if (timerId) clearTimeout(timerId);
      cancelAnimationFrame(frameId);
      applyStyles();
      schedule();
    },
    destroy() {
      cancelled = true;
      clearTimeout(timerId);
      cancelAnimationFrame(frameId);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  if (el.hasAttribute('duration')) options.duration = Number(el.getAttribute('duration'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['interval', 'duration', 'font-size', 'color']
  },

  typewriter: {
    types: `export interface TypewriterOptions {
  texts?: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
}
export interface TypewriterController { update(o: Partial<TypewriterOptions>): void; destroy(): void; }
export type TypewriterProps = TypewriterOptions;`,
    engine: `
import type { TypewriterController, TypewriterOptions } from './types';
const P = '${p('typewriter')}';
const DEFAULT_TEXTS = ['Hello, cos-design!', '欢迎来到组件库 ✨', 'Build something fun 🚀'];

export function createTypewriter(container: HTMLElement, initial: TypewriterOptions = {}): TypewriterController {
  let opts: TypewriterOptions = { texts: DEFAULT_TEXTS, speed: 100, deleteSpeed: 50, pause: 2000, ...initial };
  let displayText = '';
  let textIndex = 0;
  let isDeleting = false;
  let timerId = 0;
  let cancelled = false;

  const root = document.createElement('div'); root.className = P;
  const terminal = document.createElement('div'); terminal.className = \`\${P}__terminal\`;
  const dots = document.createElement('div'); dots.className = \`\${P}__dots\`;
  for (let i = 0; i < 3; i++) dots.appendChild(document.createElement('span'));
  const pEl = document.createElement('p'); pEl.className = \`\${P}__text\`;
  const prompt = document.createElement('span'); prompt.className = \`\${P}__prompt\`; prompt.textContent = '>';
  const cursor = document.createElement('span'); cursor.className = \`\${P}__cursor\`; cursor.textContent = '|';
  const textNode = document.createTextNode('');
  pEl.append(prompt, textNode, cursor);
  terminal.append(dots, pEl); root.appendChild(terminal); container.appendChild(root);

  const safeTexts = () => (opts.texts?.length ? opts.texts! : DEFAULT_TEXTS);

  const tick = () => {
    if (cancelled) return;
    const texts = safeTexts();
    const current = texts[textIndex % texts.length];
    if (!isDeleting && displayText === current) {
      timerId = window.setTimeout(() => { isDeleting = true; tick(); }, opts.pause ?? 2000);
    } else if (isDeleting && displayText === '') {
      timerId = window.setTimeout(() => {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        tick();
      }, 0);
    } else {
      displayText = isDeleting
        ? current.slice(0, displayText.length - 1)
        : current.slice(0, displayText.length + 1);
      textNode.data = displayText;
      timerId = window.setTimeout(tick, isDeleting ? (opts.deleteSpeed ?? 50) : (opts.speed ?? 100));
    }
  };

  tick();

  return {
    update(n) {
      opts = { ...opts, ...n };
      displayText = '';
      textIndex = 0;
      isDeleting = false;
      if (timerId) clearTimeout(timerId);
      textNode.data = '';
      tick();
    },
    destroy() {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('delete-speed')) options.deleteSpeed = Number(el.getAttribute('delete-speed'));
  if (el.hasAttribute('pause')) options.pause = Number(el.getAttribute('pause'));`,
    observed: ['speed', 'delete-speed', 'pause']
  },

  trueFocus: {
    types: `export interface TrueFocusOptions {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  fontSize?: number;
  color?: string;
}
export interface TrueFocusController { update(o: Partial<TrueFocusOptions>): void; destroy(): void; }
export type TrueFocusProps = TrueFocusOptions;`,
    engine: `
import type { TrueFocusController, TrueFocusOptions } from './types';
const P = '${p('trueFocus')}';
export function createTrueFocus(container: HTMLElement, initial: TrueFocusOptions = {}): TrueFocusController {
  let opts: TrueFocusOptions = {
    sentence: 'True Focus', separator: ' ', manualMode: false, blurAmount: 5,
    borderColor: '#22c55e', glowColor: 'rgb(34 197 94 / 60%)',
    animationDuration: 0.5, pauseBetweenAnimations: 1, fontSize: 48, color: '#f8fafc', ...initial
  };
  let currentIndex = 0;
  let lastActiveIndex = 0;
  let intervalId = 0;

  const root = document.createElement('div'); root.className = P;
  const stage = document.createElement('div'); stage.className = \`\${P}__stage\`;
  const focusFrame = document.createElement('div'); focusFrame.className = \`\${P}__focus-frame\`;
  for (const c of ['tl', 'tr', 'bl', 'br']) {
    const corner = document.createElement('span');
    corner.className = \`\${P}__corner \${P}__\${c}\`;
    focusFrame.appendChild(corner);
  }
  stage.appendChild(focusFrame);
  root.appendChild(stage); container.appendChild(root);

  const wordEls: HTMLSpanElement[] = [];

  const updateFocusRect = () => {
    const active = wordEls[currentIndex];
    if (!active) return;
    const parentRect = stage.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    focusFrame.style.transform = \`translate(\${activeRect.left - parentRect.left}px, \${activeRect.top - parentRect.top}px)\`;
    focusFrame.style.width = \`\${activeRect.width}px\`;
    focusFrame.style.height = \`\${activeRect.height}px\`;
    focusFrame.style.opacity = currentIndex >= 0 ? '1' : '0';
  };

  const render = () => {
    stage.style.fontSize = \`\${opts.fontSize ?? 48}px\`;
    stage.style.setProperty('--focus-color', opts.color ?? '#f8fafc');
    stage.style.setProperty('--border-color', opts.borderColor ?? '#22c55e');
    stage.style.setProperty('--glow-color', opts.glowColor ?? 'rgb(34 197 94 / 60%)');
    stage.style.setProperty('--focus-duration', \`\${opts.animationDuration ?? 0.5}s\`);
    wordEls.length = 0;
    stage.querySelectorAll(\`.\${P}__word\`).forEach((el) => el.remove());
    const words = (opts.sentence ?? '').split(opts.separator ?? ' ').filter(Boolean);
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = \`\${P}__word\`;
      span.textContent = word;
      const isActive = index === currentIndex;
      span.style.filter = isActive ? 'blur(0px)' : \`blur(\${opts.blurAmount ?? 5}px)\`;
      span.style.cursor = opts.manualMode ? 'pointer' : 'default';
      span.addEventListener('mouseenter', () => {
        if (!opts.manualMode) return;
        lastActiveIndex = index;
        currentIndex = index;
        render();
      });
      span.addEventListener('mouseleave', () => {
        if (!opts.manualMode) return;
        currentIndex = lastActiveIndex;
        render();
      });
      stage.insertBefore(span, focusFrame);
      wordEls.push(span);
    });
    updateFocusRect();
  };

  const startAuto = () => {
    if (intervalId) clearInterval(intervalId);
    if (opts.manualMode) return;
    const words = (opts.sentence ?? '').split(opts.separator ?? ' ').filter(Boolean);
    if (!words.length) return;
    intervalId = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      render();
    }, ((opts.animationDuration ?? 0.5) + (opts.pauseBetweenAnimations ?? 1)) * 1000);
  };

  render();
  startAuto();

  return {
    update(n) {
      opts = { ...opts, ...n };
      currentIndex = 0;
      render();
      startAuto();
    },
    destroy() {
      if (intervalId) clearInterval(intervalId);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('sentence')) options.sentence = el.getAttribute('sentence') ?? undefined;
  if (el.hasAttribute('manual-mode')) options.manualMode = true;
  if (el.hasAttribute('blur-amount')) options.blurAmount = Number(el.getAttribute('blur-amount'));
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;`,
    observed: ['sentence', 'manual-mode', 'blur-amount', 'font-size', 'color']
  },

  charge: {
    types: `export interface ChargeOptions {
  initQuantity?: number;
  value?: number;
  onChange?: (value: number) => void;
  onComplete?: () => void;
  autoCharge?: boolean;
  interval?: number;
  step?: number;
}
export interface ChargeController { update(o: Partial<ChargeOptions>): void; destroy(): void; }
export type ChargeProps = ChargeOptions;`,
    engine: `
import { clamp } from '@cos-design/shared';
import type { ChargeController, ChargeOptions } from './types';
const P = '${p('charge')}';
const BUBBLE_COUNT = 15;
const CIRCLE_TOP = 10;
const CIRCLE_SIZE = 300;
const MERGE_FROM_TOP = CIRCLE_TOP + CIRCLE_SIZE - 52;

export function createCharge(container: HTMLElement, initial: ChargeOptions = {}): ChargeController {
  let opts: ChargeOptions = {
    initQuantity: 0, autoCharge: true, interval: 500, step: 0.01, ...initial
  };
  let innerQuantity = clamp(opts.initQuantity ?? 0, 0, 100);
  const isControlled = () => opts.value !== undefined;
  const quantity = () => clamp(isControlled() ? opts.value! : innerQuantity, 0, 100);
  let completed = quantity() >= 100;
  let chargeTimer = 0;
  let resizeObs: ResizeObserver | null = null;
  const onChangeRef = { current: opts.onChange };
  const onCompleteRef = { current: opts.onComplete };

  const root = document.createElement('div');
  root.className = P;
  const contrast = document.createElement('div'); contrast.className = \`\${P}__contrast\`;
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const b = document.createElement('span');
    b.className = \`\${P}__bubble\`;
    b.dataset.index = String(i + 1);
    contrast.appendChild(b);
  }
  const circle = document.createElement('div'); circle.className = \`\${P}__circle\`;
  const button = document.createElement('div'); button.className = \`\${P}__button\`;
  contrast.append(circle, button);
  const textEl = document.createElement('div'); textEl.className = \`\${P}__text\`;
  root.append(contrast, textEl);
  container.appendChild(root);

  const updateHeight = () => {
    const riseMax = Math.max(0, root.clientHeight - MERGE_FROM_TOP);
    root.style.setProperty('--charge-rise-max', \`\${riseMax}px\`);
  };

  const render = () => {
    const q = quantity();
    root.dataset.auto = (opts.autoCharge ?? true) ? 'true' : 'false';
    root.style.setProperty('--charge-pct', String(q));
    textEl.textContent = \`\${q.toFixed(2)}%\`;
    if (q < 100) completed = false;
    else if (!completed) {
      completed = true;
      onCompleteRef.current?.();
    }
  };

  const startCharge = () => {
    if (chargeTimer) clearInterval(chargeTimer);
    if (!(opts.autoCharge ?? true)) return;
    chargeTimer = window.setInterval(() => {
      if (quantity() >= 100) return;
      const next = Math.min(100, Number((quantity() + (opts.step ?? 0.01)).toFixed(2)));
      onChangeRef.current?.(next);
      if (!isControlled()) innerQuantity = next;
      render();
    }, opts.interval ?? 500);
  };

  resizeObs = new ResizeObserver(updateHeight);
  resizeObs.observe(root);
  updateHeight();
  render();
  startCharge();

  return {
    update(n) {
      opts = { ...opts, ...n };
      if (n.onChange !== undefined) onChangeRef.current = n.onChange;
      if (n.onComplete !== undefined) onCompleteRef.current = n.onComplete;
      if (n.initQuantity !== undefined && !isControlled()) innerQuantity = clamp(n.initQuantity, 0, 100);
      render();
      startCharge();
    },
    destroy() {
      if (chargeTimer) clearInterval(chargeTimer);
      resizeObs?.disconnect();
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('init-quantity')) options.initQuantity = Number(el.getAttribute('init-quantity'));
  if (el.hasAttribute('value')) options.value = Number(el.getAttribute('value'));
  if (el.hasAttribute('auto-charge')) options.autoCharge = true;
  if (el.hasAttribute('interval')) options.interval = Number(el.getAttribute('interval'));
  options.onComplete = () => el.dispatchEvent(new CustomEvent('complete', { bubbles: true }));`,
    observed: ['init-quantity', 'value', 'auto-charge', 'interval']
  },

  burnAway: {
    exposeMethods: ['ignite'],
    types: `export interface BurnAwayOptions {
  text?: string;
  fontSize?: number;
  onComplete?: () => void;
  completedText?: string;
}
export interface BurnAwayController {
  update(o: Partial<BurnAwayOptions>): void;
  ignite(): void;
  destroy(): void;
}
export type BurnAwayProps = BurnAwayOptions;
export type BurnAwayHandle = Pick<BurnAwayController, 'ignite'>;`,
    engine: `
import type { BurnAwayController, BurnAwayOptions } from './types';
const P = '${p('burnAway')}';

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; }

export function createBurnAway(container: HTMLElement, initial: BurnAwayOptions = {}): BurnAwayController {
  let opts: BurnAwayOptions = { text: 'BURN', fontSize: 64, completedText: 'Gone.', ...initial };
  let burning = false;
  let done = false;
  let completed = false;
  let frameId = 0;
  let animCancelled = false;
  const onCompleteRef = { current: opts.onComplete };

  const root = document.createElement('div'); root.className = P;
  const stage = document.createElement('div'); stage.className = \`\${P}__stage\`;
  const textEl = document.createElement('span'); textEl.className = \`\${P}__text\`;
  const canvas = document.createElement('canvas'); canvas.className = \`\${P}__canvas\`;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = \`\${P}__trigger\`;
  trigger.textContent = 'Ignite';
  const hint = document.createElement('p'); hint.className = \`\${P}__hint\`;
  stage.append(textEl, canvas);
  root.append(stage, trigger, hint);
  container.appendChild(root);

  const syncUi = () => {
    textEl.textContent = opts.text ?? 'BURN';
    textEl.style.fontSize = \`\${opts.fontSize ?? 64}px\`;
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
    canvas.style.width = \`\${w}px\`;
    canvas.style.height = \`\${h}px\`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const offscreen = document.createElement('canvas');
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.scale(dpr, dpr);
    offCtx.font = \`900 \${opts.fontSize ?? 64}px system-ui, sans-serif\`;
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
            x, y, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 3 - 1,
            life: 1, maxLife: 0.6 + Math.random() * 0.6, size: 2 + Math.random() * 3
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
        ctx.fillStyle = \`rgb(255,\${Math.max(0, 200 - heat * 200)},\${Math.max(0, 80 - heat * 80)})\`;
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
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('completed-text')) options.completedText = el.getAttribute('completed-text') ?? undefined;
  options.onComplete = () => el.dispatchEvent(new CustomEvent('complete', { bubbles: true }));`,
    observed: ['text', 'font-size', 'completed-text'],
    elementMethods: `
  ignite() {
    this.ctrl?.ignite();
  }`
  },

  fuzzyText: {
    types: `export interface FuzzyTextOptions {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  baseIntensity?: number;
  hoverIntensity?: number;
  enableHover?: boolean;
  fuzzRange?: number;
}
export interface FuzzyTextController { update(o: Partial<FuzzyTextOptions>): void; destroy(): void; }
export type FuzzyTextProps = FuzzyTextOptions;`,
    engine: `
import type { FuzzyTextController, FuzzyTextOptions } from './types';
const P = '${p('fuzzyText')}';

export function createFuzzyText(container: HTMLElement, initial: FuzzyTextOptions = {}): FuzzyTextController {
  let opts: FuzzyTextOptions = {
    text: 'FUZZY', fontSize: 72, fontWeight: 900, color: '#f8fafc',
    baseIntensity: 0.18, hoverIntensity: 0.5, enableHover: true, fuzzRange: 30, ...initial
  };
  let frameId = 0;
  let cancelled = false;
  let cleanup: (() => void) | null = null;

  const root = document.createElement('div'); root.className = P;
  const canvas = document.createElement('canvas'); canvas.className = \`\${P}__canvas\`;
  root.appendChild(canvas); container.appendChild(root);

  const init = async () => {
    cancelled = false;
    cleanup?.();
    cleanup = null;
    if (frameId) cancelAnimationFrame(frameId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontFamily = window.getComputedStyle(canvas).fontFamily || 'sans-serif';
    const fontString = \`\${opts.fontWeight ?? 900} \${opts.fontSize ?? 72}px \${fontFamily}\`;
    try { await document.fonts.load(fontString); } catch { await document.fonts.ready; }
    if (cancelled) return;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.font = fontString;
    offCtx.textBaseline = 'alphabetic';
    const text = opts.text ?? 'FUZZY';
    const metrics = offCtx.measureText(text);
    const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
    const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
    const actualAscent = metrics.actualBoundingBoxAscent ?? (opts.fontSize ?? 72);
    const actualDescent = metrics.actualBoundingBoxDescent ?? (opts.fontSize ?? 72) * 0.2;
    const textBoundingWidth = Math.ceil(actualLeft + actualRight);
    const tightHeight = Math.ceil(actualAscent + actualDescent);
    const extraWidthBuffer = 10;
    const offscreenWidth = textBoundingWidth + extraWidthBuffer;
    offscreen.width = offscreenWidth;
    offscreen.height = tightHeight;
    offCtx.font = fontString;
    offCtx.fillStyle = opts.color ?? '#f8fafc';
    offCtx.fillText(text, extraWidthBuffer / 2 - actualLeft, actualAscent);

    const fuzzRange = opts.fuzzRange ?? 30;
    const horizontalMargin = fuzzRange + 20;
    canvas.width = offscreenWidth + horizontalMargin * 2;
    canvas.height = tightHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(horizontalMargin, 0);

    const interactiveLeft = horizontalMargin + extraWidthBuffer / 2;
    const interactiveRight = interactiveLeft + textBoundingWidth;
    let isHovering = false;

    const run = () => {
      if (cancelled) return;
      const intensity = isHovering ? (opts.hoverIntensity ?? 0.5) : (opts.baseIntensity ?? 0.18);
      ctx.clearRect(-fuzzRange - 20, -10, offscreenWidth + 2 * (fuzzRange + 20), tightHeight + 20);
      for (let j = 0; j < tightHeight; j++) {
        const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
        ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
      }
      frameId = requestAnimationFrame(run);
    };
    frameId = requestAnimationFrame(run);

    const onMove = (e: MouseEvent) => {
      if (!(opts.enableHover ?? true)) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      isHovering = x >= interactiveLeft && x <= interactiveRight && y >= 0 && y <= tightHeight;
    };
    const onLeave = () => { isHovering = false; };
    if (opts.enableHover ?? true) {
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseleave', onLeave);
    }
    cleanup = () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  };

  void init();

  return {
    update(n) { opts = { ...opts, ...n }; void init(); },
    destroy() {
      cancelled = true;
      cleanup?.();
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('enable-hover')) options.enableHover = true;`,
    observed: ['text', 'font-size', 'color', 'enable-hover']
  },

  curvedLoop: {
    types: `export interface CurvedLoopOptions {
  text?: string;
  speed?: number;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
  color?: string;
  fontSize?: number;
}
export interface CurvedLoopController { update(o: Partial<CurvedLoopOptions>): void; destroy(): void; }
export type CurvedLoopProps = CurvedLoopOptions;`,
    engine: `
import type { CurvedLoopController, CurvedLoopOptions } from './types';
const P = '${p('curvedLoop')}';

export function createCurvedLoop(container: HTMLElement, initial: CurvedLoopOptions = {}): CurvedLoopController {
  let opts: CurvedLoopOptions = {
    text: 'COS DESIGN ✦ CURVED LOOP ✦ ', speed: 2, curveAmount: 80,
    direction: 'left', interactive: true, color: '#f8fafc', fontSize: 56, ...initial
  };
  let spacing = 0;
  let offset = 0;
  let ready = false;
  let frameId = 0;
  let drag = false;
  let lastX = 0;
  let dir: 'left' | 'right' = opts.direction ?? 'left';
  let vel = 0;
  const pathId = \`curve-\${Math.random().toString(36).slice(2, 9)}\`;

  const root = document.createElement('div'); root.className = P;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', \`\${P}__svg\`);
  svg.setAttribute('viewBox', '0 0 1440 120');
  root.appendChild(svg); container.appendChild(root);

  const measureText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  measureText.setAttribute('xml:space', 'preserve');
  measureText.setAttribute('class', \`\${P}__measure\`);
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('id', pathId);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'transparent');
  const pathText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  pathText.setAttribute('xml:space', 'preserve');
  pathText.setAttribute('class', \`\${P}__path-text\`);
  const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
  textPath.setAttribute('href', \`#\${pathId}\`);
  textPath.setAttribute('xml:space', 'preserve');
  pathText.appendChild(textPath);
  svg.append(measureText, defs, pathText);
  defs.appendChild(path);

  const marqueeText = () => {
    const t = opts.text ?? '';
    const hasTrailing = /\\s|\\u00A0$/.test(t);
    return (hasTrailing ? t.replace(/\\s+$/, '') : t) + '\\u00A0';
  };

  const render = () => {
    dir = opts.direction ?? 'left';
    const curve = opts.curveAmount ?? 80;
    path.setAttribute('d', \`M-100,40 Q500,\${40 + curve} 1540,40\`);
    root.style.visibility = ready ? 'visible' : 'hidden';
    root.style.cursor = (opts.interactive ?? true) ? 'grab' : 'default';
    root.style.setProperty('--curve-color', opts.color ?? '#f8fafc');
    root.style.setProperty('--curve-font-size', \`\${opts.fontSize ?? 56}px\`);
    measureText.textContent = marqueeText();
    spacing = measureText.getComputedTextLength();
    ready = spacing > 0;
    if (ready) {
      offset = -spacing;
      textPath.setAttribute('startOffset', \`\${offset}px\`);
      const total = Array(Math.ceil(1800 / spacing) + 2).fill(marqueeText()).join('');
      textPath.textContent = total;
    }
  };

  const step = () => {
    if (!drag && ready && spacing > 0) {
      const delta = dir === 'right' ? (opts.speed ?? 2) : -(opts.speed ?? 2);
      offset += delta;
      if (offset <= -spacing) offset += spacing;
      if (offset > 0) offset -= spacing;
      textPath.setAttribute('startOffset', \`\${offset}px\`);
    }
    frameId = requestAnimationFrame(step);
  };

  const onDown = (e: PointerEvent) => {
    if (!(opts.interactive ?? true)) return;
    drag = true;
    lastX = e.clientX;
    vel = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!(opts.interactive ?? true) || !drag || !ready) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    vel = dx;
    offset += dx;
    if (offset <= -spacing) offset += spacing;
    if (offset > 0) offset -= spacing;
    textPath.setAttribute('startOffset', \`\${offset}px\`);
  };
  const endDrag = () => {
    if (!(opts.interactive ?? true)) return;
    drag = false;
    dir = vel > 0 ? 'right' : 'left';
  };

  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointerleave', endDrag);
  render();
  frameId = requestAnimationFrame(step);

  return {
    update(n) { opts = { ...opts, ...n }; render(); },
    destroy() {
      cancelAnimationFrame(frameId);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', endDrag);
      root.removeEventListener('pointerleave', endDrag);
      root.remove();
    }
  };
}`,
    element: `  if (el.hasAttribute('text')) options.text = el.getAttribute('text') ?? undefined;
  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));
  if (el.hasAttribute('curve-amount')) options.curveAmount = Number(el.getAttribute('curve-amount'));
  if (el.hasAttribute('interactive')) options.interactive = true;
  if (el.hasAttribute('color')) options.color = el.getAttribute('color') ?? undefined;
  if (el.hasAttribute('font-size')) options.fontSize = Number(el.getAttribute('font-size'));`,
    observed: ['text', 'speed', 'curve-amount', 'interactive', 'color', 'font-size']
  }
};

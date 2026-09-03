import type { CurvedLoopController, CurvedLoopOptions } from './types';
const P = 'cos-curved-loop';

export function createCurvedLoop(
  container: HTMLElement,
  initial: CurvedLoopOptions = {},
): CurvedLoopController {
  let opts: CurvedLoopOptions = {
    text: 'COS DESIGN ✦ CURVED LOOP ✦ ',
    speed: 2,
    curveAmount: 80,
    direction: 'left',
    interactive: true,
    color: '#f8fafc',
    fontSize: 56,
    ...initial,
  };
  let spacing = 0;
  let offset = 0;
  let ready = false;
  let frameId = 0;
  let drag = false;
  let lastX = 0;
  let dir: 'left' | 'right' = opts.direction ?? 'left';
  let vel = 0;
  const pathId = `curve-${Math.random().toString(36).slice(2, 9)}`;

  const root = document.createElement('div');
  root.className = P;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `${P}__svg`);
  svg.setAttribute('viewBox', '0 0 1440 120');
  root.appendChild(svg);
  container.appendChild(root);

  const measureText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  measureText.setAttribute('xml:space', 'preserve');
  measureText.setAttribute('class', `${P}__measure`);
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('id', pathId);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'transparent');
  const pathText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  pathText.setAttribute('xml:space', 'preserve');
  pathText.setAttribute('class', `${P}__path-text`);
  const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
  textPath.setAttribute('href', `#${pathId}`);
  textPath.setAttribute('xml:space', 'preserve');
  pathText.appendChild(textPath);
  svg.append(measureText, defs, pathText);
  defs.appendChild(path);

  const marqueeText = () => {
    const t = opts.text ?? '';
    const hasTrailing = /\s|\u00A0$/.test(t);
    return (hasTrailing ? t.replace(/\s+$/, '') : t) + '\u00A0';
  };

  const render = () => {
    dir = opts.direction ?? 'left';
    const curve = opts.curveAmount ?? 80;
    path.setAttribute('d', `M-100,40 Q500,${40 + curve} 1540,40`);
    root.style.visibility = ready ? 'visible' : 'hidden';
    root.style.cursor = (opts.interactive ?? true) ? 'grab' : 'default';
    root.style.setProperty('--curve-color', opts.color ?? '#f8fafc');
    root.style.setProperty('--curve-font-size', `${opts.fontSize ?? 56}px`);
    measureText.textContent = marqueeText();
    spacing = measureText.getComputedTextLength();
    ready = spacing > 0;
    if (ready) {
      offset = -spacing;
      textPath.setAttribute('startOffset', `${offset}px`);
      const total = Array(Math.ceil(1800 / spacing) + 2)
        .fill(marqueeText())
        .join('');
      textPath.textContent = total;
    }
  };

  const step = () => {
    if (!drag && ready && spacing > 0) {
      const delta = dir === 'right' ? (opts.speed ?? 2) : -(opts.speed ?? 2);
      offset += delta;
      if (offset <= -spacing) offset += spacing;
      if (offset > 0) offset -= spacing;
      textPath.setAttribute('startOffset', `${offset}px`);
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
    textPath.setAttribute('startOffset', `${offset}px`);
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
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      cancelAnimationFrame(frameId);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', endDrag);
      root.removeEventListener('pointerleave', endDrag);
      root.remove();
    },
  };
}

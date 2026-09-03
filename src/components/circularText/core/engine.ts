import type { CircularTextController, CircularTextOptions } from './types';
const P = 'cos-circular-text';
export function createCircularText(
  container: HTMLElement,
  initial: CircularTextOptions = {},
): CircularTextController {
  let opts: CircularTextOptions = {
    text: 'COS DESIGN • REACT BITS • ',
    spinDuration: 20,
    onHover: 'speedUp',
    fontSize: 22,
    radius: 90,
    color: '#f8fafc',
    ...initial,
  };
  let hovered = false;
  const root = document.createElement('div');
  root.className = P;
  const scaleWrap = document.createElement('div');
  scaleWrap.className = `${P}__scale-wrap`;
  const ring = document.createElement('div');
  ring.className = `${P}__ring`;
  scaleWrap.appendChild(ring);
  root.appendChild(scaleWrap);
  container.appendChild(root);

  const getDuration = () => {
    if (!hovered) return opts.spinDuration ?? 20;
    switch (opts.onHover) {
      case 'slowDown':
        return (opts.spinDuration ?? 20) * 2;
      case 'speedUp':
        return (opts.spinDuration ?? 20) / 4;
      case 'pause':
        return 0;
      case 'goBonkers':
        return Math.max((opts.spinDuration ?? 20) / 20, 0.2);
      default:
        return opts.spinDuration ?? 20;
    }
  };

  const render = () => {
    const letters = Array.from(opts.text ?? '');
    const radius = opts.radius ?? 90;
    const fontSize = opts.fontSize ?? 22;
    const size = radius * 2 + fontSize * 2;
    const duration = getDuration();
    scaleWrap.classList.toggle(`${P}__bonkers`, hovered && opts.onHover === 'goBonkers');
    ring.style.width = `${size}px`;
    ring.style.height = `${size}px`;
    ring.style.color = opts.color ?? '#f8fafc';
    ring.style.fontSize = `${fontSize}px`;
    ring.style.animationDuration = duration > 0 ? `${duration}s` : '';
    ring.style.animationPlayState = duration === 0 ? 'paused' : 'running';
    ring.replaceChildren();
    letters.forEach((letter, i) => {
      const span = document.createElement('span');
      span.className = `${P}__char`;
      const rot = (360 / letters.length) * i;
      span.style.transform = `rotate(${rot}deg) translateY(-${radius}px)`;
      span.textContent = letter === ' ' ? '\u00A0' : letter;
      ring.appendChild(span);
    });
  };

  const onEnter = () => {
    hovered = true;
    render();
  };
  const onLeave = () => {
    hovered = false;
    render();
  };
  scaleWrap.addEventListener('mouseenter', onEnter);
  scaleWrap.addEventListener('mouseleave', onLeave);
  render();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      scaleWrap.removeEventListener('mouseenter', onEnter);
      scaleWrap.removeEventListener('mouseleave', onLeave);
      root.remove();
    },
  };
}

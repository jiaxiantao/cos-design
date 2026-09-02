import type { BlurTextController, BlurTextOptions } from './types';
const P = 'cos-blur-text';
export function createBlurText(container: HTMLElement, initial: BlurTextOptions = {}): BlurTextController {
  let opts: BlurTextOptions = {
    text: 'BLUR TEXT',
    animateBy: 'words',
    direction: 'top',
    stagger: 120,
    duration: 500,
    fontSize: 56,
    color: '#f8fafc',
    ...initial
  };
  let inView = false;
  let done = false;
  let observer: IntersectionObserver | null = null;
  let completeTimer = 0;
  const onCompleteRef = { current: opts.onAnimationComplete };

  const root = document.createElement('div');
  root.className = P;
  const pEl = document.createElement('p');
  pEl.className = `${P}__text`;
  root.appendChild(pEl);
  container.appendChild(root);

  const getElements = () => (opts.animateBy === 'words' ? (opts.text ?? '').split(' ') : (opts.text ?? '').split(''));

  const render = () => {
    pEl.style.fontSize = `${opts.fontSize ?? 56}px`;
    pEl.style.setProperty('--blur-color', opts.color ?? '#f8fafc');
    pEl.style.setProperty('--blur-duration', `${opts.duration ?? 500}ms`);
    pEl.replaceChildren();
    const elements = getElements();
    const dir = opts.direction ?? 'top';
    elements.forEach((item, i) => {
      const span = document.createElement('span');
      span.className = `${P}__unit ${P}__${dir} ${inView ? `${P}__enter` : `${P}__idle`}`;
      span.style.animationDelay = `${i * (opts.stagger ?? 120)}ms`;
      span.textContent = item === ' ' ? '\u00A0' : item;
      pEl.appendChild(span);
      if (opts.animateBy === 'words' && i < elements.length - 1) {
        pEl.appendChild(document.createTextNode('\u00A0'));
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

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView = true;
        observer?.disconnect();
        observer = null;
        render();
        scheduleComplete();
      }
    },
    { threshold: 0.15 }
  );
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
      observer?.disconnect();
      if (completeTimer) window.clearTimeout(completeTimer);
      root.remove();
    }
  };
}

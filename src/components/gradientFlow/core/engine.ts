import type { GradientFlowController, GradientFlowOptions } from './types';
const P = 'cos-gradient-flow';
const DEFAULT_COLORS = ['#ff00de', '#7c3aed', '#00f0ff', '#38bdf8', '#ff00de'];
export function createGradientFlow(container: HTMLElement, initial: GradientFlowOptions = {}): GradientFlowController {
  let opts: GradientFlowOptions = { text: 'GRADIENT', colors: DEFAULT_COLORS, fontSize: 64, ...initial };
  const root = document.createElement('div');
  root.className = P;
  const h1 = document.createElement('h1');
  h1.className = `${P}__text`;
  root.appendChild(h1);
  container.appendChild(root);
  const render = () => {
    const colors = (opts.colors?.length ?? 0) >= 2 ? opts.colors! : DEFAULT_COLORS;
    h1.textContent = opts.text ?? 'GRADIENT';
    h1.style.fontSize = `${opts.fontSize ?? 64}px`;
    h1.style.backgroundImage = `linear-gradient(90deg, ${colors.join(', ')})`;
  };
  render();
  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    destroy() {
      root.remove();
    }
  };
}

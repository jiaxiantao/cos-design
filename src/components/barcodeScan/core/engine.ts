import type { BarcodeScanController, BarcodeScanOptions } from './types';
const P = 'cos-barcode-scan';
export function createBarcodeScan(
  container: HTMLElement,
  initial: BarcodeScanOptions = {},
): BarcodeScanController {
  let opts: BarcodeScanOptions = {
    scanColor: '#22c55e',
    speed: 2.5,
    defaultContent: 'SCAN ME',
    ...initial,
  };
  const root = document.createElement('div');
  root.className = P;
  const content = document.createElement('div');
  content.className = `${P}__content`;
  const overlay = document.createElement('div');
  overlay.className = `${P}__overlay`;
  const scanLine = document.createElement('div');
  scanLine.className = `${P}__scan-line`;
  const glitchLayer = document.createElement('div');
  glitchLayer.className = `${P}__glitch-layer`;
  overlay.append(scanLine, glitchLayer);
  const corners = document.createElement('div');
  corners.className = `${P}__corners`;
  for (let i = 0; i < 4; i++) corners.appendChild(document.createElement('span'));
  root.append(content, overlay, corners);
  container.appendChild(root);

  const mountSlot = () => {
    content.replaceChildren();
    if (opts.slotElement) {
      content.appendChild(opts.slotElement);
    } else {
      const ph = document.createElement('span');
      ph.className = `${P}__placeholder`;
      ph.textContent = opts.defaultContent ?? 'SCAN ME';
      content.appendChild(ph);
    }
  };

  const render = () => {
    root.style.setProperty('--scan-color', opts.scanColor ?? '#22c55e');
    root.style.setProperty('--scan-speed', `${opts.speed ?? 2.5}s`);
    mountSlot();
  };
  render();

  return {
    update(n) {
      opts = { ...opts, ...n };
      render();
    },
    getSlot: () => content,
    destroy() {
      root.remove();
    },
  };
}

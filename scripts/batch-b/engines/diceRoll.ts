import type { DiceRollController, DiceRollOptions } from './types';

const P = 'cos-dice-roll';

const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: 180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
};

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [
    [25, 25],
    [75, 75],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [25, 25],
    [75, 25],
    [25, 75],
    [75, 75],
  ],
  5: [
    [25, 25],
    [75, 25],
    [50, 50],
    [25, 75],
    [75, 75],
  ],
  6: [
    [25, 25],
    [75, 25],
    [25, 50],
    [75, 50],
    [25, 75],
    [75, 75],
  ],
};

export function createDiceRoll(
  container: HTMLElement,
  initial: DiceRollOptions = {},
): DiceRollController {
  let options: DiceRollOptions = {
    sides: 6,
    rollText: '掷骰子',
    rollingText: '掷骰中...',
    resultPrefix: '点数:',
    ...initial,
  };
  let destroyed = false;
  let rolling = false;
  let value = 1;
  let rotation = { x: 0, y: 0, z: 0 };
  let timer = 0;
  const onRollRef = { current: options.onRoll };

  const root = document.createElement('div');
  root.className = P;
  const scene = document.createElement('div');
  scene.className = `${P}__scene`;
  const cube = document.createElement('div');
  cube.className = `${P}__cube`;
  const faces: Record<number, HTMLElement> = {};
  for (let face = 1; face <= 6; face++) {
    const faceEl = document.createElement('div');
    faceEl.className = `${P}__face ${P}__face${face}`;
    for (const [left, top] of DOT_POSITIONS[face] ?? []) {
      const dot = document.createElement('span');
      dot.className = `${P}__dot`;
      dot.style.left = `${left}%`;
      dot.style.top = `${top}%`;
      faceEl.appendChild(dot);
    }
    cube.appendChild(faceEl);
    faces[face] = faceEl;
  }
  scene.appendChild(cube);
  const rollBtn = document.createElement('button');
  rollBtn.type = 'button';
  rollBtn.className = `${P}__roll-btn`;
  const resultEl = document.createElement('p');
  resultEl.className = `${P}__result`;
  root.append(scene, rollBtn, resultEl);
  container.appendChild(root);

  const render = () => {
    rollBtn.textContent = rolling
      ? (options.rollingText ?? '掷骰中...')
      : (options.rollText ?? '掷骰子');
    rollBtn.disabled = rolling;
    cube.classList.toggle(`${P}__cube--rolling`, rolling);
    cube.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`;
    resultEl.textContent = rolling ? '' : `${options.resultPrefix ?? '点数:'} ${value}`;
    resultEl.hidden = rolling;
  };

  const handleRoll = () => {
    if (rolling) return;
    rolling = true;
    render();
    const sides = options.sides ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;
    const face = FACE_ROTATIONS[result] ?? FACE_ROTATIONS[1];
    const extraX = 360 * (3 + Math.floor(Math.random() * 3));
    const extraY = 360 * (3 + Math.floor(Math.random() * 3));
    rotation = { x: face.x + extraX, y: face.y + extraY, z: Math.random() * 360 };
    render();
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      value = result;
      rolling = false;
      render();
      onRollRef.current?.(result);
    }, 1200);
  };

  rollBtn.addEventListener('click', handleRoll);
  render();

  return {
    update(next) {
      options = { ...options, ...next };
      onRollRef.current = options.onRoll;
      render();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.clearTimeout(timer);
      rollBtn.removeEventListener('click', handleRoll);
      root.remove();
    },
  };
}

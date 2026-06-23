import React, { useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface DiceRollProps {
  /** 掷骰结束回调 */
  onRoll?: (value: number) => void;
  /** 骰子面数，默认 6 */
  sides?: 6;
}

const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: 180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 }
};

const DiceRoll: React.FC<DiceRollProps> = ({ onRoll, sides = 6 }) => {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const onRollRef = useRef(onRoll);
  const timerRef = useRef(0);

  useEffect(() => {
    onRollRef.current = onRoll;
  }, [onRoll]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);

    const result = Math.floor(Math.random() * sides) + 1;
    const face = FACE_ROTATIONS[result] ?? FACE_ROTATIONS[1];
    const extraX = 360 * (3 + Math.floor(Math.random() * 3));
    const extraY = 360 * (3 + Math.floor(Math.random() * 3));

    setRotation({
      x: face.x + extraX,
      y: face.y + extraY,
      z: Math.random() * 360
    });

    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setValue(result);
      setRolling(false);
      onRollRef.current?.(result);
    }, 1200);
  };

  const dots = (face: number) => {
    const positions: Record<number, number[][]> = {
      1: [[50, 50]],
      2: [
        [25, 25],
        [75, 75]
      ],
      3: [
        [25, 25],
        [50, 50],
        [75, 75]
      ],
      4: [
        [25, 25],
        [75, 25],
        [25, 75],
        [75, 75]
      ],
      5: [
        [25, 25],
        [75, 25],
        [50, 50],
        [25, 75],
        [75, 75]
      ],
      6: [
        [25, 25],
        [75, 25],
        [25, 50],
        [75, 50],
        [25, 75],
        [75, 75]
      ]
    };
    return (positions[face] ?? []).map(([left, top], i) => (
      <span key={i} className={styles.dot} style={{ left: `${left}%`, top: `${top}%` }} />
    ));
  };

  return (
    <div className={styles.diceRoll}>
      <div className={styles.scene}>
        <div
          className={`${styles.cube} ${rolling ? styles.rolling : ''}`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((face) => (
            <div key={face} className={`${styles.face} ${styles[`face${face}`]}`}>
              {dots(face)}
            </div>
          ))}
        </div>
      </div>
      <button type="button" className={styles.rollBtn} onClick={handleRoll} disabled={rolling}>
        {rolling ? '掷骰中...' : '掷骰子'}
      </button>
      {!rolling && <p className={styles.result}>点数: {value}</p>}
    </div>
  );
};

export default DiceRoll;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface RedPacketRainProps {
  /** 持续时间（毫秒），默认 10000 */
  duration?: number;
  /** 抢到红包回调 */
  onGrab?: (amount: number) => void;
}

interface Packet {
  id: number;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  amount: number;
  grabbed: boolean;
}

const RedPacketRain: React.FC<RedPacketRainProps> = ({ duration = 10000, onGrab }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const packetsRef = useRef<Packet[]>([]);
  const frameRef = useRef(0);
  const idRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const [grabbed, setGrabbed] = useState(0);
  const [active, setActive] = useState(true);

  const width = 400;
  const height = 500;

  const spawnPacket = useCallback(() => {
    packetsRef.current.push({
      id: idRef.current++,
      x: Math.random() * (width - 50) + 25,
      y: -60,
      speed: Math.random() * 2 + 2,
      rotation: (Math.random() - 0.5) * 0.1,
      amount: [1, 2, 5, 8, 10, 18, 66, 88][Math.floor(Math.random() * 8)],
      grabbed: false
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let paused = document.hidden;
    const unbind = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const endTimer = window.setTimeout(() => setActive(false), duration);

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;

      spawnTimerRef.current++;
      if (active && spawnTimerRef.current % 20 === 0) {
        spawnPacket();
      }

      ctx.fillStyle = 'rgb(15 23 42 / 20%)';
      ctx.fillRect(0, 0, width, height);

      packetsRef.current = packetsRef.current.filter((p) => {
        if (p.grabbed) return false;
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.02) * 0.5;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-22, -28, 44, 56, 6);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -10, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`¥${p.amount}`, 0, 12);

        ctx.restore();

        return p.y < height + 60;
      });
    };

    tick();

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(endTimer);
      unbind();
    };
  }, [active, duration, spawnPacket]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let grabbedOne = false;
    packetsRef.current = packetsRef.current.map((p) => {
      if (p.grabbed || grabbedOne) return p;
      if (Math.abs(mx - p.x) < 30 && Math.abs(my - p.y) < 35) {
        grabbedOne = true;
        setGrabbed((g) => g + p.amount);
        onGrab?.(p.amount);
        return { ...p, grabbed: true };
      }
      return p;
    });
  };

  return (
    <div className={styles.redPacketRain}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} onClick={handleClick} />
      <div className={styles.hud}>
        <span>已抢: ¥{grabbed}</span>
        {!active && <span className={styles.end}>红包雨结束</span>}
      </div>
      <p className={styles.hint}>点击红包抢夺</p>
    </div>
  );
};

export default RedPacketRain;

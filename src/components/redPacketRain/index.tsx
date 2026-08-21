import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  getRelativePointerPosition,
  prefersReducedMotion,
  resolveCanvasBoxSize,
  useElementSize
} from '@cos-design/shared';
import styles from './style/index.module.less';

export interface RedPacketRainProps {
  /** 画布宽度，默认 400 */
  width?: number;
  /** 画布高度，默认 500 */
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 持续时间（毫秒），默认 10000 */
  duration?: number;
  /** 挂载后自动开始，默认 true */
  auto?: boolean;
  /** 抢到红包回调 */
  onGrab?: (amount: number) => void;
  /** 红包雨结束回调 */
  onEnd?: () => void;
  /** 已抢金额标签 */
  grabbedLabel?: string;
  /** 红包雨结束提示 */
  endedText?: string;
  /** 操作提示 */
  hint?: string;
}

export interface RedPacketRainHandle {
  /** 重新开始一轮红包雨 */
  start: () => void;
  /** 立即结束 */
  stop: () => void;
  /** 结束并清零金额 */
  reset: () => void;
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

const RedPacketRain = forwardRef<RedPacketRainHandle, RedPacketRainProps>(
  (
    {
      width: widthProp,
      height: heightProp,
      fill = false,
      duration = 10000,
      auto = true,
      onGrab,
      onEnd,
      grabbedLabel = '已抢:',
      endedText = '红包雨结束',
      hint = '点击红包抢夺'
    },
    ref
  ) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const measured = useElementSize(hostRef, { enabled: fill });
    const { width, height } = resolveCanvasBoxSize({
      fill,
      width: widthProp,
      height: heightProp,
      defaultWidth: 400,
      defaultHeight: 500,
      measured
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const packetsRef = useRef<Packet[]>([]);
    const frameRef = useRef(0);
    const idRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const endTimerRef = useRef(0);
    const runIdRef = useRef(0);
    const [grabbed, setGrabbed] = useState(0);
    const [active, setActive] = useState(auto);
    const activeRef = useRef(auto);
    const onGrabRef = useRef(onGrab);
    const onEndRef = useRef(onEnd);
    const sizeRef = useRef({ width, height });
    sizeRef.current = { width, height };

    useEffect(() => {
      onGrabRef.current = onGrab;
    }, [onGrab]);

    useEffect(() => {
      onEndRef.current = onEnd;
    }, [onEnd]);

    useEffect(() => {
      activeRef.current = active;
    }, [active]);

    const finish = useCallback(() => {
      if (!activeRef.current) return;
      activeRef.current = false;
      setActive(false);
      onEndRef.current?.();
    }, []);

    const start = useCallback(() => {
      runIdRef.current += 1;
      const runId = runIdRef.current;
      packetsRef.current = [];
      spawnTimerRef.current = 0;
      activeRef.current = true;
      setActive(true);
      window.clearTimeout(endTimerRef.current);
      endTimerRef.current = window.setTimeout(() => {
        if (runId !== runIdRef.current) return;
        finish();
      }, duration);
    }, [duration, finish]);

    const stop = useCallback(() => {
      window.clearTimeout(endTimerRef.current);
      finish();
    }, [finish]);

    const reset = useCallback(() => {
      window.clearTimeout(endTimerRef.current);
      runIdRef.current += 1;
      packetsRef.current = [];
      spawnTimerRef.current = 0;
      activeRef.current = false;
      setActive(false);
      setGrabbed(0);
    }, []);

    useImperativeHandle(ref, () => ({ start, stop, reset }), [reset, start, stop]);

    const spawnPacket = useCallback(() => {
      const { width: w } = sizeRef.current;
      packetsRef.current.push({
        id: idRef.current++,
        x: Math.random() * (w - 50) + 25,
        y: -60,
        speed: Math.random() * 2 + 2,
        rotation: (Math.random() - 0.5) * 0.1,
        amount: [1, 2, 5, 8, 10, 18, 66, 88][Math.floor(Math.random() * 8)],
        grabbed: false
      });
    }, []);

    useEffect(() => {
      if (auto) start();
      return () => {
        window.clearTimeout(endTimerRef.current);
      };
    }, [auto, start]);

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
      let reduced = prefersReducedMotion();
      const unbindVisibility = bindVisibilityPause((hidden) => {
        paused = hidden;
      });
      const unbindMotion = bindPrefersReducedMotion((value) => {
        reduced = value;
      });

      const tick = () => {
        frameRef.current = requestAnimationFrame(tick);
        if (paused) return;

        const { width: w, height: h } = sizeRef.current;

        if (!reduced && activeRef.current) {
          spawnTimerRef.current++;
          if (spawnTimerRef.current % 20 === 0) spawnPacket();
        }

        ctx.fillStyle = 'rgb(15 23 42 / 20%)';
        ctx.fillRect(0, 0, w, h);

        packetsRef.current = packetsRef.current.filter((p) => {
          if (p.grabbed) return false;
          if (!reduced) {
            p.y += p.speed;
            p.x += Math.sin(p.y * 0.02) * 0.5;
          }

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

          return reduced ? true : p.y < h + 60;
        });
      };

      tick();

      return () => {
        cancelAnimationFrame(frameRef.current);
        unbindVisibility();
        unbindMotion();
      };
    }, [height, spawnPacket, width]);

    const grabAt = (mx: number, my: number) => {
      if (!activeRef.current) return;
      let grabbedOne = false;
      packetsRef.current = packetsRef.current.map((p) => {
        if (p.grabbed || grabbedOne) return p;
        if (Math.abs(mx - p.x) < 30 && Math.abs(my - p.y) < 35) {
          grabbedOne = true;
          setGrabbed((g) => g + p.amount);
          onGrabRef.current?.(p.amount);
          return { ...p, grabbed: true };
        }
        return p;
      });
    };

    const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pos = getRelativePointerPosition(e.currentTarget, e.nativeEvent);
      if (pos) grabAt(pos.x, pos.y);
    };

    return (
      <div ref={hostRef} className={styles.redPacketRain} style={fill ? { width: '100%', height: '100%' } : undefined}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ width, height, touchAction: 'none' }}
          onPointerDown={handlePointer}
        />
        <div className={styles.hud}>
          <span>
            {grabbedLabel} ¥{grabbed}
          </span>
          {!active && <span className={styles.end}>{endedText}</span>}
        </div>
        <p className={styles.hint}>{hint}</p>
      </div>
    );
  }
);

RedPacketRain.displayName = 'RedPacketRain';

export default RedPacketRain;

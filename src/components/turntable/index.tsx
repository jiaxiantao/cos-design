import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface TurntablePrize {
  label: string;
  color?: string;
}

export interface TurntableProps {
  /** 奖品列表 */
  prizes?: TurntablePrize[];
  /** 转盘直径，默认 360 */
  size?: number;
  /** 旋转动画时长（毫秒），默认 4000 */
  spinDuration?: number;
  /** 旋转圈数，默认 5 */
  spinRounds?: number;
  /** 指定下一次抽中的奖品索引（服务端开奖）；不传则随机 */
  targetIndex?: number;
  /** 抽奖按钮文案 */
  buttonText?: string;
  /** 抽奖进行中的按钮文案 */
  spinningText?: string;
  /** 中奖结果前缀 */
  resultPrefix?: string;
  /** 旋转结束回调 */
  onSpinEnd?: (prize: TurntablePrize, index: number) => void;
}

export interface TurntableHandle {
  /** 手动抽奖；可传入目标索引覆盖 props.targetIndex */
  spin: (targetIndex?: number) => void;
  /** 清除结果文案并允许再次抽奖 */
  reset: () => void;
}

const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#60A5FA', '#F472B6', '#34D399', '#FB923C'];

const DEFAULT_PRIZES: TurntablePrize[] = [
  { label: '一等奖' },
  { label: '二等奖' },
  { label: '三等奖' },
  { label: '谢谢参与' },
  { label: '优惠券' },
  { label: '再来一次' }
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const Turntable = forwardRef<TurntableHandle, TurntableProps>(
  (
    {
      prizes = DEFAULT_PRIZES,
      size = 360,
      spinDuration = 4000,
      spinRounds = 5,
      targetIndex: targetIndexProp,
      buttonText = '开始抽奖',
      spinningText = '抽奖中...',
      resultPrefix = '恭喜获得：',
      onSpinEnd
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);
    const animationRef = useRef<number>(0);
    const dprRef = useRef(1);
    const spinningRef = useRef(false);

    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<TurntablePrize | null>(null);
    const onSpinEndRef = useRef(onSpinEnd);
    const prizesRef = useRef(prizes);
    const targetIndexPropRef = useRef(targetIndexProp);
    const spinTokenRef = useRef<{ cancelled: boolean } | null>(null);

    useEffect(() => {
      onSpinEndRef.current = onSpinEnd;
    }, [onSpinEnd]);

    useEffect(() => {
      prizesRef.current = prizes;
    }, [prizes]);

    useEffect(() => {
      targetIndexPropRef.current = targetIndexProp;
    }, [targetIndexProp]);

    useEffect(() => {
      spinningRef.current = spinning;
    }, [spinning]);

    const canvasSize = size + 48;

    const getPrizeColor = (index: number, prize: TurntablePrize) =>
      prize.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];

    const drawWheel = useCallback(
      (rotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const list = prizesRef.current;
        const center = canvasSize / 2;
        const radius = size / 2;
        const segmentAngle = (Math.PI * 2) / list.length;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation);

        list.forEach((prize, index) => {
          const startAngle = index * segmentAngle - Math.PI / 2;
          const endAngle = startAngle + segmentAngle;
          const color = getPrizeColor(index, prize);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();

          ctx.strokeStyle = 'rgb(255 255 255 / 35%)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.save();
          ctx.rotate(startAngle + segmentAngle / 2);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${Math.max(12, Math.floor(size / 22))}px system-ui, sans-serif`;
          ctx.shadowColor = 'rgb(0 0 0 / 30%)';
          ctx.shadowBlur = 4;
          ctx.fillText(prize.label, radius - 18, 6);
          ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.translate(center, center);
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * (radius + 14);
          const y = Math.sin(angle) * (radius + 14);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#fde68a' : '#f59e0b';
          ctx.fill();
        }
        ctx.restore();
      },
      [canvasSize, size]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = canvasSize * dpr;
      canvas.height = canvasSize * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      drawWheel(rotationRef.current);
    }, [canvasSize, drawWheel, prizes]);

    useEffect(() => {
      return () => {
        if (spinTokenRef.current) spinTokenRef.current.cancelled = true;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    const spin = useCallback(
      (overrideIndex?: number) => {
        const list = prizesRef.current;
        if (spinningRef.current || list.length === 0) return;

        setSpinning(true);
        setResult(null);

        const segmentAngle = (Math.PI * 2) / list.length;
        const propTarget = targetIndexPropRef.current;
        const rawTarget = overrideIndex ?? propTarget;
        const targetIndex =
          rawTarget === undefined
            ? Math.floor(Math.random() * list.length)
            : ((Math.floor(rawTarget) % list.length) + list.length) % list.length;
        const targetCenter = targetIndex * segmentAngle + segmentAngle / 2;
        const currentRotation = rotationRef.current;
        const extraRotation = spinRounds * Math.PI * 2;
        const endRotation =
          currentRotation + extraRotation + (Math.PI * 2 - targetCenter) - (currentRotation % (Math.PI * 2));

        const startRotation = currentRotation;
        const startTime = performance.now();
        const token = { cancelled: false };
        spinTokenRef.current = token;

        const animate = (now: number) => {
          if (token.cancelled) return;

          const elapsed = now - startTime;
          const progress = Math.min(elapsed / spinDuration, 1);
          const eased = easeOutCubic(progress);
          const rotation = startRotation + (endRotation - startRotation) * eased;

          rotationRef.current = rotation;
          drawWheel(rotation);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else if (!token.cancelled) {
            const prize = list[targetIndex];
            rotationRef.current = rotation;
            setSpinning(false);
            setResult(prize);
            onSpinEndRef.current?.(prize, targetIndex);
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      },
      [drawWheel, spinDuration, spinRounds]
    );

    const reset = useCallback(() => {
      if (spinningRef.current) return;
      setResult(null);
    }, []);

    useImperativeHandle(ref, () => ({ spin, reset }), [spin, reset]);

    return (
      <div className={styles.turntable} style={{ width: canvasSize, height: canvasSize + 80 }}>
        <div className={styles.wheelWrap} style={{ width: canvasSize, height: canvasSize }}>
          <div className={styles.pointer} />
          <canvas ref={canvasRef} className={styles.canvas} style={{ width: canvasSize, height: canvasSize }} />
          <button
            type="button"
            className={styles.spinBtn}
            data-testid="turntable-spin"
            onClick={() => spin()}
            disabled={spinning}
            aria-busy={spinning}
          >
            {spinning ? spinningText : buttonText}
          </button>
        </div>

        {result && !spinning && (
          <p className={styles.result}>
            {resultPrefix}
            <strong>{result.label}</strong>
          </p>
        )}
      </div>
    );
  }
);

Turntable.displayName = 'Turntable';

export default Turntable;

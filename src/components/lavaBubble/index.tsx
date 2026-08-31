import React, { useEffect, useRef } from 'react';
import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  prefersReducedMotion,
  useCanvasBox
} from '@cos-design/shared';
import { createFieldTexture, createProgram } from './gl';
import { createLavaSim, MAX_DPR, SIM } from './sim';
import { FRAG, VERT } from './shaders';
import styles from './style/index.module.less';

export interface LavaBubbleProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 热度 0~2，默认 1 */
  heat?: number;
  /** 运动速度倍率 0~3，默认 1 */
  speed?: number;
  /** 是否自动在表面随机鼓起气泡，默认 true */
  autoSpawn?: boolean;
  /** 自动鼓起活跃度 0~2，默认 1 */
  activity?: number;
  /** 是否响应指针交互（点击鼓起），默认 true */
  interactive?: boolean;
  /** 画布无障碍标签 */
  ariaLabel?: string;
}

type RuntimeProps = Pick<LavaBubbleProps, 'heat' | 'speed' | 'interactive' | 'autoSpawn' | 'activity'>;

/**
 * WebGL 熔岩湖：表面会不定期随机鼓起闷裂；也可点击指定位置鼓起。
 */
const LavaBubble: React.FC<LavaBubbleProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  heat = 1,
  speed = 1,
  autoSpawn = true,
  activity = 1,
  interactive = true,
  ariaLabel = '熔岩泡背景'
}) => {
  const { hostRef, width, height, hostStyle } = useCanvasBox({
    fill: fillProp,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 500
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef<Required<RuntimeProps>>({ heat, speed, interactive, autoSpawn, activity });
  const clickRef = useRef<{ u: number; v: number } | null>(null);
  const stirRef = useRef<{ u: number; v: number; vu: number; vv: number } | null>(null);
  const prevPointerRef = useRef<{ u: number; v: number } | null>(null);

  useEffect(() => {
    propsRef.current = { heat, speed, interactive, autoSpawn, activity };
  }, [activity, autoSpawn, heat, interactive, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const toUv = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        u: (clientX - rect.left) / Math.max(rect.width, 1),
        v: 1 - (clientY - rect.top) / Math.max(rect.height, 1)
      };
    };

    const onPointer = (e: PointerEvent) => {
      if (!propsRef.current.interactive) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      clickRef.current = toUv(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!propsRef.current.interactive) return;
      const { u, v } = toUv(e.clientX, e.clientY);
      const prev = prevPointerRef.current;
      if (prev) {
        stirRef.current = { u, v, vu: u - prev.u, vv: v - prev.v };
      } else {
        stirRef.current = { u, v, vu: 0, vv: 0 };
      }
      prevPointerRef.current = { u, v };
    };

    const onPointerLeave = () => {
      prevPointerRef.current = null;
      stirRef.current = null;
    };

    canvas.addEventListener('pointerdown', onPointer);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    return () => {
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false
    });
    if (!gl) return;

    const program = createProgram(gl, VERT, FRAG);
    if (!program) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uSim = gl.getUniformLocation(program, 'u_sim');
    const uHeat = gl.getUniformLocation(program, 'u_heat');
    const uField = gl.getUniformLocation(program, 'u_field');

    const fieldTex = createFieldTexture(gl);
    if (!fieldTex) return;

    const sim = createLavaSim();
    let frameId = 0;
    let lastTs = 0;
    let time = 0;
    let paused = document.hidden;
    let reduced = prefersReducedMotion();

    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });
    const unbindMotion = bindPrefersReducedMotion((value) => {
      reduced = value;
    });

    const paint = (t: number) => {
      sim.upload(gl, fieldTex);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.uniform1i(uField, 0);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uSim, SIM, SIM);
      gl.uniform1f(uHeat, propsRef.current.heat);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const draw = (ts: number) => {
      frameId = requestAnimationFrame(draw);
      if (paused) return;
      if (!lastTs) lastTs = ts;
      const dt = clamp((ts - lastTs) / 1000, 0.008, 0.033);
      lastTs = ts;

      if (reduced) {
        paint(0);
        return;
      }

      const rate = propsRef.current.speed;
      time += dt * rate;

      const click = clickRef.current;
      clickRef.current = null;
      const stir = stirRef.current;
      const stirForStep =
        stir && Math.hypot(stir.vu, stir.vv) > 0.0003 ? { u: stir.u, v: stir.v, vu: stir.vu, vv: stir.vv } : null;
      if (stir) stirRef.current = { u: stir.u, v: stir.v, vu: 0, vv: 0 };
      sim.step(dt, rate, {
        autoSpawn: propsRef.current.autoSpawn,
        activity: propsRef.current.activity,
        click,
        stir: stirForStep
      });
      paint(time);
    };

    draw(0);
    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
      unbindMotion();
      gl.deleteTexture(fieldTex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [height, width]);

  return (
    <div ref={hostRef} className={styles.lavaBubble} style={hostStyle} role="img" aria-label={ariaLabel}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default LavaBubble;

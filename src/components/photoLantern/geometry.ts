import * as THREE from 'three';
import { FACE_ANGLE, FACE_COUNT } from './constants';

export const createHexShape = (radius: number) => {
  const shape = new THREE.Shape();
  for (let i = 0; i < FACE_COUNT; i++) {
    const a = -Math.PI / 6 + i * FACE_ANGLE;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

/** 圆角矩形：灯纸外框 / 内缘装饰 */
export const createRoundedRectShape = (w: number, h: number, r: number) => {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  const radius = Math.min(r, hw, hh);
  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return shape;
};

export const createFramedRect = (
  outerW: number,
  outerH: number,
  outerR: number,
  holeW: number,
  holeH: number,
  holeR: number
) => {
  const shape = createRoundedRectShape(outerW, outerH, outerR);
  shape.holes.push(createRoundedRectShape(holeW, holeH, holeR));
  return shape;
};

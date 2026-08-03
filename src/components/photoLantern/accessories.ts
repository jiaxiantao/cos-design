import * as THREE from 'three';
import { FACE_ANGLE, FACE_COUNT, PANEL_H } from './constants';
import type { LanternMaterials } from './materials';

/** 吊环、角饰、流苏、底穗 —— 几何与材质参数保持与原实现一致 */
export const addLanternAccessories = (rotor: THREE.Group, mats: LanternMaterials, vertexR: number, apothem: number) => {
  const { accentMat, trimMat, beadMat, silkMat } = mats;
  const panelH = PANEL_H;

  const crown = new THREE.Group();
  crown.position.y = panelH / 2 + 0.16;
  rotor.add(crown);

  crown.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.05, 20), accentMat));

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.32, 12), trimMat);
  stem.position.y = 0.2;
  crown.add(stem);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 20), trimMat);
  ball.position.y = 0.38;
  crown.add(ball);

  const ringMajor = 0.06;
  const ringTube = 0.012;
  const ringY = 0.48;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(ringMajor, ringTube, 12, 36), trimMat);
  ring.position.y = ringY;
  crown.add(ring);

  const wireH = 0.24;
  const ringTop = ringY + ringMajor + ringTube;
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, wireH, 8), trimMat);
  wire.position.y = ringTop + wireH / 2 - ringTube * 0.55;
  crown.add(wire);

  const finialSeatGeo = new THREE.CylinderGeometry(0.038, 0.048, 0.028, 16);
  const finialTipGeo = new THREE.SphereGeometry(0.026, 16, 16);
  for (let i = 0; i < FACE_COUNT; i++) {
    const angle = i * FACE_ANGLE + FACE_ANGLE / 2;
    const x = Math.sin(angle) * (vertexR * 0.98);
    const z = Math.cos(angle) * (vertexR * 0.98);
    const finial = new THREE.Group();
    finial.position.set(x, panelH / 2 + 0.145, z);

    const seat = new THREE.Mesh(finialSeatGeo, accentMat);
    seat.castShadow = true;
    finial.add(seat);

    const tip = new THREE.Mesh(finialTipGeo, trimMat);
    tip.position.y = 0.03;
    tip.castShadow = true;
    finial.add(tip);

    rotor.add(finial);
  }

  const beadGeo = new THREE.SphereGeometry(0.032, 14, 14);
  const cordGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.1, 8);
  const headGeo = new THREE.SphereGeometry(0.038, 14, 14);
  const silkGeo = new THREE.CylinderGeometry(0.01, 0.004, panelH * 0.4, 6);
  const silkLen = panelH * 0.4;

  for (let i = 0; i < FACE_COUNT; i++) {
    const angle = i * FACE_ANGLE + FACE_ANGLE / 2;
    const g = new THREE.Group();
    g.position.set(Math.sin(angle) * (vertexR + 0.04), panelH / 2 - 0.02, Math.cos(angle) * (vertexR + 0.04));

    g.add(new THREE.Mesh(beadGeo, beadMat));

    const cord = new THREE.Mesh(cordGeo, beadMat);
    cord.position.y = -0.065;
    g.add(cord);

    const head = new THREE.Mesh(headGeo, silkMat);
    head.position.y = -0.13;
    g.add(head);

    for (let s = 0; s < 5; s++) {
      const silk = new THREE.Mesh(silkGeo, silkMat);
      silk.position.set((s - 2) * 0.012, -0.13 - silkLen / 2, 0);
      g.add(silk);
    }

    rotor.add(g);
  }

  for (let i = 0; i < FACE_COUNT * 3; i++) {
    const angle = (i / (FACE_COUNT * 3)) * Math.PI * 2;
    const fringe = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.003, 0.14 + (i % 3) * 0.02, 6), silkMat);
    fringe.position.set(Math.sin(angle) * (apothem * 0.88), -panelH / 2 - 0.2, Math.cos(angle) * (apothem * 0.88));
    rotor.add(fringe);
  }
};

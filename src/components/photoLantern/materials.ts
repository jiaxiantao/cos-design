import * as THREE from 'three';
import { createWoodMap } from './textures';

export interface LanternMaterials {
  frameMat: THREE.MeshPhysicalMaterial;
  accentMat: THREE.MeshPhysicalMaterial;
  trimMat: THREE.MeshPhysicalMaterial;
  beadMat: THREE.MeshPhysicalMaterial;
  silkMat: THREE.MeshPhysicalMaterial;
}

const lacquerWood = (
  color: THREE.ColorRepresentation,
  map: THREE.Texture,
  roughness: number,
  clearcoat: number,
  clearcoatRoughness: number,
) =>
  new THREE.MeshPhysicalMaterial({
    color,
    map,
    metalness: 0,
    roughness,
    clearcoat,
    clearcoatRoughness,
  });

export const createLanternMaterials = (
  frameColor: THREE.Color,
  tasselColor: THREE.Color,
  anisotropy: number,
): LanternMaterials => {
  const woodMap = createWoodMap('#c4a07a', '#5a3a22', 1.4, 2.2, anisotropy);
  const woodAccentMap = createWoodMap('#d4b896', '#6a4a30', 1.2, 1.8, anisotropy);
  const woodTrimMap = createWoodMap('#e0c6a0', '#7a5638', 1, 2.4, anisotropy);

  const beadMap = woodTrimMap.clone();
  beadMap.repeat.set(1.6, 1.6);
  beadMap.anisotropy = anisotropy;

  return {
    frameMat: lacquerWood(frameColor, woodMap, 0.62, 0.22, 0.55),
    accentMat: lacquerWood(
      new THREE.Color(frameColor).offsetHSL(0.02, -0.04, 0.1),
      woodAccentMap,
      0.58,
      0.28,
      0.5,
    ),
    trimMat: lacquerWood(
      new THREE.Color(frameColor).offsetHSL(0.03, -0.08, 0.18),
      woodTrimMap,
      0.48,
      0.35,
      0.4,
    ),
    beadMat: lacquerWood(0xc9965a, beadMap, 0.42, 0.4, 0.35),
    silkMat: new THREE.MeshPhysicalMaterial({
      color: tasselColor,
      metalness: 0,
      roughness: 0.62,
      sheen: 1,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color(tasselColor).offsetHSL(0, -0.1, 0.25),
    }),
  };
};

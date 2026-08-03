import * as THREE from 'three';

const disposeMaps = (material: THREE.Material) => {
  const std = material as THREE.MeshStandardMaterial;
  std.map?.dispose();
  std.emissiveMap?.dispose();
  std.alphaMap?.dispose();
};

export const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  const list = Array.isArray(material) ? material : [material];
  list.forEach((m) => {
    disposeMaps(m);
    m.dispose();
  });
};

/** 释放场景内几何与材质；shared 用于跨 mesh 共用材质只 dispose 一次 */
export const disposeObject = (root: THREE.Object3D, shared = new Set<THREE.Material>()) => {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => {
      if (!m || shared.has(m)) return;
      shared.add(m);
      disposeMaterial(m);
    });
  });
};

import * as THREE from 'three';
import { addLanternAccessories } from './accessories';
import { FACE_ANGLE, FACE_COUNT, PANEL_H, PANEL_W, PHOTO_SCALE } from './constants';
import { disposeObject } from './dispose';
import { createFramedRect, createHexShape } from './geometry';
import { createLanternMaterials } from './materials';
import { composeCaptionTexture, createSoftShadowTexture, fitTexture, parseColor } from './textures';
import type { PhotoLanternItem } from './types';

export { FACE_COUNT, FACE_ANGLE } from './constants';

export interface LanternSceneOptions {
  width: number;
  height: number;
  photos: (PhotoLanternItem | undefined)[];
  frameColor: string;
  paperColor: string;
  lightColor: string;
  tasselColor: string;
  showAccessories: boolean;
  showCaption: boolean;
  silhouette: boolean;
  objectFit: 'cover' | 'contain' | 'fill' | string;
  background?: string;
  initialAngleDeg: number;
  /** 首批照片加载完成（或超时）后回调，用于避免首屏白闪 */
  onReady?: () => void;
}

export interface LanternSceneApi {
  renderer: THREE.WebGLRenderer;
  setAngleDeg: (deg: number) => void;
  getAngleDeg: () => number;
  setLightSway: (t: number, sway: number) => void;
  setSize: (width: number, height: number) => void;
  updatePhotos: (
    photos: (PhotoLanternItem | undefined)[],
    silhouette: boolean,
    objectFit: string,
    showCaption: boolean
  ) => void;
  render: () => void;
  dispose: () => void;
}

const setupWarmLights = (scene: THREE.Scene) => {
  scene.add(new THREE.HemisphereLight(0xfff6eb, 0xc4a88a, 0.72));

  const key = new THREE.DirectionalLight(0xfff5e8, 0.85);
  key.position.set(4.2, 6.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.radius = 3;
  key.shadow.bias = -0.0008;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xf0d5b0, 0.34);
  fill.position.set(-4, 2.5, -2.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe8d0, 0.24);
  rim.position.set(0, 3, -5);
  scene.add(rim);
};

const createHexCap = (radius: number, depth: number, y: number, material: THREE.Material) => {
  const geo = new THREE.ExtrudeGeometry(createHexShape(radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3
  });
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

export const createLanternScene = (canvas: HTMLCanvasElement, options: LanternSceneOptions): LanternSceneApi => {
  const scene = new THREE.Scene();
  if (options.background) {
    try {
      scene.background = parseColor(options.background);
    } catch {
      scene.background = null;
    }
  } else {
    scene.background = null;
  }

  const camera = new THREE.PerspectiveCamera(34, options.width / options.height, 0.1, 100);
  camera.position.set(0, 1.35, 6.6);
  camera.lookAt(0, 0.08, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(options.width, options.height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const panelW = PANEL_W;
  const panelH = PANEL_H;
  const photoW = panelW * PHOTO_SCALE;
  const photoH = panelH * PHOTO_SCALE;
  const panelAspect = photoW / photoH;
  const apothem = panelW / (2 * Math.tan(Math.PI / FACE_COUNT));
  const vertexR = panelW / (2 * Math.sin(Math.PI / FACE_COUNT));
  const hexR = vertexR * 1.12;

  const frameColor = parseColor(options.frameColor);
  const paperColor = parseColor(options.paperColor);
  const lightColor = parseColor(options.lightColor);
  const tasselColor = parseColor(options.tasselColor);

  const lantern = new THREE.Group();
  lantern.rotation.x = THREE.MathUtils.degToRad(14);
  scene.add(lantern);

  const rotor = new THREE.Group();
  lantern.add(rotor);

  setupWarmLights(scene);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const mats = createLanternMaterials(frameColor, tasselColor, maxAniso);
  const { frameMat, accentMat } = mats;

  // —— 六面相框 + 照片 ——
  const panels: THREE.Mesh[] = [];
  const loader = new THREE.TextureLoader();
  const photoGeo = new THREE.PlaneGeometry(photoW, photoH);
  const faceFrameGeo = new THREE.ExtrudeGeometry(
    createFramedRect(panelW * 0.96, panelH * 0.96, 0.04, photoW + 0.02, photoH + 0.02, 0.025),
    {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 2
    }
  );
  const lipGeo = new THREE.ShapeGeometry(createFramedRect(photoW + 0.05, photoH + 0.05, 0.028, photoW, photoH, 0.02));

  for (let i = 0; i < FACE_COUNT; i++) {
    const angle = i * FACE_ANGLE;
    const face = new THREE.Group();
    face.position.set(Math.sin(angle) * apothem, 0, Math.cos(angle) * apothem);
    face.rotation.y = angle;

    const faceFrame = new THREE.Mesh(faceFrameGeo, frameMat);
    faceFrame.position.z = -0.01;
    faceFrame.castShadow = true;
    faceFrame.receiveShadow = true;
    face.add(faceFrame);

    const innerLip = new THREE.Mesh(lipGeo, accentMat);
    innerLip.position.z = 0.02;
    face.add(innerLip);

    const photoMat = new THREE.MeshBasicMaterial({
      color: paperColor,
      map: null,
      toneMapped: false,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.z = 0.032;
    photoMesh.userData.fadeTo = 1;
    face.add(photoMesh);
    panels.push(photoMesh);

    rotor.add(face);
  }

  // —— 角柱 ——
  const pillarBodyGeo = new THREE.CylinderGeometry(0.038, 0.042, panelH - 0.12, 20);
  const pillarCapGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.06, 20);
  for (let i = 0; i < FACE_COUNT; i++) {
    const angle = i * FACE_ANGLE + FACE_ANGLE / 2;
    const x = Math.sin(angle) * vertexR;
    const z = Math.cos(angle) * vertexR;

    const body = new THREE.Mesh(pillarBodyGeo, frameMat);
    body.position.set(x, 0, z);
    body.castShadow = true;
    rotor.add(body);

    const topCapRing = new THREE.Mesh(pillarCapGeo, accentMat);
    topCapRing.position.set(x, panelH / 2 - 0.05, z);
    topCapRing.castShadow = true;
    rotor.add(topCapRing);

    const bottomCapRing = new THREE.Mesh(pillarCapGeo, accentMat);
    bottomCapRing.position.set(x, -panelH / 2 + 0.05, z);
    bottomCapRing.castShadow = true;
    rotor.add(bottomCapRing);
  }

  // —— 顶/底盖 ——
  rotor.add(createHexCap(hexR, 0.1, panelH / 2 + 0.02, frameMat));
  rotor.add(createHexCap(hexR * 0.78, 0.06, panelH / 2 + 0.12, frameMat));
  rotor.add(createHexCap(hexR, 0.1, -panelH / 2 - 0.1, frameMat));
  rotor.add(createHexCap(hexR * 0.62, 0.12, -panelH / 2 - 0.24, frameMat));

  // —— 内灯 ——
  const bulb = new THREE.PointLight(lightColor, 3.2, 7.5, 1.35);
  bulb.position.set(0, -0.08, 0);
  bulb.castShadow = false;
  rotor.add(bulb);

  bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfff8f0 })));

  const bulbMid = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 24, 24),
    new THREE.MeshBasicMaterial({ color: lightColor, transparent: true, opacity: 0.35 })
  );
  bulb.add(bulbMid);

  const bulbHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 24, 24),
    new THREE.MeshBasicMaterial({ color: lightColor, transparent: true, opacity: 0.12 })
  );
  bulb.add(bulbHalo);

  if (options.showAccessories) {
    addLanternAccessories(rotor, mats, vertexR, apothem);
  }

  // —— 柔和接触阴影 ——
  const softShadowTex = createSoftShadowTexture();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: softShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 1
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -panelH / 2 - 0.42;
  lantern.add(shadow);

  let angleDeg = options.initialAngleDeg;
  rotor.rotation.y = -THREE.MathUtils.degToRad(angleDeg);

  const textureCache = new Map<string, THREE.Texture>();
  const composedCache = new Map<string, THREE.CanvasTexture>();
  const waiters = new Map<string, { resolve: Array<(t: THREE.Texture) => void>; reject: Array<() => void> }>();

  let pendingLoads = 0;
  let readySent = false;
  let readyTimer = 0;
  const READY_TIMEOUT_MS = 1600;

  const signalReady = () => {
    if (readySent) return;
    readySent = true;
    if (readyTimer) {
      window.clearTimeout(readyTimer);
      readyTimer = 0;
    }
    renderer.render(scene, camera);
    options.onReady?.();
  };

  const trackLoadStart = () => {
    pendingLoads += 1;
  };

  const trackLoadEnd = () => {
    pendingLoads = Math.max(0, pendingLoads - 1);
    if (pendingLoads === 0) signalReady();
  };

  const loadTexture = (src: string, onOk: (t: THREE.Texture) => void, onErr: () => void) => {
    const cached = textureCache.get(src);
    if (cached) {
      onOk(cached);
      return;
    }

    const queue = waiters.get(src);
    if (queue) {
      queue.resolve.push(onOk);
      queue.reject.push(onErr);
      return;
    }

    waiters.set(src, { resolve: [onOk], reject: [onErr] });
    trackLoadStart();
    loader.load(
      src,
      (texture) => {
        textureCache.set(src, texture);
        const q = waiters.get(src);
        waiters.delete(src);
        q?.resolve.forEach((fn) => fn(texture));
        trackLoadEnd();
      },
      undefined,
      () => {
        const q = waiters.get(src);
        waiters.delete(src);
        q?.reject.forEach((fn) => fn());
        trackLoadEnd();
      }
    );
  };

  const clearPhotoMap = (mat: THREE.MeshBasicMaterial, panel: THREE.Mesh) => {
    mat.map = null;
    mat.color.copy(paperColor);
    mat.transparent = true;
    mat.opacity = 1;
    mat.needsUpdate = true;
    panel.userData.fadeTo = 1;
  };

  const applyPhotos = (
    photos: (PhotoLanternItem | undefined)[],
    silhouette: boolean,
    objectFit: string,
    showCaption: boolean
  ) => {
    panels.forEach((panel, i) => {
      const mat = panel.material as THREE.MeshBasicMaterial;
      const photo = photos[i];
      if (!photo?.src) {
        clearPhotoMap(mat, panel);
        return;
      }

      const paint = (baseTexture: THREE.Texture, fadeIn: boolean) => {
        const title = showCaption ? photo.title : undefined;
        const description = showCaption ? photo.description : undefined;
        const cacheKey = `${photo.src}::${title || ''}::${description || ''}::${showCaption ? 1 : 0}`;

        let display = composedCache.get(cacheKey);
        if (!display) {
          if (showCaption && (title || description) && baseTexture.image) {
            display = composeCaptionTexture(baseTexture.image as CanvasImageSource, title, description);
            composedCache.set(cacheKey, display);
          } else {
            display = baseTexture as THREE.CanvasTexture;
          }
        }

        fitTexture(display, objectFit, panelAspect, maxAniso);
        mat.map = display;
        mat.color.set(silhouette ? 0x555555 : 0xffffff);
        mat.transparent = true;
        mat.opacity = fadeIn ? 0 : 1;
        panel.userData.fadeTo = 1;
        mat.needsUpdate = true;
      };

      if (textureCache.has(photo.src)) {
        paint(textureCache.get(photo.src)!, false);
        return;
      }

      mat.map = null;
      mat.color.copy(paperColor);
      mat.opacity = 1;
      mat.needsUpdate = true;

      loadTexture(
        photo.src,
        (texture) => paint(texture, readySent),
        () => clearPhotoMap(mat, panel)
      );
    });
  };

  applyPhotos(options.photos, options.silhouette, options.objectFit, options.showCaption);

  if (pendingLoads === 0) {
    signalReady();
  } else {
    readyTimer = window.setTimeout(signalReady, READY_TIMEOUT_MS);
  }

  const tickPhotoFade = () => {
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const mat = panel.material as THREE.MeshBasicMaterial;
      const target = panel.userData.fadeTo as number;
      if (mat.opacity === target) continue;
      const next = mat.opacity + (target - mat.opacity) * 0.22;
      mat.opacity = Math.abs(next - target) < 0.02 ? target : next;
      if (mat.opacity >= 1 && target >= 1 && mat.map) {
        mat.transparent = false;
      }
    }
  };

  return {
    renderer,
    setAngleDeg: (deg: number) => {
      angleDeg = deg;
      rotor.rotation.y = -THREE.MathUtils.degToRad(deg);
    },
    getAngleDeg: () => angleDeg,
    setLightSway: (t: number, sway: number) => {
      const s = Math.max(0, Math.min(1, sway));
      const lx = (Math.sin(t * 1.55) * 0.16 + Math.sin(t * 2.6) * 0.08) * s;
      const ly = (Math.cos(t * 1.2) * 0.1 + Math.sin(t * 2.9) * 0.07) * s - 0.06;
      const lz = (Math.sin(t * 0.85) * 0.09 + Math.cos(t * 2.1) * 0.05) * s;
      const flicker = 0.88 + Math.sin(t * 5.1) * 0.07 * s + Math.sin(t * 9.2) * 0.04 * s;
      bulb.position.set(lx, ly, lz);
      bulb.intensity = 1.6 * flicker;
      (bulbMid.material as THREE.MeshBasicMaterial).opacity = 0.18 * flicker;
      (bulbHalo.material as THREE.MeshBasicMaterial).opacity = 0.06 * flicker;
    },
    setSize: (width: number, height: number) => {
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },
    updatePhotos: applyPhotos,
    render: () => {
      tickPhotoFade();
      renderer.render(scene, camera);
    },
    dispose: () => {
      if (readyTimer) window.clearTimeout(readyTimer);
      panels.forEach((panel) => {
        const mat = panel.material as THREE.MeshBasicMaterial;
        mat.map = null;
      });
      disposeObject(scene);
      textureCache.forEach((t) => t.dispose());
      textureCache.clear();
      composedCache.forEach((t) => t.dispose());
      composedCache.clear();
      waiters.clear();
      renderer.dispose();
    }
  };
};

export const frontFaceIndex = (angleDeg: number) => {
  const mod = ((angleDeg % 360) + 360) % 360;
  return Math.round(mod / 60) % FACE_COUNT;
};

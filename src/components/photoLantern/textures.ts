import * as THREE from 'three';

export const parseColor = (value: string) => new THREE.Color(value);

export const createSoftShadowTexture = () => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(90, 48, 22, 0.32)');
  g.addColorStop(0.35, 'rgba(90, 48, 22, 0.13)');
  g.addColorStop(0.7, 'rgba(90, 48, 22, 0.04)');
  g.addColorStop(1, 'rgba(90, 48, 22, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

/** 程序化木纹：纵向年轮 + 细微噪点 */
export const createWoodGrainTexture = (base: string, vein: string, size = 512) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 56; i++) {
    const x = ((i + 0.5) / 56) * size;
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(i * 0.9) * 10, 0);
    for (let y = 0; y <= size; y += 6) {
      ctx.lineTo(x + Math.sin(y * 0.035 + i * 0.7) * 9 + Math.sin(y * 0.01) * 3, y);
    }
    ctx.strokeStyle = vein;
    ctx.globalAlpha = 0.06 + (i % 7) * 0.018;
    ctx.lineWidth = 0.8 + (i % 4) * 0.55;
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const x = (i / 8) * size + 18;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= size; y += 8) {
      ctx.lineTo(x + Math.sin(y * 0.028 + i) * 14, y);
    }
    ctx.strokeStyle = vein;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  ctx.globalAlpha = 0.045;
  for (let n = 0; n < 1800; n++) {
    ctx.fillStyle = n % 2 === 0 ? vein : base;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 1.2);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};

export const createWoodMap = (
  base: string,
  vein: string,
  repeatX: number,
  repeatY: number,
  anisotropy: number,
) => {
  const map = createWoodGrainTexture(base, vein);
  map.repeat.set(repeatX, repeatY);
  map.anisotropy = anisotropy;
  return map;
};

export const fitTexture = (
  texture: THREE.Texture,
  objectFit: string,
  panelAspect: number,
  anisotropy: number,
) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.center.set(0.5, 0.5);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const img = texture.image as { width?: number; height?: number } | undefined;
  const iw = img?.width || 1;
  const ih = img?.height || 1;
  const imageAspect = iw / ih;

  if (objectFit === 'contain') {
    if (imageAspect > panelAspect) texture.repeat.set(1, panelAspect / imageAspect);
    else texture.repeat.set(imageAspect / panelAspect, 1);
  } else if (objectFit === 'fill') {
    texture.repeat.set(1, 1);
  } else if (imageAspect > panelAspect) {
    texture.repeat.set(panelAspect / imageAspect, 1);
  } else {
    texture.repeat.set(1, imageAspect / panelAspect);
  }
};

const CAPTION_FONT =
  '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif';

const imageSize = (source: CanvasImageSource) => {
  if ('naturalWidth' in source) {
    const img = source as HTMLImageElement;
    return {
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    };
  }
  const canvas = source as HTMLCanvasElement;
  return { w: canvas.width, h: canvas.height };
};

/** 把标题/说明画进照片底部 */
export const composeCaptionTexture = (
  source: CanvasImageSource,
  title?: string,
  description?: string,
): THREE.CanvasTexture => {
  const { w: iw, h: ih } = imageSize(source);
  const w = Math.max(512, iw || 1024);
  const h = Math.max(512, ih || 1024);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, w, h);

  if (title || description) {
    const band = h * 0.3;
    const grad = ctx.createLinearGradient(0, h - band, 0, h);
    grad.addColorStop(0, 'rgba(8, 14, 22, 0)');
    grad.addColorStop(0.45, 'rgba(8, 14, 22, 0.42)');
    grad.addColorStop(1, 'rgba(8, 14, 22, 0.78)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - band, w, band);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const maxWidth = w * 0.88;
    const titleSize = Math.max(22, Math.round(h * 0.048));
    const descSize = Math.max(16, Math.round(h * 0.032));

    if (title) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${titleSize}px ${CAPTION_FONT}`;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillText(title, w / 2, description ? h - h * 0.085 : h - h * 0.05, maxWidth);
    }

    if (description) {
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = `400 ${descSize}px ${CAPTION_FONT}`;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 6;
      ctx.fillText(description, w / 2, h - h * 0.038, maxWidth);
    }

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

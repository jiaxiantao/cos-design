import type { HeadLifecycle, Plant, StemCurve } from './types';
import { headLifecycle, stemCurveGeometry } from './plant';

export interface PlantFrame {
  curve: StemCurve;
  head: StemCurve['head'];
  life: HeadLifecycle;
}

/** 每帧缓存植株几何与花头生命周期，避免重复计算 */
export class PlantFrameCache {
  private cache = new Map<number, PlantFrame>();

  get(plant: Plant): PlantFrame {
    let frame = this.cache.get(plant.id);
    if (!frame) {
      const curve = stemCurveGeometry(plant);
      frame = { curve, head: curve.head, life: headLifecycle(plant) };
      this.cache.set(plant.id, frame);
    }
    return frame;
  }

  clear() {
    this.cache.clear();
  }
}

/** 跟踪每株附着种子数量，避免每帧 filter 统计 */
export class AttachedSeedTracker {
  private counts = new Map<number, number>();

  increment(plantId: number, amount = 1) {
    this.counts.set(plantId, (this.counts.get(plantId) ?? 0) + amount);
  }

  decrement(plantId: number) {
    const next = (this.counts.get(plantId) ?? 0) - 1;
    if (next <= 0) this.counts.delete(plantId);
    else this.counts.set(plantId, next);
  }

  remove(plantId: number) {
    this.counts.delete(plantId);
  }

  get(plantId: number) {
    return this.counts.get(plantId) ?? 0;
  }

  has(plantId: number) {
    return (this.counts.get(plantId) ?? 0) > 0;
  }

  clear() {
    this.counts.clear();
  }
}

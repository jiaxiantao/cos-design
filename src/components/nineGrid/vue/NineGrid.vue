<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createNineGrid, type NineGridController, type NineGridOptions } from '../core';
import '../style/index.css';

const props = defineProps<NineGridOptions>();
const emit = defineEmits<{
  'draw-end': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: NineGridController | null = null;

const toOptions = (): NineGridOptions => ({
  ...props,
  onDrawEnd: (...args: unknown[]) => emit('draw-end', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createNineGrid(hostRef.value, toOptions());
});

watch(
  () => ({ ...props }),
  () => ctrl?.update(toOptions()),
  { deep: true },
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  draw: (targetIndex?: number) => ctrl?.draw(targetIndex),
  reset: () => ctrl?.reset(),
});
</script>

<template>
  <div ref="hostRef" class="cos-nineGrid-host" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

const props = defineProps<FlipCardOptions>();
const emit = defineEmits<{
  reveal: [...args: unknown[]];
  'flip-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: FlipCardController | null = null;

const toOptions = (): FlipCardOptions => ({
  ...props,
  onReveal: (...args: unknown[]) => emit('reveal', ...args),
  onFlipChange: (...args: unknown[]) => emit('flip-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createFlipCard(hostRef.value, toOptions());
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
  flip: () => ctrl?.flip(),
  reset: () => ctrl?.reset(),
});
</script>

<template>
  <div ref="hostRef" class="cos-flipCard-host" />
</template>

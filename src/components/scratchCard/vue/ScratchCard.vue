<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createScratchCard, type ScratchCardController, type ScratchCardOptions } from '../core';
import '../style/index.css';

const props = defineProps<ScratchCardOptions>();
const emit = defineEmits<{
  reveal: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: ScratchCardController | null = null;

const toOptions = (): ScratchCardOptions => ({
  ...props,
  onReveal: (...args: unknown[]) => emit('reveal', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createScratchCard(hostRef.value, toOptions());
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
  reset: () => ctrl?.reset(),
  reveal: () => ctrl?.reveal(),
});
</script>

<template>
  <div ref="hostRef" class="cos-scratchCard-host" />
</template>

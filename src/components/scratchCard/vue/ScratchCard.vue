<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
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
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
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

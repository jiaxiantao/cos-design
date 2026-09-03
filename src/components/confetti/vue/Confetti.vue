<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import '../style/index.css';

const props = defineProps<ConfettiOptions>();
const emit = defineEmits<{
  complete: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: ConfettiController | null = null;

const toOptions = (): ConfettiOptions => ({
  ...props,
  onComplete: (...args: unknown[]) => emit('complete', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createConfetti(hostRef.value, toOptions());
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
  burst: () => ctrl?.burst(),
});
</script>

<template>
  <div ref="hostRef" class="cos-confetti-host" />
</template>

<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import '../style/index.css';

// interactive stays undefined when omitted so Core can use `interactive ?? auto`.
const props = withDefaults(defineProps<ConfettiOptions>(), {
  auto: true,
  interactive: undefined,
});
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
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
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

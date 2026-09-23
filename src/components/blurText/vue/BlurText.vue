<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBlurText, type BlurTextController, type BlurTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<BlurTextOptions>();
const emit = defineEmits<{
  'animation-complete': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: BlurTextController | null = null;

const toOptions = (): BlurTextOptions => ({
  ...props,
  onAnimationComplete: (...args: unknown[]) => emit('animation-complete', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createBlurText(hostRef.value, toOptions());
});

watch(
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-blurText-host" />
</template>

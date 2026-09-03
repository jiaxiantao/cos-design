<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCanvasClock, type CanvasClockController, type CanvasClockOptions } from '../core';
import '../style/index.css';

const props = defineProps<CanvasClockOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CanvasClockController | null = null;

const toOptions = (): CanvasClockOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createCanvasClock(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-canvasClock-host" />
</template>

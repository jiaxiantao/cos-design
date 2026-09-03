<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createWaveText, type WaveTextController, type WaveTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<WaveTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: WaveTextController | null = null;

const toOptions = (): WaveTextOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createWaveText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-waveText-host" />
</template>

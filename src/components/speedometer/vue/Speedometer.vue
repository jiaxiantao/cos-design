<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSpeedometer, type SpeedometerController, type SpeedometerOptions } from '../core';
import '../style/index.css';

const props = defineProps<SpeedometerOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SpeedometerController | null = null;

const toOptions = (): SpeedometerOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSpeedometer(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-speedometer-host" />
</template>

<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createRadarScan, type RadarScanController, type RadarScanOptions } from '../core';
import '../style/index.css';

const props = defineProps<RadarScanOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: RadarScanController | null = null;

const toOptions = (): RadarScanOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createRadarScan(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-radarScan-host" />
</template>

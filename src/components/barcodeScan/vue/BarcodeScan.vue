<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBarcodeScan, type BarcodeScanController, type BarcodeScanOptions } from '../core';
import '../style/index.css';

const props = defineProps<BarcodeScanOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: BarcodeScanController | null = null;

const toOptions = (): BarcodeScanOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createBarcodeScan(hostRef.value, toOptions());
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
  getSlot: () => ctrl?.getSlot(),
});
</script>

<template>
  <div ref="hostRef" class="cos-barcodeScan-host" />
</template>

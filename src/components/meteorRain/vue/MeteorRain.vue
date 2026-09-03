<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createMeteorRain, type MeteorRainController, type MeteorRainOptions } from '../core';
import '../style/index.css';

const props = defineProps<MeteorRainOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: MeteorRainController | null = null;

const toOptions = (): MeteorRainOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createMeteorRain(hostRef.value, toOptions());
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

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-meteorRain-host" />
</template>

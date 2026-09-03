<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSolarSystem, type SolarSystemController, type SolarSystemOptions } from '../core';
import '../style/index.css';

const props = defineProps<SolarSystemOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SolarSystemController | null = null;

const toOptions = (): SolarSystemOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSolarSystem(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-solarSystem-host" />
</template>

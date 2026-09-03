<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createOrbitalChart, type OrbitalChartController, type OrbitalChartOptions } from '../core';
import '../style/index.css';

const props = defineProps<OrbitalChartOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: OrbitalChartController | null = null;

const toOptions = (): OrbitalChartOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createOrbitalChart(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({

});
</script>

<template>
  <div ref="hostRef" class="cos-orbitalChart-host" />
</template>

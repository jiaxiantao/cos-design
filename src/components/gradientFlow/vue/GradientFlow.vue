<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createGradientFlow, type GradientFlowController, type GradientFlowOptions } from '../core';
import '../style/index.css';

const props = defineProps<GradientFlowOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: GradientFlowController | null = null;

const toOptions = (): GradientFlowOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createGradientFlow(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-gradientFlow-host" />
</template>

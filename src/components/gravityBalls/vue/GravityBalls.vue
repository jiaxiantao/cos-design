<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createGravityBalls, type GravityBallsController, type GravityBallsOptions } from '../core';
import '../style/index.css';

const props = defineProps<GravityBallsOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: GravityBallsController | null = null;

const toOptions = (): GravityBallsOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createGravityBalls(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-gravityBalls-host" />
</template>

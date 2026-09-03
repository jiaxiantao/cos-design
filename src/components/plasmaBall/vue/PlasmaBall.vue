<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPlasmaBall, type PlasmaBallController, type PlasmaBallOptions } from '../core';
import '../style/index.css';

const props = defineProps<PlasmaBallOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PlasmaBallController | null = null;

const toOptions = (): PlasmaBallOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createPlasmaBall(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-plasmaBall-host" />
</template>

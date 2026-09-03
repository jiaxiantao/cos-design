<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

const props = defineProps<SpotlightOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SpotlightController | null = null;

const toOptions = (): SpotlightOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSpotlight(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-spotlight-host" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createLiquidGlass, type LiquidGlassController, type LiquidGlassOptions } from '../core';
import '../style/index.css';

const props = defineProps<LiquidGlassOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: LiquidGlassController | null = null;

const toOptions = (): LiquidGlassOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createLiquidGlass(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-liquidGlass-host" />
</template>

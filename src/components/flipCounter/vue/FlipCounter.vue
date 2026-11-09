<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createFlipCounter, type FlipCounterController, type FlipCounterOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<FlipCounterOptions>(), {
  auto: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: FlipCounterController | null = null;

const toOptions = (): FlipCounterOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createFlipCounter(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-flipCounter-host" />
</template>

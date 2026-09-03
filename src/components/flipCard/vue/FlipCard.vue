<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import '../style/index.css';

const props = defineProps<FlipCardOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: FlipCardController | null = null;

const toOptions = (): FlipCardOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createFlipCard(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  flip: (...args: unknown[]) => ctrl?.flip(...args),
  reset: (...args: unknown[]) => ctrl?.reset(...args)
});
</script>

<template>
  <div ref="hostRef" class="cos-flipCard-host" />
</template>

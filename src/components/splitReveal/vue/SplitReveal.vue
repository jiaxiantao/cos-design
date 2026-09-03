<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSplitReveal, type SplitRevealController, type SplitRevealOptions } from '../core';
import '../style/index.css';

const props = defineProps<SplitRevealOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SplitRevealController | null = null;

const toOptions = (): SplitRevealOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSplitReveal(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-splitReveal-host" />
</template>

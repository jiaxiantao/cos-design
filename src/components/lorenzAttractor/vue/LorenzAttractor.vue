<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createLorenzAttractor,
  type LorenzAttractorController,
  type LorenzAttractorOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<LorenzAttractorOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: LorenzAttractorController | null = null;

const toOptions = (): LorenzAttractorOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createLorenzAttractor(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-lorenzAttractor-host" />
</template>

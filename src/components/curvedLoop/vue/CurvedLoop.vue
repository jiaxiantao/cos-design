<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCurvedLoop, type CurvedLoopController, type CurvedLoopOptions } from '../core';
import '../style/index.css';

const props = defineProps<CurvedLoopOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CurvedLoopController | null = null;

const toOptions = (): CurvedLoopOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createCurvedLoop(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-curvedLoop-host" />
</template>

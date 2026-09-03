<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createFlipCounter, type FlipCounterController, type FlipCounterOptions } from '../core';
import '../style/index.css';

const props = defineProps<FlipCounterOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: FlipCounterController | null = null;

const toOptions = (): FlipCounterOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createFlipCounter(hostRef.value, toOptions());
});

watch(
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-flipCounter-host" />
</template>

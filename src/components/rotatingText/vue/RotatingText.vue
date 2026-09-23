<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createRotatingText, type RotatingTextController, type RotatingTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<RotatingTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: RotatingTextController | null = null;

const toOptions = (): RotatingTextOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createRotatingText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-rotatingText-host" />
</template>

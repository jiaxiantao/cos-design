<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCircularText, type CircularTextController, type CircularTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<CircularTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CircularTextController | null = null;

const toOptions = (): CircularTextOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createCircularText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-circularText-host" />
</template>

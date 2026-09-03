<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createCyberGrid, type CyberGridController, type CyberGridOptions } from '../core';
import '../style/index.css';

const props = defineProps<CyberGridOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: CyberGridController | null = null;

const toOptions = (): CyberGridOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createCyberGrid(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-cyberGrid-host" />
</template>

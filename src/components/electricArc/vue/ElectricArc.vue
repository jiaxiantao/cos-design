<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createElectricArc, type ElectricArcController, type ElectricArcOptions } from '../core';
import '../style/index.css';

const props = defineProps<ElectricArcOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ElectricArcController | null = null;

const toOptions = (): ElectricArcOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createElectricArc(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-electricArc-host" />
</template>

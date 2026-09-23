<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createNetworkGraph, type NetworkGraphController, type NetworkGraphOptions } from '../core';
import '../style/index.css';

const props = defineProps<NetworkGraphOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: NetworkGraphController | null = null;

const toOptions = (): NetworkGraphOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createNetworkGraph(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-networkGraph-host" />
</template>

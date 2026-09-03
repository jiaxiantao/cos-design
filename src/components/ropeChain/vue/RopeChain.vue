<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createRopeChain, type RopeChainController, type RopeChainOptions } from '../core';
import '../style/index.css';

const props = defineProps<RopeChainOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: RopeChainController | null = null;

const toOptions = (): RopeChainOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createRopeChain(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-ropeChain-host" />
</template>

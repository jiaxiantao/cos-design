<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSandFall, type SandFallController, type SandFallOptions } from '../core';
import '../style/index.css';

const props = defineProps<SandFallOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SandFallController | null = null;

const toOptions = (): SandFallOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createSandFall(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-sandFall-host" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createClickSpark, type ClickSparkController, type ClickSparkOptions } from '../core';
import '../style/index.css';

const props = defineProps<ClickSparkOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ClickSparkController | null = null;

const toOptions = (): ClickSparkOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createClickSpark(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-clickSpark-host" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createTypewriter, type TypewriterController, type TypewriterOptions } from '../core';
import '../style/index.css';

const props = defineProps<TypewriterOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: TypewriterController | null = null;

const toOptions = (): TypewriterOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createTypewriter(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-typewriter-host" />
</template>

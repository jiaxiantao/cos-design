<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createStarfield, type StarfieldController, type StarfieldOptions } from '../core';
import '../style/index.css';

const props = defineProps<StarfieldOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: StarfieldController | null = null;

const toOptions = (): StarfieldOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createStarfield(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-starfield-host" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createAudioVisualizer, type AudioVisualizerController, type AudioVisualizerOptions } from '../core';
import '../style/index.css';

const props = defineProps<AudioVisualizerOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: AudioVisualizerController | null = null;

const toOptions = (): AudioVisualizerOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createAudioVisualizer(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({

});
</script>

<template>
  <div ref="hostRef" class="cos-audioVisualizer-host" />
</template>

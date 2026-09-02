<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createWaveButton, type WaveButtonController, type WaveButtonOptions } from '../core';
import '../style/index.css';

const props = defineProps<WaveButtonOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: WaveButtonController | null = null;

const toOptions = (): WaveButtonOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createWaveButton(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-waveButton-host" />
</template>

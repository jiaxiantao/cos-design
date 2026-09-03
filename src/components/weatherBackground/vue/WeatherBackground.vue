<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createWeatherBackground, type WeatherBackgroundController, type WeatherBackgroundOptions } from '../core';
import '../style/index.css';

const props = defineProps<WeatherBackgroundOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: WeatherBackgroundController | null = null;

const toOptions = (): WeatherBackgroundOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createWeatherBackground(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-weatherBackground-host" />
</template>

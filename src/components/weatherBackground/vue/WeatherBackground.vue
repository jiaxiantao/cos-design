<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createWeatherBackground,
  type WeatherBackgroundController,
  type WeatherBackgroundOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<WeatherBackgroundOptions>();
const emit = defineEmits<{
  'live-weather': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: WeatherBackgroundController | null = null;

const toOptions = (): WeatherBackgroundOptions => ({
  ...props,
  onLiveWeather: (...args: unknown[]) => emit('live-weather', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createWeatherBackground(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-weatherBackground-host" />
</template>

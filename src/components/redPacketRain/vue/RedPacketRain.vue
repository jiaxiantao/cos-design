<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createRedPacketRain,
  type RedPacketRainController,
  type RedPacketRainOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<RedPacketRainOptions>();
const emit = defineEmits<{
  grab: [...args: unknown[]];
  end: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: RedPacketRainController | null = null;

const toOptions = (): RedPacketRainOptions => ({
  ...props,
  onGrab: (...args: unknown[]) => emit('grab', ...args),
  onEnd: (...args: unknown[]) => emit('end', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createRedPacketRain(hostRef.value, toOptions());
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

defineExpose({
  start: () => ctrl?.start(),
  stop: () => ctrl?.stop(),
  reset: () => ctrl?.reset(),
});
</script>

<template>
  <div ref="hostRef" class="cos-redPacketRain-host" />
</template>

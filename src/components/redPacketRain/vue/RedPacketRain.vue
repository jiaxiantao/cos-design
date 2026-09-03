<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createRedPacketRain, type RedPacketRainController, type RedPacketRainOptions } from '../core';
import '../style/index.css';

const props = defineProps<RedPacketRainOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: RedPacketRainController | null = null;

const toOptions = (): RedPacketRainOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createRedPacketRain(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  start: (...args: unknown[]) => ctrl?.start(...args),
  stop: (...args: unknown[]) => ctrl?.stop(...args),
  reset: (...args: unknown[]) => ctrl?.reset(...args)
});
</script>

<template>
  <div ref="hostRef" class="cos-redPacketRain-host" />
</template>

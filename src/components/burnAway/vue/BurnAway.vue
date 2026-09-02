<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createBurnAway, type BurnAwayController, type BurnAwayOptions } from '../core';
import '../style/index.css';

const props = defineProps<BurnAwayOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: BurnAwayController | null = null;

const toOptions = (): BurnAwayOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createBurnAway(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  ignite: (...args: unknown[]) => ctrl?.ignite(...args)
});
</script>

<template>
  <div ref="hostRef" class="cos-burnAway-host" />
</template>

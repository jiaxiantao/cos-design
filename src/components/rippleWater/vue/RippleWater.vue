<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createRippleWater, type RippleWaterController, type RippleWaterOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<RippleWaterOptions>(), {
  interactive: true,
  showHint: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: RippleWaterController | null = null;

const toOptions = (): RippleWaterOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createRippleWater(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-rippleWater-host" />
</template>

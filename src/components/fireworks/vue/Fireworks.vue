<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<FireworksOptions>(), {
  auto: true,
  hint: '点击画布燃放烟花'
});

const emit = defineEmits<{
  complete: [];
}>();

const hostRef = ref<HTMLElement>();
let ctrl: FireworksController | null = null;

const toOptions = (): FireworksOptions => ({
  ...props,
  onComplete: () => emit('complete')
});

onMounted(() => {
  if (!hostRef.value) return;
  ctrl = createFireworks(hostRef.value, toOptions());
});

watch(
  () => ({ ...props }),
  () => ctrl?.update(toOptions()),
  { deep: true }
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  launch: (x?: number) => ctrl?.launch(x)
});
</script>

<template>
  <div ref="hostRef" class="cos-fireworks-host" />
</template>

<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createPhotoFridge, type PhotoFridgeController, type PhotoFridgeOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoFridgeOptions>(), {
  showCaption: true,
});
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoFridgeController | null = null;

const toOptions = (): PhotoFridgeOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoFridge(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoFridge-host" />
</template>

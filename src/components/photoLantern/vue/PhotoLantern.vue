<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoLantern, type PhotoLanternController, type PhotoLanternOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoLanternOptions>();
const emit = defineEmits<{
  'face-change': [...args: unknown[]];
  'index-change': [...args: unknown[]];
  'photo-click': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoLanternController | null = null;

const toOptions = (): PhotoLanternOptions => ({
  ...props,
  onFaceChange: (...args: unknown[]) => emit('face-change', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoLantern(hostRef.value, toOptions());
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

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-photoLantern-host" />
</template>

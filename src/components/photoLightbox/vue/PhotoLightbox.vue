<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createPhotoLightbox,
  type PhotoLightboxController,
  type PhotoLightboxOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<PhotoLightboxOptions>();
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
  'index-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoLightboxController | null = null;

const toOptions = (): PhotoLightboxOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoLightbox(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoLightbox-host" />
</template>

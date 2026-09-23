<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import {
  createPhotoCarousel,
  type PhotoCarouselController,
  type PhotoCarouselOptions,
} from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoCarouselOptions>(), {
  autoRotate: true,
});
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
  'face-change': [...args: unknown[]];
  'index-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoCarouselController | null = null;

const toOptions = (): PhotoCarouselOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
  onFaceChange: (...args: unknown[]) => emit('face-change', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoCarousel(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoCarousel-host" />
</template>

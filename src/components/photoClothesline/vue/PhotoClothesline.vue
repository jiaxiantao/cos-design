<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createPhotoClothesline,
  type PhotoClotheslineController,
  type PhotoClotheslineOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<PhotoClotheslineOptions>();
const emit = defineEmits<{
  'index-change': [...args: unknown[]];
  'photo-click': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoClotheslineController | null = null;

const toOptions = (): PhotoClotheslineOptions => ({
  ...props,
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoClothesline(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoClothesline-host" />
</template>

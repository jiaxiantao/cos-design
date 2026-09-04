<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createPhotoLantern, type PhotoLanternController, type PhotoLanternOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoLanternOptions>(), {
  // Match engine defaults — Vue casts absent Boolean props to false otherwise.
  autoRotate: true,
  showAccessories: true,
});
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
  <div ref="hostRef" class="cos-photoLantern-host" />
</template>

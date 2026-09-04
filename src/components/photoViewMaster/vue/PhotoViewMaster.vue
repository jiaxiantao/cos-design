<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import {
  createPhotoViewMaster,
  type PhotoViewMasterController,
  type PhotoViewMasterOptions,
} from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoViewMasterOptions>(), {
  autoRotate: true,
  showCaption: true,
});
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
  'index-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoViewMasterController | null = null;

const toOptions = (): PhotoViewMasterOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoViewMaster(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoViewMaster-host" />
</template>

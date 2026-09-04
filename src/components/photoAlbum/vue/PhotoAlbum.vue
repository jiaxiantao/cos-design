<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createPhotoAlbum, type PhotoAlbumController, type PhotoAlbumOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoAlbumOptions>(), {
  showPageNumber: true,
});
const emit = defineEmits<{
  'page-change': [...args: unknown[]];
  'index-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoAlbumController | null = null;

const toOptions = (): PhotoAlbumOptions => ({
  ...props,
  onPageChange: (...args: unknown[]) => emit('page-change', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoAlbum(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoAlbum-host" />
</template>

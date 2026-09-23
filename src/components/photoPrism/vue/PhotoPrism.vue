<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createPhotoPrism, type PhotoPrismController, type PhotoPrismOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoPrismOptions>(), {
  autoRotate: true,
  showCaption: true,
});
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoPrismController | null = null;

const toOptions = (): PhotoPrismOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoPrism(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoPrism-host" />
</template>

<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import {
  createPhotoPostcard,
  type PhotoPostcardController,
  type PhotoPostcardOptions,
} from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoPostcardOptions>(), {
  showCaption: true,
});
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
  'index-change': [...args: unknown[]];
  'flip-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoPostcardController | null = null;

const toOptions = (): PhotoPostcardOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
  onFlipChange: (...args: unknown[]) => emit('flip-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoPostcard(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoPostcard-host" />
</template>

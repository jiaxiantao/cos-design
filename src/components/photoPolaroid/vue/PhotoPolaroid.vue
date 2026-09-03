<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createPhotoPolaroid,
  type PhotoPolaroidController,
  type PhotoPolaroidOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<PhotoPolaroidOptions>();
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoPolaroidController | null = null;

const toOptions = (): PhotoPolaroidOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoPolaroid(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoPolaroid-host" />
</template>

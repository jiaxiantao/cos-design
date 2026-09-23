<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createPhotoTunnel, type PhotoTunnelController, type PhotoTunnelOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<PhotoTunnelOptions>(), {
  showCaption: true,
});
const emit = defineEmits<{
  'photo-click': [...args: unknown[]];
  'index-change': [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoTunnelController | null = null;

const toOptions = (): PhotoTunnelOptions => ({
  ...props,
  onPhotoClick: (...args: unknown[]) => emit('photo-click', ...args),
  onIndexChange: (...args: unknown[]) => emit('index-change', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoTunnel(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoTunnel-host" />
</template>

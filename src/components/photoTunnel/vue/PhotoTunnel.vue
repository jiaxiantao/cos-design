<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoTunnel, type PhotoTunnelController, type PhotoTunnelOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoTunnelOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoTunnelController | null = null;

const toOptions = (): PhotoTunnelOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoTunnel(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({

});
</script>

<template>
  <div ref="hostRef" class="cos-photoTunnel-host" />
</template>

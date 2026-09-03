<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoLightbox, type PhotoLightboxController, type PhotoLightboxOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoLightboxOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoLightboxController | null = null;

const toOptions = (): PhotoLightboxOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoLightbox(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoLightbox-host" />
</template>

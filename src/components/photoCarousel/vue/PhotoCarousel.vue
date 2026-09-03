<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoCarousel, type PhotoCarouselController, type PhotoCarouselOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoCarouselOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoCarouselController | null = null;

const toOptions = (): PhotoCarouselOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoCarousel(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoCarousel-host" />
</template>

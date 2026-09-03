<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoClothesline, type PhotoClotheslineController, type PhotoClotheslineOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoClotheslineOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoClotheslineController | null = null;

const toOptions = (): PhotoClotheslineOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoClothesline(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoClothesline-host" />
</template>

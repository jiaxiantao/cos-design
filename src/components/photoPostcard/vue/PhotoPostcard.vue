<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoPostcard, type PhotoPostcardController, type PhotoPostcardOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoPostcardOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoPostcardController | null = null;

const toOptions = (): PhotoPostcardOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoPostcard(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoPostcard-host" />
</template>

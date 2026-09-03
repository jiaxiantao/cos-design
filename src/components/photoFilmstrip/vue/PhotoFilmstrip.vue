<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoFilmstrip, type PhotoFilmstripController, type PhotoFilmstripOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoFilmstripOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoFilmstripController | null = null;

const toOptions = (): PhotoFilmstripOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoFilmstrip(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoFilmstrip-host" />
</template>

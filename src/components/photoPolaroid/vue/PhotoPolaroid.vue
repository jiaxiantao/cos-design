<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createPhotoPolaroid, type PhotoPolaroidController, type PhotoPolaroidOptions } from '../core';
import '../style/index.css';

const props = defineProps<PhotoPolaroidOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: PhotoPolaroidController | null = null;

const toOptions = (): PhotoPolaroidOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createPhotoPolaroid(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-photoPolaroid-host" />
</template>

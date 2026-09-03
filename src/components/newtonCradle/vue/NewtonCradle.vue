<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createNewtonCradle, type NewtonCradleController, type NewtonCradleOptions } from '../core';
import '../style/index.css';

const props = defineProps<NewtonCradleOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: NewtonCradleController | null = null;

const toOptions = (): NewtonCradleOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createNewtonCradle(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-newtonCradle-host" />
</template>

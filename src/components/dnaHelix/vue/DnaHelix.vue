<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createDnaHelix, type DnaHelixController, type DnaHelixOptions } from '../core';
import '../style/index.css';

const props = defineProps<DnaHelixOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: DnaHelixController | null = null;

const toOptions = (): DnaHelixOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createDnaHelix(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-dnaHelix-host" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createScrambleText, type ScrambleTextController, type ScrambleTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<ScrambleTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ScrambleTextController | null = null;

const toOptions = (): ScrambleTextOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createScrambleText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-scrambleText-host" />
</template>

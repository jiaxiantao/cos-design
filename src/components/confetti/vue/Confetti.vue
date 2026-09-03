<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import '../style/index.css';

const props = defineProps<ConfettiOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ConfettiController | null = null;

const toOptions = (): ConfettiOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createConfetti(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
  burst: (...args: unknown[]) => ctrl?.burst(...args)
});
</script>

<template>
  <div ref="hostRef" class="cos-confetti-host" />
</template>

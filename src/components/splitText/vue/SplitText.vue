<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createSplitText, type SplitTextController, type SplitTextOptions } from '../core';
import '../style/index.css';

const props = defineProps<SplitTextOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: SplitTextController | null = null;

const toOptions = (): SplitTextOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createSplitText(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-splitText-host" />
</template>

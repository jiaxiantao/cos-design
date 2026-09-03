<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createMetaballPool, type MetaballPoolController, type MetaballPoolOptions } from '../core';
import '../style/index.css';

const props = defineProps<MetaballPoolOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: MetaballPoolController | null = null;

const toOptions = (): MetaballPoolOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createMetaballPool(hostRef.value, toOptions());
});

watch(
  () => optionsFingerprint(props),
  () => ctrl?.update(toOptions()),
);

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({});
</script>

<template>
  <div ref="hostRef" class="cos-metaballPool-host" />
</template>

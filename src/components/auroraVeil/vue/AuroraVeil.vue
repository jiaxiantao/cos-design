<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import { createAuroraVeil, type AuroraVeilController, type AuroraVeilOptions } from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<AuroraVeilOptions>(), {
  interactive: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: AuroraVeilController | null = null;

const toOptions = (): AuroraVeilOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createAuroraVeil(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-auroraVeil-host" />
</template>

<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch, withDefaults } from 'vue';
import {
  createDandelionField,
  type DandelionFieldController,
  type DandelionFieldOptions,
} from '../core';
import '../style/index.css';

const props = withDefaults(defineProps<DandelionFieldOptions>(), {
  interactive: true,
});
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: DandelionFieldController | null = null;

const toOptions = (): DandelionFieldOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createDandelionField(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-dandelionField-host" />
</template>

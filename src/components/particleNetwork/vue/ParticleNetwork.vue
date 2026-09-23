<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  createParticleNetwork,
  type ParticleNetworkController,
  type ParticleNetworkOptions,
} from '../core';
import '../style/index.css';

const props = defineProps<ParticleNetworkOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ParticleNetworkController | null = null;

const toOptions = (): ParticleNetworkOptions => ({
  ...props,
});

onMounted(() => {
  if (hostRef.value) ctrl = createParticleNetwork(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-particleNetwork-host" />
</template>

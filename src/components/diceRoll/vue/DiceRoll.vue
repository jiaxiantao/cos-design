<script setup lang="ts">
import { optionsFingerprint } from '@cos-design/shared';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createDiceRoll, type DiceRollController, type DiceRollOptions } from '../core';
import '../style/index.css';

const props = defineProps<DiceRollOptions>();
const emit = defineEmits<{
  roll: [...args: unknown[]];
}>();
const hostRef = ref<HTMLElement>();
let ctrl: DiceRollController | null = null;

const toOptions = (): DiceRollOptions => ({
  ...props,
  onRoll: (...args: unknown[]) => emit('roll', ...args),
});

onMounted(() => {
  if (hostRef.value) ctrl = createDiceRoll(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-diceRoll-host" />
</template>

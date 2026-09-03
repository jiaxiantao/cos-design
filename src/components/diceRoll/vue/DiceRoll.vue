<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createDiceRoll, type DiceRollController, type DiceRollOptions } from '../core';
import '../style/index.css';

const props = defineProps<DiceRollOptions>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: DiceRollController | null = null;

const toOptions = (): DiceRollOptions => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = createDiceRoll(hostRef.value, toOptions());
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
  <div ref="hostRef" class="cos-diceRoll-host" />
</template>

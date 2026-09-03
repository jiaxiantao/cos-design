<script setup lang="ts">
import { ref } from 'vue';
import { WeatherBackground } from '@cos-design/weather-background/vue';
import { NeonText } from '@cos-design/neon-text/vue';
import { FlipCard } from '@cos-design/flip-card/vue';
import { NineGrid } from '@cos-design/nine-grid/vue';
import { Confetti, type ConfettiHandle } from '@cos-design/confetti/vue';
import { ScratchCard } from '@cos-design/scratch-card/vue';
import { Fireworks, type FireworksHandle } from '@cos-design/fireworks/vue';

const checkedIn = ref(false);
const confettiRef = ref<ConfettiHandle | null>(null);
const fireworksRef = ref<FireworksHandle | null>(null);

const onReveal = () => {
  checkedIn.value = true;
};

const onDrawEnd = () => {
  confettiRef.value?.burst();
};

const onScratchReveal = () => {
  fireworksRef.value?.launch(120);
  fireworksRef.value?.launch(240);
};
</script>

<template>
  <main>
    <section class="hero">
      <WeatherBackground fill weather="partlyCloudy" :live="false" />
      <div class="heroContent">
        <NeonText text="COS DESIGN" />
        <p>Vue 3 · /vue subpath · campaign starter</p>
        <a class="heroCta" href="#campaign">Start check-in</a>
      </div>
    </section>

    <section id="campaign" class="panel">
      <p class="eyebrow">Primary flow</p>
      <h2>Check-in → NineGrid → Confetti</h2>
      <p>Flip the card to unlock the draw. Celebration uses Confetti with auto=false.</p>
      <div class="row">
        <FlipCard
          front-title="Day 3"
          front-subtitle="Tap to check in"
          back-title="Checked in"
          back-subtitle="+20 pts"
          :on-reveal="onReveal"
        />
        <NineGrid :disabled="!checkedIn" button-text="Draw" :on-draw-end="onDrawEnd" />
      </div>
      <div class="confettiSlot">
        <Confetti ref="confettiRef" fill :auto="false" />
      </div>
    </section>

    <section class="panel">
      <p class="eyebrow">More patterns</p>
      <h2>Scratch → Fireworks</h2>
      <ScratchCard
        :width="320"
        :height="180"
        prize="50% OFF"
        cover-text="Scratch me"
        :on-reveal="onScratchReveal"
      />
      <div class="fireworksSlot">
        <Fireworks ref="fireworksRef" fill :auto="false" />
      </div>
    </section>
  </main>
</template>

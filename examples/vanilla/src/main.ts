import './styles.css';
import '@cos-design/weather-background/element';
import '@cos-design/neon-text/element';
import '@cos-design/flip-card/element';
import '@cos-design/nine-grid/element';
import '@cos-design/scratch-card/element';
import { createConfetti, type ConfettiController } from '@cos-design/confetti/core';
import { createFireworks, type FireworksController } from '@cos-design/fireworks/core';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <main>
    <section class="hero">
      <cos-weather-background fill weather="partlyCloudy"></cos-weather-background>
      <div class="heroContent">
        <cos-neon-text text="COS DESIGN"></cos-neon-text>
        <p>Vanilla · Web Components + Core API</p>
        <a class="heroCta" href="#campaign">Start check-in</a>
      </div>
    </section>

    <section id="campaign" class="panel">
      <p class="eyebrow">Primary flow</p>
      <h2>Check-in → NineGrid → Confetti (Core)</h2>
      <p>Elements for markup, Core for imperative celebration.</p>
      <div class="row">
        <cos-flip-card
          id="flip"
          front-title="Day 3"
          front-subtitle="Tap to check in"
          back-title="Checked in"
          back-subtitle="+20 pts"
        ></cos-flip-card>
        <cos-nine-grid id="grid" disabled button-text="Draw"></cos-nine-grid>
      </div>
      <div id="confetti" class="confettiSlot"></div>
    </section>

    <section class="panel">
      <p class="eyebrow">More patterns</p>
      <h2>Scratch → Fireworks (Core)</h2>
      <cos-scratch-card
        id="scratch"
        width="320"
        height="180"
        prize="50% OFF"
        cover-text="Scratch me"
      ></cos-scratch-card>
      <div id="fireworks" class="fireworksSlot"></div>
    </section>
  </main>
`;

const confettiHost = document.querySelector<HTMLElement>('#confetti')!;
const fireworksHost = document.querySelector<HTMLElement>('#fireworks')!;
const flip = document.querySelector('#flip')!;
const grid = document.querySelector('#grid')!;
const scratch = document.querySelector('#scratch')!;

const confetti: ConfettiController = createConfetti(confettiHost, { fill: true, auto: false });
const fireworks: FireworksController = createFireworks(fireworksHost, { fill: true, auto: false });

flip.addEventListener('reveal', () => {
  grid.removeAttribute('disabled');
});

grid.addEventListener('draw-end', () => {
  confetti.burst();
});

scratch.addEventListener('reveal', () => {
  fireworks.launch(120);
  fireworks.launch(240);
});

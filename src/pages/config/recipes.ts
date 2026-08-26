export interface RecipeItem {
  id: string;
  path: string;
  titleKey: string;
  descriptionKey: string;
  tags: string[];
  components: string[];
}

/** 活动页组合配方（Playground 场景演示） */
export const recipes: RecipeItem[] = [
  {
    id: 'scratch-celebrate',
    path: '/recipes/scratch-celebrate',
    titleKey: 'recipes.items.scratchCelebrate.title',
    descriptionKey: 'recipes.items.scratchCelebrate.description',
    tags: ['ScratchCard', 'Fireworks'],
    components: ['ScratchCard', 'Fireworks']
  },
  {
    id: 'countdown-rain',
    path: '/recipes/countdown-rain',
    titleKey: 'recipes.items.countdownRain.title',
    descriptionKey: 'recipes.items.countdownRain.description',
    tags: ['Countdown', 'RedPacketRain'],
    components: ['Countdown', 'RedPacketRain']
  },
  {
    id: 'turntable-confetti',
    path: '/recipes/turntable-confetti',
    titleKey: 'recipes.items.turntableConfetti.title',
    descriptionKey: 'recipes.items.turntableConfetti.description',
    tags: ['Turntable', 'Confetti'],
    components: ['Turntable', 'Confetti']
  },
  {
    id: 'chest-open',
    path: '/recipes/chest-open',
    titleKey: 'recipes.items.chestOpen.title',
    descriptionKey: 'recipes.items.chestOpen.description',
    tags: ['Charge', 'ProgressChest', 'Confetti'],
    components: ['Charge', 'ProgressChest', 'Confetti']
  },
  {
    id: 'slot-jackpot',
    path: '/recipes/slot-jackpot',
    titleKey: 'recipes.items.slotJackpot.title',
    descriptionKey: 'recipes.items.slotJackpot.description',
    tags: ['SlotMachine', 'Confetti'],
    components: ['SlotMachine', 'Confetti']
  },
  {
    id: 'fill-hero',
    path: '/recipes/fill-hero',
    titleKey: 'recipes.items.fillHero.title',
    descriptionKey: 'recipes.items.fillHero.description',
    tags: ['WeatherBackground', 'NeonText', 'fill'],
    components: ['WeatherBackground', 'NeonText']
  },
  {
    id: 'nine-grid-draw',
    path: '/recipes/nine-grid-draw',
    titleKey: 'recipes.items.nineGridDraw.title',
    descriptionKey: 'recipes.items.nineGridDraw.description',
    tags: ['NineGrid', 'Confetti'],
    components: ['NineGrid', 'Confetti']
  },
  {
    id: 'flip-checkin',
    path: '/recipes/flip-checkin',
    titleKey: 'recipes.items.flipCheckin.title',
    descriptionKey: 'recipes.items.flipCheckin.description',
    tags: ['FlipCard', 'Confetti'],
    components: ['FlipCard', 'Confetti']
  }
];

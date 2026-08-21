import type zhCN from './zh-CN';

const enUS: typeof zhCN = {
  documentTitle: 'cos-design · Visual Effect Component Library',
  language: {
    label: 'Language',
    'zh-CN': '中文',
    'en-US': 'English'
  },
  layout: {
    brandTagline: 'Visual effect component library',
    searchPlaceholder: 'Search components…',
    componentCount: '{{value}} components',
    categoryCount: '{{value}} categories',
    githubAriaLabel: 'View source on GitHub',
    sidebarTitle: 'Browse by category',
    navHome: 'Overview',
    navCatalog: 'Catalog',
    navQuickstart: 'Quick Start',
    navRecipes: 'Recipes'
  },
  home: {
    eyebrow: 'React Visual Effect Library',
    title: 'Make your pages memorable',
    subtitle:
      '<strong>cos-design</strong> is a React library built for visual storytelling—focused on effects and atmosphere for campaign pages, brand landings, and creative showcases.',
    browseCatalog: 'Browse catalog',
    npmDocs: 'npm docs',
    metricComponents: 'visual components',
    metricCategories: 'scenario categories',
    metricNew: 'recent additions',
    whyTitle: 'Why cos-design',
    features: [
      {
        title: 'Ready out of the box',
        desc: 'Import components right after install, with auto-injected styles and full TypeScript types.'
      },
      {
        title: 'Flexible package granularity',
        desc: 'Install everything with cos-design or only the pieces you need from @cos-design/*.'
      },
      {
        title: 'Covers broad scenarios',
        desc: 'From ambient backgrounds to campaign mechanics, from dashboards to physics and algorithm visuals.'
      },
      {
        title: 'Playable online',
        desc: 'Every component ships with a live demo, instant prop previewing, and copyable examples.'
      }
    ],
    scenariosTitle: 'Built for these scenarios',
    scenarios: [
      { title: 'Campaign pages', desc: 'Turntables, scratch cards, fireworks celebrations' },
      { title: 'Brand landings', desc: 'Aurora backgrounds, neon headlines, holographic cards' },
      { title: 'Dashboard visuals', desc: 'Flip counters, countdowns, liquid progress' },
      { title: 'Creative showcases', desc: 'Newton cradle, maze generation, Game of Life' }
    ],
    categoriesTitle: 'Component categories',
    viewAll: 'View all →',
    ctaTitle: 'Ship your first effect in minutes',
    ctaDesc: 'Install cos-design or any @cos-design/* package, then copy an example and ship.',
    ctaQuickstart: 'Read quick start',
    ctaCatalog: 'Open catalog'
  },
  catalog: {
    title: 'Component catalog',
    subtitle:
      'Pick a component from the left categories or search from the top bar. {{value}} visual effect components in total.',
    homeLabel: 'Project overview',
    homeText: 'Back to the homepage to see what cos-design can do',
    quickstartLabel: 'Getting started',
    quickstartText: 'Open quick start — installation, usage, and tips'
  },
  recipes: {
    eyebrow: 'Campaign Recipes',
    title: 'Campaign recipes',
    subtitle: 'Compose marketing components into ready-to-ship campaign flows.',
    back: '← Back to recipes',
    notFound: 'Recipe not found',
    howTitle: 'How it fits together',
    hintFireworks: 'Auto-launches on reveal; click canvas for more',
    hintConfetti: 'Bursts after the spin; click for another burst',
    items: {
      scratchCelebrate: {
        title: 'Scratch & celebrate',
        description: 'Fireworks launch when the scratch card is revealed.',
        how: 'Listen to ScratchCard.onReveal, then call FireworksHandle.launch at a few x positions.',
        prize: '🎉 Grand prize!',
        cover: 'Scratch to reveal'
      },
      countdownRain: {
        title: 'Countdown red-packet rain',
        description: 'Start a red-packet rain when the countdown ends.',
        how: 'On Countdown.onEnd call RedPacketRainHandle.start; size the round with width/height/duration.',
        waiting: 'Red-packet rain starts when the countdown ends…',
        ended: 'Rain is live — tap packets to grab',
        hint: 'Tap packets to grab'
      },
      turntableConfetti: {
        title: 'Turntable + confetti',
        description: 'Burst confetti when the turntable stops.',
        how: 'Wire Turntable.onSpinEnd to ConfettiHandle.burst; use targetIndex / spin() for server-drawn prizes.',
        button: 'Spin'
      },
      chestOpen: {
        title: 'Charge to open the chest',
        description: 'Sync charge progress to a chest, then celebrate when it opens.',
        how: 'Drive ProgressChest.progress from Charge.onChange; fire Confetti.burst on ProgressChest.onOpen or Charge.onComplete.',
        charging: 'Charging…',
        opened: 'Chest opened!'
      },
      slotJackpot: {
        title: 'Slot machine jackpot',
        description: 'Burst confetti when all three reels match.',
        how: 'In SlotMachine.onSpinEnd, check if all symbols match then call ConfettiHandle.burst; use targetResults for controlled outcomes.',
        button: 'Spin'
      }
    }
  },
  component: {
    backToCatalog: '← Back to catalog',
    editCode: 'Edit code',
    closeEditor: 'Hide editor',
    copyInstall: 'Copy install',
    copyForAi: 'Copy for AI',
    copied: 'Copied',
    demoNotConfigured: 'Demo is not configured yet'
  },
  quickstart: {
    eyebrow: 'Quick Start',
    title: 'Quick Start',
    subtitle:
      'Get installed and integrated in minutes. Install the full bundle or only the packages you need. Browse every component from the left navigation and copy examples from each page.',
    aggregatePackage: 'Full bundle: cos-design',
    scopedPackages: '@cos-design packages',
    installTitle: '1. Install',
    installReq: 'Requires React >= 18 and Node.js >= 20. Pick either option:',
    installMethodA: 'Option A: install every component',
    installMethodADesc: 'Best for quick trials and pages that mix several components. The API stays the same.',
    installMethodB: 'Option B: install a single component',
    installMethodBDesc: 'Download only what you use. Naming rule: camelCase source directory → kebab-case npm package.',
    namingDir: 'Source directory',
    namingPkg: 'npm package',
    sharedHintBefore: 'Components that rely on shared utilities pull in ',
    sharedHintAfter: ' automatically. Each component page offers Copy install and Copy for AI.',
    usageTitle: '2. Basic usage',
    usageAggregate: 'Import from the full bundle',
    usageAggregateDesc: 'Import components as needed—no separate stylesheet import required.',
    usageScoped: 'Import from a scoped package',
    usageScopedBefore: 'After installing the matching ',
    usageScopedAfter: ' package, import directly from it.',
    categoriesTitle: '3. Component categories',
    categoriesDesc:
      '{{components}} components across {{categories}} scenario categories. Use the left navigation for demos, or',
    categoriesCatalogLink: 'open the catalog',
    categoriesDescAfter: ' to browse them all.',
    categoryCards: [
      {
        label: 'Backgrounds',
        desc: 'Full-screen atmosphere and particle scenes',
        examples: 'MatrixRain, Aurora, Starfield'
      },
      { label: 'Text effects', desc: 'Headline and banner animations', examples: 'Typewriter, NeonText, ScrambleText' },
      {
        label: 'Photo preview',
        desc: 'Object-metaphor photo browsers',
        examples: 'PhotoAlbum, PhotoLantern, PhotoFilmstrip'
      },
      {
        label: 'Interactive toys',
        desc: 'Playful mouse and touch feedback',
        examples: 'WaveButton, Spotlight, MagneticButton'
      },
      { label: 'Campaign games', desc: 'Lottery and event mechanics', examples: 'Turntable, ScratchCard, Charge' },
      {
        label: 'Data decorations',
        desc: 'Dashboards and time displays',
        examples: 'FlipCounter, Countdown, LiquidProgress'
      },
      { label: 'Physics', desc: 'Gravity, springs, and collisions', examples: 'NewtonCradle, SandFall, SpringMass' },
      {
        label: 'Science & algorithms',
        desc: 'Astronomy, chaos, and algorithm visuals',
        examples: 'SolarSystem, GameOfLife, MazeGenerator'
      },
      {
        label: 'Visual effects',
        desc: 'Fireworks, arcs, and visual experiments',
        examples: 'Fireworks, ElectricArc, PlasmaBall'
      }
    ],
    notesTitle: '4. Things to know',
    notes: [
      {
        title: 'No manual CSS import',
        desc: 'Styles are injected with the component, so everything works right after install.'
      },
      {
        title: 'Two installation modes',
        desc: 'cos-design installs everything; @cos-design/<kebab-name> installs a single component. Components that depend on @cos-design/shared pull it in automatically.'
      },
      {
        title: 'Package names are kebab-case',
        desc: 'The weatherBackground directory maps to @cos-design/weather-background (npm requires lowercase names).'
      },
      {
        title: 'Render canvas components on the client',
        desc: 'In SSR frameworks such as Next.js use dynamic(..., { ssr: false }) to avoid window / canvas errors.'
      },
      {
        title: 'Keep animation density in check',
        desc: 'Aim for one strong background plus a few focal interactions; avoid several full-screen canvases at once.'
      },
      {
        title: 'Give containers explicit sizes',
        desc: 'Canvas components need width / height, and the parent needs a visible height, otherwise nothing renders.'
      },
      {
        title: 'Automatic power saving',
        desc: 'Most canvas components pause requestAnimationFrame when the tab is hidden.'
      },
      {
        title: 'Microphone permission',
        desc: 'AudioVisualizer requests the microphone when useMic is true; serve over HTTPS and tell users first.'
      },
      {
        title: 'Imperative triggers',
        desc: 'Fireworks and Confetti expose launch / burst through a ref, ideal for button-triggered celebrations.'
      },
      {
        title: 'TypeScript out of the box',
        desc: 'Every component exports its props type, e.g. import { Turntable, type TurntableProps } from "cos-design".'
      }
    ],
    patternsTitle: '5. Common patterns',
    patternSsr: 'Disable SSR in Next.js',
    patternImperative: 'Trigger fireworks imperatively',
    localDevTitle: '6. Develop this repository locally',
    snippets: {
      installFull: `# Install all components (recommended for a quick trial)
pnpm add cos-design
# Or: npm install cos-design / yarn add cos-design`,
      installSingle: `# Install only what you need (smaller footprint)
pnpm add @cos-design/weather-background
pnpm add @cos-design/fireworks
pnpm add @cos-design/scratch-card`,
      basic: `import { Fireworks, ScrambleText, ScratchCard } from 'cos-design';

export default function Page() {
  return (
    <>
      <ScrambleText text="GRAND OPENING" />
      <ScratchCard prize="🎉 You won!" />
      <Fireworks width={800} height={500} />
    </>
  );
}`,
      ssr: `import dynamic from 'next/dynamic';

const Fireworks = dynamic(
  () => import('cos-design').then((m) => m.Fireworks),
  { ssr: false }
);

// Scoped packages work the same way:
// const WeatherBackground = dynamic(
//   () => import('@cos-design/weather-background').then((m) => m.WeatherBackground),
//   { ssr: false }
// );`,
      localDev: `git clone https://github.com/jiaxiantao/cos-design.git
cd cos-design && npm run setup && pnpm dev
# Open http://localhost:4000`
    }
  },
  liveDemo: {
    editorTitle: 'Edit code · Live preview',
    reset: 'Reset',
    copy: 'Copy',
    copied: 'Copied',
    hint: 'Components are already injected into scope, so you can write JSX directly and see instant updates.'
  },
  propsTable: {
    title: 'Props',
    count: '{{value}} items',
    desc: 'These are the component props. Tweak them in the editor below and preview the result immediately.',
    colName: 'Prop',
    colType: 'Type',
    colRequired: 'Required',
    colDefault: 'Default',
    colDescription: 'Description',
    requiredYes: 'Yes',
    requiredNo: 'No',
    empty: '—',
    typesTitle: 'Custom types',
    typesCount: '{{value}}',
    typesDesc: 'TypeScript interfaces referenced by the props above, with their fields.'
  },
  backgroundDemo: {
    switchLabel: 'Sample content',
    navComponents: 'Components',
    navDocs: 'Docs',
    signUp: 'Get started',
    tagText: 'Background effects are live',
    primaryCta: 'Try it now',
    secondaryCta: 'Learn more',
    defaultHeadline: 'Let the background move on its own',
    defaultSubtitle: 'Drop-in visual backgrounds for campaign and brand pages',
    headlines: {
      WeatherBackground: 'Put the weather into your page',
      RippleWater: 'One touch and the water comes alive',
      SmokeFog: 'Smoke drifting slowly apart',
      BubbleField: 'Bubbles rising from the deep',
      MatrixRain: 'Digital rain pouring down',
      MeteorRain: 'Meteors streaking across the night',
      ParticleNetwork: 'Particles connecting to each other',
      Aurora: 'Aurora sweeping across the sky',
      CyberGrid: 'Step onto the neon grid',
      Snowfall: 'Petals and snowflakes falling together',
      Starfield: 'Fly through an endless starfield'
    },
    subtitles: {
      WeatherBackground: 'Switch between rain, snow, sun, and fog—great for campaign and brand scenes',
      RippleWater: 'Click to splash on a realistic water surface',
      SmokeFog: 'Noise-driven fog that drifts slowly and clears on click',
      BubbleField: 'Nearby bubbles merge, with underwater light and shadow',
      MatrixRain: 'Classic character rain with room for a headline and subtitle',
      MeteorRain: 'Meteors with glowing trails across deep space',
      ParticleNetwork: 'Node links that react to the cursor',
      Aurora: 'Layered color bands drifting slowly',
      CyberGrid: 'A perspective grid stretching forward',
      Snowfall: 'Supports both snowflake and sakura modes',
      Starfield: 'A depth-flight journey through the stars'
    }
  },
  categories: {
    background: {
      label: 'Backgrounds',
      description: 'Canvas / CSS animated backgrounds and particle scenes'
    },
    text: {
      label: 'Text effects',
      description: 'Headline, banner, and terminal-style text animations'
    },
    photo: {
      label: 'Photo preview',
      description: 'Object-metaphor photo browsers — album, lantern, clothesline, and more'
    },
    interactive: {
      label: 'Interactive toys',
      description: 'Playful components driven by mouse and touch'
    },
    game: {
      label: 'Campaign games',
      description: 'Lottery, celebration, and event page mechanics'
    },
    data: {
      label: 'Data decorations',
      description: 'Dashboards, gauges, and time data displays'
    },
    physics: {
      label: 'Physics',
      description: 'Gravity, springs, collisions, and other real physics'
    },
    science: {
      label: 'Science & algorithms',
      description: 'Astronomy, chaos, cellular automata, and algorithm visuals'
    },
    effect: {
      label: 'Visual effects',
      description: 'Fireworks, arcs, portals, and other visual experiments'
    }
  },
  demos: {
    clickSpark: 'Click anywhere to create sparks',
    fireworksLaunch: 'Launch fireworks',
    flipCounterHint: 'Value increases every 2 seconds',
    holographicSubtitle: 'Holographic member card · Limited #001',
    liquidGlassTitle: 'Liquid glass panel',
    liquidGlassDesc: 'backdrop-filter frosted glass effect',
    magneticButton: 'Magnetic button',
    progressChestLabel: 'Auto-filling chest',
    progressChestOpened: 'Chest opened!',
    spotlight: 'Move the mouse to reveal the hidden area ✨',
    timelineSteps: ['Plan', 'Design', 'Build', 'Test', 'Launch'],
    componentCopy: {
      burnAwayCompleted: 'Gone.',
      confettiHint: 'Click the canvas to burst again',
      countdownLabels: {
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds'
      },
      countdownInvalid: 'Invalid target time',
      countdownEnded: "Time's up!",
      cursorTrailHint: 'Move the pointer to see the particle trail',
      diceRoll: 'Roll dice',
      diceRolling: 'Rolling...',
      diceResult: 'Result:',
      fireworksHint: 'Click the canvas to launch fireworks',
      gameOfLifeLabels: {
        generation: 'Generation',
        alive: 'alive',
        pause: 'Pause',
        play: 'Play',
        randomize: 'Randomize'
      },
      networkGraphHint: 'Drag nodes · Hover to view connections',
      particleNetworkHint: 'Move the pointer or touch to interact with particles',
      photoAlbumAria: 'Travel photo album',
      photoAlbumLabels: {
        previous: 'Previous photo',
        next: 'Next photo',
        empty: 'No photos',
        flyleafTitle: 'Photo Album',
        flyleafSubtitle: 'Keeping distant places close',
        flyleafEndTitle: 'The End',
        flyleafEndSubtitle: 'Thank you for browsing'
      },
      photoAlbumPhotos: [
        { title: 'On the Road', description: 'Keeping distant places close' },
        { title: 'Morning Valley', description: 'Wind moving between the mountains' },
        { title: 'By the Lake', description: 'Still enough to hear the water' },
        { title: 'Forest Walk', description: 'A green memory from midsummer' },
        { title: 'At Sunset', description: 'The journey continues in the afterglow' },
        { title: 'Above the Ridge', description: 'A sea of clouds rolling below' },
        { title: 'Afternoon Shore', description: 'Waves returning again and again' },
        { title: 'Snow Peak Night', description: 'The Milky Way over quiet mountains' },
        { title: 'Lake Reflection', description: 'The sky held whole in still water' },
        { title: 'Misty Horizon', description: 'The road still has farther to go' }
      ],
      photoLanternAria: 'Revolving lantern photo preview',
      photoLanternHint: 'Drag left or right to spin · Inertia on release · Idle clockwise rotation',
      photoLanternPhotos: [
        { title: 'On the Road', description: 'Scenes glowing inside the lantern' },
        { title: 'Morning Valley', description: 'Wind moving between the mountains' },
        { title: 'By the Lake', description: 'Still enough to hear the water' },
        { title: 'Forest Walk', description: 'A green memory from midsummer' },
        { title: 'At Sunset', description: 'The journey continues in the afterglow' },
        { title: 'Above the Ridge', description: 'A sea of clouds rolling below' }
      ],
      photoClotheslineAria: 'Travel photos on a clothesline',
      photoClotheslineHint: 'Grab a photo and fling it any direction · Drag the empty space to browse',
      photoFilmstripAria: 'Travel filmstrip',
      photoFilmstripHint: 'Drag to scroll the film · Snaps to a frame on release',
      photoPolaroidAria: 'Polaroid photo stack',
      photoPolaroidHint: 'Drag to rearrange · Click to bring forward · Cards stay where you drop them',
      photoLightboxAria: 'Lightbox slide preview',
      photoLightboxHint: 'Drag a slide sideways to change · Snaps back if under the threshold',
      photoCarouselAria: 'Carousel photo tray',
      photoCarouselHint: 'Drag to spin the tray · Inertia on release · Slow idle rotation',
      photoPrismAria: 'Photo prism cube',
      photoPrismHint: 'Drag to tumble the cube · Inertia on release · Slow idle spin',
      photoScrollAria: 'Photo scroll',
      photoScrollHint: 'Drag the parchment · Inertia then snaps to the nearest frame',
      photoPostcardAria: 'Travel postcard',
      photoPostcardHint: 'Click to flip · Drag sideways past the threshold to change cards',
      photoViewMasterAria: 'View-Master disc',
      photoViewMasterHint: 'Drag to spin the disc · Inertia on release · Optional idle spin',
      photoFridgeAria: 'Fridge magnet photo wall',
      photoFridgeHint: 'Drag photos to the front · They stay where you drop them',
      photoTunnelAria: 'Photo tunnel',
      photoTunnelHint: 'Drag to fly through · Inertia then snaps to the nearest frame',
      redPacketGrabbed: 'Collected:',
      redPacketEnded: 'Red packet rain ended',
      redPacketHint: 'Click red packets to collect them',
      rippleHint: 'Click the water to create ripples',
      sandHint: 'Hold the pointer to draw sand',
      sandClear: 'Clear',
      scratchPrize: '🎉 You won!',
      scratchCover: 'Scratch to reveal',
      slotStart: 'Start',
      slotSpinning: 'Spinning...',
      slotJackpot: '🎰 Jackpot!',
      slotResult: 'Result:',
      smokeAria: 'Smoke background; click to disperse',
      springMassHint: 'Drag grid nodes to see the springs rebound',
      turntablePrizes: ['First prize', 'Second prize', 'Third prize', 'Try again', 'Coupon', 'One more spin'],
      turntableStart: 'Spin',
      turntableSpinning: 'Spinning...',
      turntableResult: 'You won: ',
      typewriterTexts: ['Hello, cos-design!', 'Welcome to the component library ✨', 'Build something fun 🚀'],
      waveButton: 'Try it'
    },
    weather: {
      liveToggle: '📍 Live weather (Open-Meteo)',
      liveToggleOffTitle: 'Disable live weather and return to manual controls',
      liveToggleOnTitle: 'Enable live weather for {{city}}',
      timeLabel: '🕐 Time',
      timeAria: 'Adjust scene time',
      windLabel: '💨 Wind',
      windAria: 'Adjust Beaufort wind level',
      windValue: 'Level {{level}} · {{name}}',
      rainLabel: '🌧️ Rain',
      rainAria: 'Adjust rain intensity',
      snowLabel: '❄️ Snow',
      snowAria: 'Adjust snow intensity',
      hailLabel: '🧊 Hail',
      hailAria: 'Adjust hail intensity',
      fogLabel: '🌫️ Fog',
      fogAria: 'Adjust fog density',
      smogLabel: '😷 Smog',
      smogAria: 'Adjust smog intensity',
      liveHint:
        'Live weather is enabled. Sliders show read-only local time, wind, and intensity for {{city}}. Disable live weather or pick a weather type above to adjust manually.',
      statusLocating: 'Getting your location… (permission required)',
      statusFetching: 'Fetching live weather for {{city}}…',
      statusSuccess: '{{city}}: {{weather}} · {{time}} · Wind level {{wind}} ({{speed}} km/h){{extra}} · WMO {{code}}',
      statusTime: 'Local time {{time}}',
      statusDay: '☀️ Day',
      statusNight: '🌙 Night',
      statusError: 'Could not fetch live weather. Switched back to manual controls.',
      canvasAria: '{{weather}} weather background with wind level {{wind}}',
      loading: 'Loading weather…',
      summary: '{{city}} · Time {{time}} · {{wind}}{{extra}} · Day and night follow local sunrise and sunset',
      options: {
        sunny: '☀️ Sunny',
        partlyCloudy: '⛅ Partly cloudy',
        overcast: '☁️ Overcast',
        rain: '🌧️ Rain',
        thunderstorm: '🌩️ Thunderstorm',
        snow: '❄️ Snow',
        sleet: '🌧️❄️ Sleet',
        hail: '🧊 Hail',
        fog: '🌫️ Fog',
        smog: '😷 Smog'
      },
      cities: {
        beijing: 'Beijing',
        shanghai: 'Shanghai',
        guangzhou: 'Guangzhou',
        hangzhou: 'Hangzhou',
        chengdu: 'Chengdu',
        harbin: 'Harbin',
        lhasa: 'Lhasa',
        tokyo: 'Tokyo',
        london: 'London',
        newYork: 'New York',
        sydney: 'Sydney'
      },
      windLevels: [
        'Calm',
        'Light air',
        'Light breeze',
        'Gentle breeze',
        'Moderate breeze',
        'Fresh breeze',
        'Strong breeze',
        'High wind',
        'Gale',
        'Strong gale',
        'Storm',
        'Violent storm',
        'Hurricane'
      ],
      levels: {
        format: '{{level}} · {{label}}',
        rain: ['Drizzle', 'Light rain', 'Moderate rain', 'Heavy rain', 'Torrential rain'],
        snow: ['Snow grains', 'Light snow', 'Moderate snow', 'Heavy snow', 'Blizzard'],
        hail: ['Small hail', 'Dense hail', 'Large hail'],
        fog: ['Mist', 'Moderate fog', 'Dense fog'],
        smog: ['Light smog', 'Moderate smog', 'Heavy smog']
      }
    }
  }
};

export default enUS;

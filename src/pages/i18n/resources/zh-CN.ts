const zhCN = {
  documentTitle: 'cos-design · 视觉特效组件库',
  language: {
    label: '语言',
    'zh-CN': '中文',
    'en-US': 'English'
  },
  layout: {
    brandTagline: '视觉特效组件库',
    searchPlaceholder: '搜索组件…',
    componentCount: '{{value}} 组件',
    categoryCount: '{{value}} 分类',
    githubAriaLabel: '在 GitHub 查看源码',
    sidebarTitle: '分类导航',
    navHome: '首页介绍',
    navCatalog: '组件目录',
    navQuickstart: '快速开始'
  },
  home: {
    eyebrow: 'React 视觉特效组件库',
    title: '为页面加上记忆点',
    subtitle:
      '<strong>cos-design</strong> 是面向视觉表达的 React 组件库——专注特效与氛围，给活动页、品牌页与创意展示加趣味与记忆点。',
    browseCatalog: '浏览组件目录',
    npmDocs: 'npm 文档',
    metricComponents: '视觉组件',
    metricCategories: '场景分类',
    metricNew: '近期新增',
    whyTitle: '为什么用 cos-design',
    features: [
      {
        title: '开箱即用',
        desc: '安装后直接导入，样式自动注入，完整 TypeScript 类型。'
      },
      {
        title: '按需拆包',
        desc: '可用 cos-design 一次装齐，或按 @cos-design/* 只装需要的组件。'
      },
      {
        title: '场景覆盖全',
        desc: '从背景氛围到营销玩法，从数据大屏到物理与算法可视化。'
      },
      {
        title: '在线可玩',
        desc: '每个组件都有 Live Demo，改 props 即时预览，示例代码可复制。'
      }
    ],
    scenariosTitle: '适合这些场景',
    scenarios: [
      { title: '营销活动页', desc: '转盘抽奖、刮刮乐、烟花庆祝' },
      { title: '品牌 Landing', desc: '极光背景、霓虹标题、全息卡片' },
      { title: '数据大屏', desc: '翻牌器、倒计时、液态进度' },
      { title: '创意展示', desc: '牛顿摆、迷宫生成、生命游戏' }
    ],
    categoriesTitle: '组件分类',
    viewAll: '查看全部 →',
    ctaTitle: '几分钟接入第一个特效',
    ctaDesc: '安装 cos-design 或按需安装 @cos-design/*，复制示例即可上线。',
    ctaQuickstart: '阅读快速开始',
    ctaCatalog: '进入组件目录'
  },
  catalog: {
    title: '组件目录',
    subtitle: '从左侧分类选择组件，或在顶部搜索框快速定位。共 {{value}} 个视觉特效组件。',
    homeLabel: '项目介绍',
    homeText: '返回首页了解 cos-design 能做什么',
    quickstartLabel: '新手上路',
    quickstartText: '查看快速开始 — 安装、用法与注意事项'
  },
  component: {
    backToCatalog: '← 返回目录',
    editCode: '编辑代码',
    closeEditor: '关闭编辑',
    copyInstall: '复制安装',
    copied: '已复制',
    demoNotConfigured: '演示暂未配置'
  },
  quickstart: {
    eyebrow: 'Quick Start',
    title: '快速开始',
    subtitle:
      '几分钟内完成安装与接入。支持一次安装全部，或按组件拆包按需安装。左侧分类浏览全部组件，每页可复制对应示例代码。',
    aggregatePackage: '聚合包 cos-design',
    scopedPackages: '@cos-design 子包',
    installTitle: '1. 安装',
    installReq: '要求 React >= 18，Node.js >= 20。任选一种方式：',
    installMethodA: '方式 A：安装全部组件',
    installMethodADesc: '适合快速试用、多组件同页，API 与以往一致。',
    installMethodB: '方式 B：按需安装单个组件',
    installMethodBDesc: '只下载用到的包，减小依赖体积。包名规则：源码目录 camelCase → npm 包 kebab-case。',
    namingDir: '组件目录',
    namingPkg: 'npm 包名',
    sharedHintBefore: '依赖共享工具的组件会自动安装 ',
    sharedHintAfter: '，无需手动添加。各组件页标题旁也可复制对应安装命令。',
    usageTitle: '2. 基础用法',
    usageAggregate: '从聚合包导入',
    usageAggregateDesc: '按需导入组件，无需单独引入样式文件。',
    usageScoped: '从子包导入',
    usageScopedBefore: '安装对应 ',
    usageScopedAfter: ' 后，从该包导入即可。',
    categoriesTitle: '3. 组件分类',
    categoriesDesc: '共 {{components}} 个组件，按场景分为 {{categories}} 类。点击左侧导航进入演示，或',
    categoriesCatalogLink: '打开组件目录',
    categoriesDescAfter: '浏览全部。',
    categoryCards: [
      { label: '背景动效', desc: '全屏氛围、粒子场景', examples: 'MatrixRain、Aurora、Starfield' },
      { label: '文字动效', desc: '标题与 Banner 动画', examples: 'Typewriter、NeonText、ScrambleText' },
      { label: '图片预览', desc: '物件隐喻式图片浏览', examples: 'PhotoAlbum、PhotoLantern、PhotoFilmstrip' },
      { label: '交互玩具', desc: '鼠标/触摸趣味反馈', examples: 'WaveButton、Spotlight、MagneticButton' },
      { label: '游戏营销', desc: '抽奖与活动玩法', examples: 'Turntable、ScratchCard、Charge' },
      { label: '数据装饰', desc: '大屏与时间展示', examples: 'FlipCounter、Countdown、LiquidProgress' },
      { label: '物理模拟', desc: '重力、弹簧、碰撞互动', examples: 'NewtonCradle、SandFall、SpringMass' },
      { label: '科学算法', desc: '天文、混沌与算法可视化', examples: 'SolarSystem、GameOfLife、MazeGenerator' },
      { label: '视觉特效', desc: '烟花、电弧等视觉实验', examples: 'Fireworks、ElectricArc、PlasmaBall' }
    ],
    notesTitle: '4. 注意事项',
    notes: [
      {
        title: '无需手动引入 CSS',
        desc: '样式随组件自动注入，安装后即可使用。'
      },
      {
        title: '两种安装方式',
        desc: 'cos-design 一次装齐全部；@cos-design/<kebab-name> 按需安装单个组件。依赖 @cos-design/shared 的组件会自动带上工具包。'
      },
      {
        title: '包名是 kebab-case',
        desc: '源码目录 weatherBackground 对应 npm 包 @cos-design/weather-background（npm 要求新包名全小写）。'
      },
      {
        title: 'Canvas 组件请客户端渲染',
        desc: 'Next.js 等 SSR 框架请用 dynamic(..., { ssr: false })，避免 window / canvas 报错。'
      },
      {
        title: '控制动画密度',
        desc: '建议每页「一个强视觉背景 + 若干局部交互」，避免多个全屏 Canvas 同时运行。'
      },
      {
        title: '明确容器尺寸',
        desc: 'Canvas 组件需传入 width / height，父级也应有可见高度，否则可能渲染为空白。'
      },
      {
        title: '后台自动省电',
        desc: '多数 Canvas 组件在标签页隐藏时会暂停 requestAnimationFrame。'
      },
      {
        title: '麦克风权限',
        desc: 'AudioVisualizer 在 useMic 为 true 时会请求麦克风，需在 HTTPS 下使用并给用户提示。'
      },
      {
        title: '命令式触发',
        desc: 'Fireworks、Confetti 支持 ref 调用 launch / burst，适合按钮触发庆祝效果。'
      },
      {
        title: 'TypeScript 开箱即用',
        desc: '所有组件导出 Props 类型，如 import { Turntable, type TurntableProps } from "cos-design"。'
      }
    ],
    patternsTitle: '5. 常见模式',
    patternSsr: 'Next.js 关闭 SSR',
    patternImperative: '命令式触发烟花',
    localDevTitle: '6. 本地开发本仓库',
    snippets: {
      installFull: `# 安装全部组件（推荐快速试用）
pnpm add cos-design
# 或 npm install cos-design / yarn add cos-design`,
      installSingle: `# 只装需要的组件（体积更小）
pnpm add @cos-design/weather-background
pnpm add @cos-design/fireworks
pnpm add @cos-design/scratch-card`,
      basic: `import { Fireworks, ScrambleText, ScratchCard } from 'cos-design';

export default function Page() {
  return (
    <>
      <ScrambleText text="GRAND OPENING" />
      <ScratchCard prize="🎉 恭喜中奖！" />
      <Fireworks width={800} height={500} />
    </>
  );
}`,
      ssr: `import dynamic from 'next/dynamic';

const Fireworks = dynamic(
  () => import('cos-design').then((m) => m.Fireworks),
  { ssr: false }
);

// 按需包同样适用：
// const WeatherBackground = dynamic(
//   () => import('@cos-design/weather-background').then((m) => m.WeatherBackground),
//   { ssr: false }
// );`,
      localDev: `git clone https://github.com/jiaxiantao/cos-design.git
cd cos-design && npm run setup && pnpm dev
# 访问 http://localhost:4000`
    }
  },
  liveDemo: {
    editorTitle: '编辑代码 · 实时预览',
    reset: '重置',
    copy: '复制',
    copied: '已复制',
    hint: '组件已注入作用域，可直接写 JSX；修改后预览区立即更新。'
  },
  propsTable: {
    title: '配置参数',
    count: '{{value}} 项',
    desc: '以下为组件 Props，可在下方「编辑代码」中直接调整并实时预览。',
    colName: '参数',
    colType: '类型',
    colRequired: '必填',
    colDefault: '默认值',
    colDescription: '说明',
    requiredYes: '是',
    requiredNo: '否',
    empty: '—',
    typesTitle: '自定义类型',
    typesCount: '{{value}} 个',
    typesDesc: '以下为 Props 中引用的 TypeScript 自定义类型及其字段说明。'
  },
  backgroundDemo: {
    switchLabel: '示例文案',
    navComponents: '组件',
    navDocs: '文档',
    signUp: '开始使用',
    tagText: '背景动效已上线',
    primaryCta: '立即体验',
    secondaryCta: '了解更多',
    defaultHeadline: '让背景自己动起来',
    defaultSubtitle: '开箱即用的视觉背景，直接嵌进活动页与品牌页',
    headlines: {
      WeatherBackground: '把天气装进画面里',
      RippleWater: '一点涟漪，水面就活了',
      SmokeFog: '烟雾缓缓散开',
      BubbleField: '气泡从深海浮起',
      MatrixRain: '数字雨倾泻而下',
      MeteorRain: '流星划过夜空',
      ParticleNetwork: '粒子彼此相连',
      Aurora: '极光铺满夜幕',
      CyberGrid: '踏上霓虹网格',
      Snowfall: '花瓣与雪花同落',
      Starfield: '穿越无尽星野'
    },
    subtitles: {
      WeatherBackground: '雨雪晴雾一键切换，适合活动页与品牌场景',
      RippleWater: '点击激起水花，真实感水面背景',
      SmokeFog: '噪声雾气缓慢飘动，可点击驱散',
      BubbleField: '相近气泡自动融合，带水下光影',
      MatrixRain: '经典字符雨，可叠标题与副标题',
      MeteorRain: '流星拖尾划过深空',
      ParticleNetwork: '节点连线随鼠标互动',
      Aurora: '多层色带缓缓流动',
      CyberGrid: '透视网格向前延伸',
      Snowfall: '支持雪花与樱花两种模式',
      Starfield: '纵深飞行的星空穿越'
    }
  },
  categories: {
    background: {
      label: '背景动效',
      description: 'Canvas / CSS 动态背景与粒子场景'
    },
    text: {
      label: '文字动效',
      description: '标题、Banner 与终端风格文字动画'
    },
    photo: {
      label: '图片预览',
      description: '相册、走马灯、晾绳等物件隐喻式图片浏览'
    },
    interactive: {
      label: '交互玩具',
      description: '鼠标、触摸驱动的趣味交互组件'
    },
    game: {
      label: '游戏营销',
      description: '抽奖、庆祝与活动页玩法组件'
    },
    data: {
      label: '数据装饰',
      description: '大屏、仪表盘与时间数据展示'
    },
    physics: {
      label: '物理模拟',
      description: '重力、弹簧、碰撞等真实物理互动'
    },
    science: {
      label: '科学算法',
      description: '天文、混沌、细胞自动机与算法可视化'
    },
    effect: {
      label: '视觉特效',
      description: '烟花、电弧、传送门等视觉实验效果'
    }
  },
  demos: {
    clickSpark: '点击任意位置迸发火花',
    fireworksLaunch: '手动燃放',
    flipCounterHint: '数值每 2 秒自动递增',
    holographicSubtitle: '全息会员卡 · 限量编号 #001',
    liquidGlassTitle: '液态玻璃面板',
    liquidGlassDesc: 'backdrop-filter 毛玻璃效果',
    magneticButton: '磁吸按钮',
    progressChestLabel: '自动填充宝箱',
    progressChestOpened: '宝箱已开启！',
    spotlight: '移动鼠标照亮隐藏区域 ✨',
    timelineSteps: ['需求', '设计', '开发', '测试', '上线'],
    componentCopy: {
      burnAwayCompleted: '已燃尽。',
      confettiHint: '点击画布再次喷射',
      countdownLabels: {
        days: '天',
        hours: '时',
        minutes: '分',
        seconds: '秒'
      },
      countdownInvalid: '无效的目标时间',
      countdownEnded: '时间到！',
      cursorTrailHint: '移动鼠标查看粒子轨迹',
      diceRoll: '掷骰子',
      diceRolling: '掷骰中...',
      diceResult: '点数:',
      fireworksHint: '点击画布燃放烟花',
      gameOfLifeLabels: {
        generation: '演化代数',
        alive: '个存活单元',
        pause: '暂停',
        play: '继续',
        randomize: '随机生成'
      },
      networkGraphHint: '拖拽节点 · 悬停查看关联',
      particleNetworkHint: '移动鼠标或手指与粒子互动',
      photoAlbumAria: '旅行照片相册',
      photoAlbumLabels: {
        previous: '上一张照片',
        next: '下一张照片',
        empty: '暂无照片',
        flyleafTitle: '旅行相册',
        flyleafSubtitle: '把远方装进这一页',
        flyleafEndTitle: '完',
        flyleafEndSubtitle: '故事暂告一段落'
      },
      photoAlbumPhotos: [
        { title: '在路上', description: '把远方装进相册' },
        { title: '山谷晨光', description: '风从群山之间吹来' },
        { title: '湖畔', description: '安静得只听见水声' },
        { title: '林间漫步', description: '盛夏留下的绿色记忆' },
        { title: '日落时分', description: '旅程在余晖中继续' },
        { title: '山脊之上', description: '云海在脚下翻涌' },
        { title: '海边午后', description: '浪花一遍遍靠近' },
        { title: '雪峰星夜', description: '银河落进沉默的山' },
        { title: '静湖倒影', description: '天空被完整地接住' },
        { title: '远山薄雾', description: '旅途尚未到尽头' }
      ],
      photoLanternAria: '走马灯图片预览',
      photoLanternHint: '左右拖拽旋转走马灯 · 松手后带惯性，空闲时缓慢顺时针自转',
      photoLanternPhotos: [
        { title: '在路上', description: '把远方装进灯影' },
        { title: '山谷晨光', description: '风从群山之间吹来' },
        { title: '湖畔', description: '安静得只听见水声' },
        { title: '林间漫步', description: '盛夏留下的绿色记忆' },
        { title: '日落时分', description: '旅程在余晖中继续' },
        { title: '山脊之上', description: '云海在脚下翻涌' }
      ],
      photoClotheslineAria: '晾绳旅行照片墙',
      photoClotheslineHint: '抓住照片往任意方向甩 · 空白处左右拖动浏览更多',
      photoFilmstripAria: '旅行胶卷',
      photoFilmstripHint: '左右拖拽卷动胶卷 · 松手后吸附到整帧',
      photoPolaroidAria: '拍立得照片堆',
      photoPolaroidHint: '拖拽翻找拍立得 · 点击置顶 · 松手可留在桌面',
      photoLightboxAria: '灯箱透片预览',
      photoLightboxHint: '左右拖出透片切换 · 未过阈值则弹回',
      photoCarouselAria: '旋转木马照片托盘',
      photoCarouselHint: '左右拖拽旋转托盘 · 松手后带惯性 · 空闲时缓慢自转',
      photoPrismAria: '棱镜照片立方',
      photoPrismHint: '拖拽翻滚棱镜 · 松手后带惯性 · 空闲时缓慢自转',
      photoScrollAria: '卷轴照片',
      photoScrollHint: '左右拖拽展开卷轴 · 松手后带惯性并吸附到最近一帧',
      photoPostcardAria: '旅行明信片',
      photoPostcardHint: '点击翻转正反面 · 左右拖过阈值切换下一张',
      photoViewMasterAria: '观景器圆盘',
      photoViewMasterHint: '左右拖拽旋转圆盘 · 松手后带惯性 · 空闲时可缓慢自转',
      photoFridgeAria: '冰箱磁贴照片墙',
      photoFridgeHint: '拖拽照片置顶 · 松手留在原处 · 磁铁吸住不回弹',
      photoTunnelAria: '纵深照片隧道',
      photoTunnelHint: '上下拖拽穿行隧道 · 松手后带惯性并吸附到最近一帧',
      redPacketGrabbed: '已抢:',
      redPacketEnded: '红包雨结束',
      redPacketHint: '点击红包抢夺',
      rippleHint: '点击水面产生涟漪',
      sandHint: '按住鼠标绘制沙粒',
      sandClear: '清空',
      scratchPrize: '🎉 恭喜中奖！',
      scratchCover: '刮开涂层',
      slotStart: '开始',
      slotSpinning: '旋转中...',
      slotJackpot: '🎰 大奖！',
      slotResult: '结果:',
      smokeAria: '烟雾背景，点击可驱散',
      springMassHint: '拖拽网格质点，观察弹簧回弹',
      turntablePrizes: ['一等奖', '二等奖', '三等奖', '谢谢参与', '优惠券', '再来一次'],
      turntableStart: '开始抽奖',
      turntableSpinning: '抽奖中...',
      turntableResult: '恭喜获得：',
      typewriterTexts: ['Hello, cos-design!', '欢迎来到组件库 ✨', '创造有趣的体验 🚀'],
      waveButton: '点我试试'
    },
    weather: {
      liveToggle: '📍 实时天气（Open-Meteo）',
      liveToggleOffTitle: '关闭实时天气，恢复手动调节',
      liveToggleOnTitle: '按当前城市（{{city}}）开启实时天气',
      timeLabel: '🕐 时刻',
      timeAria: '调节场景时刻',
      windLabel: '💨 风速',
      windAria: '调节蒲福风级',
      windValue: '{{level}}级 {{name}}',
      rainLabel: '🌧️ 雨量',
      rainAria: '调节雨量',
      snowLabel: '❄️ 雪量',
      snowAria: '调节雪量',
      hailLabel: '🧊 雹强',
      hailAria: '调节冰雹强度',
      fogLabel: '🌫️ 雾浓',
      fogAria: '调节雾浓度',
      smogLabel: '😷 霾强',
      smogAria: '调节霾强度',
      liveHint:
        '已开启实时天气：滑块显示 {{city}} 当地时刻、风速与强度参数（只读）。关闭「实时天气」或选择上方天气类型后可手动调节。',
      statusLocating: '正在获取定位…（需授权）',
      statusFetching: '正在请求 {{city}} 实况…',
      statusSuccess: '{{city}}实况：{{weather}} · {{time}} · {{wind}}级风（{{speed}} km/h）{{extra}} · WMO {{code}}',
      statusTime: '时刻 {{time}}',
      statusDay: '☀️ 白天',
      statusNight: '🌙 夜晚',
      statusError: '获取失败：{{error}}，已回退手动选择',
      canvasAria: '天气背景：{{weather}}，{{wind}}级风',
      loading: '天气加载中…',
      summary: '{{city}} · 时刻 {{time}} · {{wind}}{{extra}} · 昼夜按当地日出日落自动判定',
      options: {
        sunny: '☀️ 大晴天',
        partlyCloudy: '⛅ 多云',
        overcast: '☁️ 阴天',
        rain: '🌧️ 雨天',
        thunderstorm: '🌩️ 雷阵雨',
        snow: '❄️ 雪天',
        sleet: '🌧️❄️ 雨夹雪',
        hail: '🧊 冰雹',
        fog: '🌫️ 雾',
        smog: '😷 霾'
      },
      cities: {
        beijing: '北京',
        shanghai: '上海',
        guangzhou: '广州',
        hangzhou: '杭州',
        chengdu: '成都',
        harbin: '哈尔滨',
        lhasa: '拉萨',
        tokyo: '东京',
        london: '伦敦',
        newYork: '纽约',
        sydney: '悉尼'
      },
      windLevels: [
        '无风',
        '软风',
        '轻风',
        '微风',
        '和风',
        '清劲风',
        '强风',
        '疾风',
        '大风',
        '烈风',
        '狂风',
        '暴风',
        '飓风'
      ],
      levels: {
        format: '{{level}} · {{label}}',
        rain: ['毛毛雨', '小雨', '中雨', '暴雨', '特大暴雨'],
        snow: ['毛毛雪', '小雪', '中雪', '暴雪', '特大暴雪'],
        hail: ['细雹', '密雹', '巨雹'],
        fog: ['薄雾', '中雾', '浓雾'],
        smog: ['轻霾', '中霾', '重霾']
      }
    }
  }
};

export default zhCN;

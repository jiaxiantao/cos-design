# WeatherBackground — Vue 3 用法（与 React 对齐）

实况天气能力与 React 入口共享同一套 **Core** 实现（`live-weather-core.ts`）。Vue 侧通过 **同名 composable** 暴露，命名与 React Hook 一致，便于双栈活动页复用逻辑。

## 安装

```bash
pnpm add @cos-design/weather-background
# 或聚合包
pnpm add cos-design
```

## 组件

```vue
<script setup lang="ts">
import { WeatherBackground } from '@cos-design/weather-background/vue';

const coords = { latitude: 31.23, longitude: 121.47 };
</script>

<template>
  <WeatherBackground
    fill
    weather="auto"
    :coords="coords"
    @live-weather="(state) => console.log(state.status)"
  />
</template>
```

| Prop / 事件 | React | Vue | 说明 |
| ----------- | ----- | --- | ---- |
| `fill` | `fill` | `fill` | 铺满父容器（需明确高度，如 `100vh`） |
| `weather` | `weather` | `weather` | 场景类型；`'auto'` / `true` 启用 Open-Meteo 实况 |
| `coords` | `coords` | `coords` | 固定经纬度；省略则浏览器定位 |
| 实况回调 | `onLiveWeather` | `@live-weather` | 状态变更（locating / fetching / success / error） |

Umbrella：`import { WeatherBackground } from 'cos-design/vue'`。

## Composable — `useLiveWeather`

与 React `useLiveWeather(enabled?, coords?)` **参数与返回值语义相同**（Vue 返回 `Ref<LiveWeatherState>`）。

```vue
<script setup lang="ts">
import { computed } from 'vue';
import {
  WeatherBackground,
  useLiveWeather,
  mapWmoCodeToWeatherType,
  type LiveWeatherCoords,
} from '@cos-design/weather-background/vue';

const coords: LiveWeatherCoords = { latitude: 22.54, longitude: 114.05 };
const live = useLiveWeather(true, coords);
const scene = computed(() => live.value.weather ?? 'partlyCloudy');
</script>

<template>
  <p v-if="live.status === 'error'">定位失败，使用默认天气</p>
  <WeatherBackground fill :weather="scene" />
</template>
```

### `LiveWeatherState`（与 React 相同）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `status` | `'idle' \| 'locating' \| 'fetching' \| 'success' \| 'error'` | 请求阶段 |
| `weather` | `WeatherType \| null` | 映射后的组件天气类型 |
| `error` | `string \| null` | 失败原因 |
| `current` | `OpenMeteoCurrent \| null` | 原始精简观测 |

## Composable — `useSunTimes`

对应 React `useSunTimes(coords?)`，返回 `Ref<DayCycleTimes | null>`，用于昼夜 / `time` 参数。

```vue
<script setup lang="ts">
import { useSunTimes } from '@cos-design/weather-background/vue';

const coords = { latitude: 39.9, longitude: 116.4 };
const sun = useSunTimes(coords);
</script>
```

## 框架无关工具（`/vue` 与 `/` React 均可按需导入）

以下从 Core 重导出，与 React 包入口一致：

- `mapWmoCodeToWeatherType`、`fetchLiveWeather`、`fetchSunTimes`
- `subscribeLiveWeather` / `subscribeSunTimes`（非 Hook，适合 Web Component 或自定义集成）
- `formatLocalHm`、`getDayCycleTimesFromLive`、`isValidCoords`

Core 直连：`import { subscribeLiveWeather } from '@cos-design/weather-background/core'`。

## 相关

- React 实况说明：[ai.md](../ai.md)（WeatherBackground 小节）
- [migration-v4.md](../migration-v4.md)
- [vue-app 示例](../../examples/vue-app)
- RFC Q3 决定：`useLiveWeather` 名称在 Vue `/vue` 与 React 保持一致

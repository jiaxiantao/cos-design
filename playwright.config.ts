import { defineConfig, devices } from '@playwright/test';

const useCiPreview = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests/smoke',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // Demo build uses base `/` (pages build uses `/cos-design/`).
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: useCiPreview
      ? 'pnpm exec vite preview --outDir dist-demo --host 127.0.0.1 --port 4173'
      : 'pnpm build:demo && pnpm exec vite preview --outDir dist-demo --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

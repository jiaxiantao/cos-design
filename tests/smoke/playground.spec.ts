import { expect, test } from '@playwright/test';

const gotoZh = async (page: import('@playwright/test').Page, hashPath: string) => {
  await page.goto(`/?lang=zh-CN#${hashPath}`);
};

/** Native click — recipe Confetti canvases can intercept Playwright pointer clicks. */
const nativeClick = async (locator: import('@playwright/test').Locator) => {
  await locator.evaluate((el: HTMLElement) => el.click());
};

test.describe('playground smoke', () => {
  test('scratch card canvas mounts', async ({ page }) => {
    await gotoZh(page, '/scratchCard');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('turntable canvas mounts', async ({ page }) => {
    await gotoZh(page, '/turntable');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('weather background fill demo mounts canvas', async ({ page }) => {
    await gotoZh(page, '/weatherBackground');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('nine grid component mounts board', async ({ page }) => {
    await gotoZh(page, '/nineGrid');
    await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
  });

  test('flip card component mounts', async ({ page }) => {
    await gotoZh(page, '/flipCard');
    await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
  });

  test('fill-hero recipe renders neon text over background', async ({ page }) => {
    await gotoZh(page, '/recipes/fill-hero');
    await expect(page.getByRole('heading', { name: 'COS DESIGN' })).toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('nine grid recipe mounts board', async ({ page }) => {
    await gotoZh(page, '/recipes/nine-grid-draw');
    await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
  });

  test('flip checkin recipe mounts card', async ({ page }) => {
    await gotoZh(page, '/recipes/flip-checkin');
    await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
  });

  test('checkin-draw recipe mounts flip then nine-grid', async ({ page }) => {
    await gotoZh(page, '/recipes/checkin-draw');
    await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
    await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
  });
});

test.describe('playground interactions', () => {
  test('flip-checkin recipe reveals card', async ({ page }) => {
    await gotoZh(page, '/recipes/flip-checkin');
    const card = page.getByRole('button', { name: /CHECK-IN/ });
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  test('nine-grid-draw recipe draws with busy state', async ({ page }) => {
    await gotoZh(page, '/recipes/nine-grid-draw');
    const drawBtn = page.getByTestId('nine-grid-draw');
    await nativeClick(drawBtn);
    await expect(drawBtn).toHaveAttribute('aria-busy', 'true');
    await expect(drawBtn).toBeDisabled();
    await expect(drawBtn).toBeEnabled({ timeout: 15_000 });
  });

  test('turntable-confetti recipe spins then shows result', async ({ page }) => {
    await gotoZh(page, '/recipes/turntable-confetti');
    const spinBtn = page.getByTestId('turntable-spin');
    await nativeClick(spinBtn);
    await expect(spinBtn).toHaveAttribute('aria-busy', 'true');
    await expect(spinBtn).toBeDisabled();
    await expect(page.getByText(/恭喜获得/)).toBeVisible({ timeout: 15_000 });
    await expect(spinBtn).toBeEnabled();
  });

  test('checkin-draw unlocks nine-grid after flip', async ({ page }) => {
    await gotoZh(page, '/recipes/checkin-draw');
    await expect(page.getByTestId('nine-grid-draw')).toBeDisabled();
    await page.getByRole('button', { name: /CHECK-IN/ }).click();
    const drawBtn = page.getByTestId('nine-grid-draw');
    await expect(drawBtn).toBeEnabled({ timeout: 5_000 });
    await nativeClick(drawBtn);
    await expect(drawBtn).toHaveAttribute('aria-busy', 'true');
    await expect(drawBtn).toBeEnabled({ timeout: 15_000 });
  });
});

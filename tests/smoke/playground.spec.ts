import { expect, test } from '@playwright/test';

const gotoZh = async (page: import('@playwright/test').Page, hashPath: string) => {
  await page.goto(`/?lang=zh-CN#${hashPath}`);
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
});

test.describe('playground interactions', () => {
  test('flip card reveal sets aria-pressed', async ({ page }) => {
    await gotoZh(page, '/flipCard');
    const card = page.getByRole('button', { name: /CHECK-IN/ });
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  test('nine grid draw enters busy then finishes', async ({ page }) => {
    await gotoZh(page, '/nineGrid');
    const drawBtn = page.getByTestId('nine-grid-draw');
    await drawBtn.click();
    await expect(drawBtn).toHaveAttribute('aria-busy', 'true');
    await expect(drawBtn).toBeDisabled();
    await expect(drawBtn).toBeEnabled({ timeout: 15_000 });
  });

  test('turntable spin shows result', async ({ page }) => {
    await gotoZh(page, '/turntable');
    const spinBtn = page.getByTestId('turntable-spin');
    await spinBtn.evaluate((el: HTMLElement) => el.click());
    await expect(spinBtn).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText(/恭喜获得/)).toBeVisible({ timeout: 15_000 });
    await expect(spinBtn).toBeEnabled();
  });
});

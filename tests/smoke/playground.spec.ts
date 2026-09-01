import { expect, test } from '@playwright/test';

const gotoZh = async (page: import('@playwright/test').Page, hashPath: string) => {
  await page.goto(`/?lang=zh-CN#${hashPath}`);
};

test.describe('playground smoke', () => {
  test('scratch card canvas mounts', async ({ page }) => {
    await gotoZh(page, '/scratchCard');
    await expect(page.getByTestId('scratch-card-canvas')).toBeVisible();
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

  test('slot machine mounts', async ({ page }) => {
    await gotoZh(page, '/slotMachine');
    await expect(page.getByTestId('slot-machine-spin')).toBeVisible();
  });

  test('confetti canvas mounts', async ({ page }) => {
    await gotoZh(page, '/confetti');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  for (const path of ['/soapBubbles', '/dandelionField', '/lavaBubble', '/inkBloom', '/auroraVeil'] as const) {
    test(`${path} canvas mounts`, async ({ page }) => {
      await gotoZh(page, path);
      await expect(page.locator('canvas').first()).toBeVisible();
    });
  }
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

  test('slot machine spin shows result', async ({ page }) => {
    await gotoZh(page, '/slotMachine');
    const spinBtn = page.getByTestId('slot-machine-spin');
    await spinBtn.click();
    await expect(spinBtn).toHaveAttribute('aria-busy', 'true');
    await expect(spinBtn).toBeEnabled({ timeout: 10_000 });
    await expect(page.locator('p').filter({ hasText: /结果:|大奖/ })).toBeVisible();
  });

  test('scratch card reveals prize after scratching', async ({ page }) => {
    await gotoZh(page, '/scratchCard');
    const canvas = page.getByTestId('scratch-card-canvas');
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    const { x, y, width, height } = box!;
    await page.mouse.move(x + 4, y + 4);
    await page.mouse.down();
    for (let row = 0; row < 8; row++) {
      const py = y + (height * (row + 0.5)) / 8;
      await page.mouse.move(x + 4, py);
      await page.mouse.move(x + width - 4, py, { steps: 12 });
    }
    await page.mouse.up();
    await expect(canvas).toHaveClass(/hidden/, { timeout: 5_000 });
  });
});

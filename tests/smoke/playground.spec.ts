import { expect, test } from '@playwright/test';

test.describe('playground smoke', () => {
  test('scratch card canvas mounts', async ({ page }) => {
    await page.goto('/#/scratchCard');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('turntable canvas mounts', async ({ page }) => {
    await page.goto('/#/turntable');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('weather background fill demo mounts canvas', async ({ page }) => {
    await page.goto('/#/weatherBackground');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('nine grid component mounts board', async ({ page }) => {
    await page.goto('/#/nineGrid');
    await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
  });

  test('flip card component mounts', async ({ page }) => {
    await page.goto('/#/flipCard');
    await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
  });

  test('fill-hero recipe renders neon text over background', async ({ page }) => {
    await page.goto('/#/recipes/fill-hero');
    await expect(page.getByRole('heading', { name: 'COS DESIGN' })).toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('nine grid recipe mounts board', async ({ page }) => {
    await page.goto('/#/recipes/nine-grid-draw');
    await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
  });

  test('flip checkin recipe mounts card', async ({ page }) => {
    await page.goto('/#/recipes/flip-checkin');
    await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
  });

  test('checkin-draw recipe mounts flip then nine-grid', async ({ page }) => {
    await page.goto('/#/recipes/checkin-draw');
    await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
    await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

const gotoZh = async (page: import('@playwright/test').Page, hashPath: string) => {
  await page.goto(`/?lang=zh-CN#${hashPath}`);
};

type FrameworkTab = 'Vue' | 'Web Components' | 'Core';

const FRAMEWORK_TABS: FrameworkTab[] = ['Vue', 'Web Components', 'Core'];

async function selectFramework(page: import('@playwright/test').Page, tab: FrameworkTab) {
  await page.getByRole('tab', { name: tab }).click();
  await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
}

type RouteCheck = {
  path: string;
  name: string;
  assert: (page: import('@playwright/test').Page) => Promise<void>;
};

const MARKETING_CRITICAL: RouteCheck[] = [
  {
    path: '/flipCard',
    name: 'FlipCard',
    assert: async (page) => {
      await expect(page.getByRole('button', { name: /CHECK-IN/ })).toBeVisible();
    },
  },
  {
    path: '/nineGrid',
    name: 'NineGrid',
    assert: async (page) => {
      await expect(page.getByRole('grid', { name: '九宫格抽奖' })).toBeVisible();
      await expect(page.getByTestId('nine-grid-draw')).toBeVisible();
    },
  },
  {
    path: '/turntable',
    name: 'Turntable',
    assert: async (page) => {
      await expect(page.getByTestId('turntable-spin')).toBeVisible();
      await expect(page.locator('canvas').first()).toBeVisible();
    },
  },
  {
    path: '/scratchCard',
    name: 'ScratchCard',
    assert: async (page) => {
      await expect(page.getByTestId('scratch-card-canvas')).toBeVisible();
    },
  },
  {
    path: '/confetti',
    name: 'Confetti',
    assert: async (page) => {
      await expect(page.locator('canvas').first()).toBeVisible();
    },
  },
  {
    path: '/auroraVeil',
    name: 'AuroraVeil',
    assert: async (page) => {
      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
    },
  },
];

test.describe('multi-framework playground smoke', () => {
  for (const tab of FRAMEWORK_TABS) {
    test.describe(tab, () => {
      for (const route of MARKETING_CRITICAL) {
        test(`${route.name} mounts (${tab})`, async ({ page }) => {
          await gotoZh(page, route.path);
          await selectFramework(page, tab);
          await route.assert(page);
        });
      }
    });
  }
});

test.describe('multi-framework lottery busy states', () => {
  test('nine grid draw on Vue tab', async ({ page }) => {
    await gotoZh(page, '/nineGrid');
    await selectFramework(page, 'Vue');
    const drawBtn = page.getByTestId('nine-grid-draw');
    await drawBtn.click();
    await expect(drawBtn).toHaveAttribute('aria-busy', 'true');
    await expect(drawBtn).toBeEnabled({ timeout: 15_000 });
  });

  test('turntable spin on Web Components tab', async ({ page }) => {
    await gotoZh(page, '/turntable');
    await selectFramework(page, 'Web Components');
    const spinBtn = page.getByTestId('turntable-spin');
    await spinBtn.evaluate((el: HTMLElement) => el.click());
    await expect(spinBtn).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText(/恭喜获得/)).toBeVisible({ timeout: 15_000 });
  });
});

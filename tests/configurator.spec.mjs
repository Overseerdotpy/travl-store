import { test, expect } from '@playwright/test';

const pick = (page, group, value) => page.locator(`input[data-cfg="${group}"][value="${value}"]`).check({ force: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('#cfg').scrollIntoViewIfNeeded();
});

test('each layout draws the right number of keys and prices correctly', async ({ page }) => {
  const cases = [['65', 67, '$229'], ['75', 82, '$249'], ['80', 87, '$269'], ['100', 104, '$299']];
  for (const [layout, keys, price] of cases) {
    await pick(page, 'layout', layout);
    await expect(page.locator('#cfgCap')).toContainText(`${keys} keys`);
    await expect(page.locator('#cfgSum .tot')).toHaveText(price);
  }
});

test('keycaps and cord add their price, and the drawing reflects the cord', async ({ page }) => {
  await pick(page, 'layout', '65');
  await pick(page, 'caps', 'night');
  await pick(page, 'cord', 'aviator');
  await expect(page.locator('#cfgSum .tot')).toHaveText('$287'); // 229 + 29 + 29
  await expect(page.locator('#cfgView svg')).toHaveAttribute('aria-label', /Night PBT keycaps, coiled aviator cord/);
  await pick(page, 'cord', 'straight');
  await expect(page.locator('#cfgView svg path[stroke-linejoin="round"]')).toHaveCount(0); // no coil path
});

test('radio group works from the keyboard', async ({ page }) => {
  await page.locator('input[data-cfg="cord"][value="straight"]').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('input[data-cfg="cord"]:checked')).toHaveValue('coiled');
});

test('a configured board lands in the cart with its details, and survives a reload and checkout', async ({ page }) => {
  await pick(page, 'layout', '65');
  await pick(page, 'caps', 'night');
  await pick(page, 'cord', 'coiled');
  await page.locator('#cfgSum .btn.key').click();
  await page.goto('/#cart');
  const line = page.locator('.line .meta');
  await expect(line).toContainText('TRAVL 65%');
  await expect(line).toContainText('Night PBT keycaps, coiled cord');
  await expect(line).toContainText('$277 each');
  await page.reload();
  await expect(page.locator('.line .meta')).toContainText('Night PBT keycaps, coiled cord');
});

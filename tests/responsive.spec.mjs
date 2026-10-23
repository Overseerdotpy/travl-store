import { test, expect } from '@playwright/test';
import { addBoard } from './helpers.mjs';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

for (const hash of ['', '#shop', '#p-board', '#p-tester', '#cart', '#login']) {
  test(`no horizontal overflow on a phone: /${hash}`, async ({ page }) => {
    if (hash === '#cart') await addBoard(page);
    await page.goto('/' + hash);
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test('no horizontal overflow on checkout or the configurator on a phone', async ({ page }) => {
  await addBoard(page);
  await page.goto('/#checkout');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.goto('/');
  await page.locator('#cfg').scrollIntoViewIfNeeded();
  await page.locator('input[data-cfg="layout"][value="100"]').check({ force: true });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

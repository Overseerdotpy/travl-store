import { test, expect } from '@playwright/test';
import { materialsGeometry } from './helpers.mjs';

const trackAt = (page) => page.locator('#hsTrack').evaluate((e) => e.style.transform);

test('the materials section pins and slides Aluminum, then Brass, then PBT', async ({ page }) => {
  await page.goto('/');
  const { top, travel } = await materialsGeometry(page);

  await page.evaluate((y) => scrollTo(0, y), top);
  await expect.poll(() => trackAt(page)).toContain('translate3d(0%');
  await expect(page.locator('.hs-tabs button[aria-current="true"]')).toHaveText('Aluminum');

  await page.evaluate((y) => scrollTo(0, y), top + travel * 0.5);
  await expect.poll(() => trackAt(page)).toContain('-33.333%');
  await expect(page.locator('.hs-tabs button[aria-current="true"]')).toHaveText('Brass');

  await page.evaluate((y) => scrollTo(0, y), top + travel);
  await expect.poll(() => trackAt(page)).toContain('-66.667%');
  await expect(page.locator('.hs-tabs button[aria-current="true"]')).toHaveText('PBT');

  // the stage stays pinned to the top of the viewport for the whole travel
  const stickTop = await page.locator('.hs-stick').evaluate((e) => Math.round(e.getBoundingClientRect().top));
  expect(stickTop).toBe(0);
});

test('tabs jump straight to each material', async ({ page }) => {
  await page.goto('/');
  const { top } = await materialsGeometry(page);
  await page.evaluate((y) => scrollTo(0, y), top);
  await page.locator('.hs-tabs button[data-i="2"]').click();
  await expect.poll(() => trackAt(page), { timeout: 6000 }).toContain('-66.667%');
  await page.locator('.hs-tabs button[data-i="1"]').click();
  await expect.poll(() => trackAt(page), { timeout: 6000 }).toContain('-33.333%');
});

test('the pin releases afterwards so the page keeps scrolling', async ({ page }) => {
  await page.goto('/');
  const { top, travel } = await materialsGeometry(page);
  await page.evaluate((y) => scrollTo(0, y), top + travel + 500);
  await page.waitForTimeout(300);
  const stickTop = await page.locator('.hs-stick').evaluate((e) => Math.round(e.getBoundingClientRect().top));
  expect(stickTop).toBeLessThan(0);
});

// Regression: at wide screens the heading grew with the window while its column stopped growing,
// so "Aluminum" overflowed its box and slid under the photo.
for (const width of [390, 1100, 1346, 1440, 1920, 2560]) {
  test(`material headings fit their column and stay clear of the photo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#hs').scrollIntoViewIfNeeded();
    const problems = await page.evaluate(() =>
      [...document.querySelectorAll('.hs-p')].flatMap((panel) => {
        const h = panel.querySelector('h3'), img = panel.querySelector('.hs-img').getBoundingClientRect();
        const range = document.createRange(); range.selectNodeContents(h);
        const text = range.getBoundingClientRect(), box = h.getBoundingClientRect();
        const out = [];
        if (text.right > box.right + 1) out.push(`${h.textContent}: text is ${Math.round(text.right - box.right)}px wider than its column`);
        const overlapsImage = text.right > img.left + 1 && text.bottom > img.top && text.top < img.bottom && img.left > text.left;
        if (overlapsImage) out.push(`${h.textContent}: runs under the photo`);
        return out;
      })
    );
    expect(problems).toEqual([]);
  });
}

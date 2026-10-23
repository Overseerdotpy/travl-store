import { test, expect } from '@playwright/test';

test('wordmark rests at 35% opacity (65% transparent) and lights up under the cursor', async ({ page }) => {
  await page.goto('/');
  const fillOpacity = await page.locator('.wm-base path').first().evaluate((e) => getComputedStyle(e).fillOpacity);
  expect(fillOpacity).toBe('0.35');

  await page.waitForTimeout(3300); // intro rise + single light sweep
  await expect(page.locator('#wm')).not.toHaveClass(/lit/);
  const box = await page.locator('#wm').boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5, { steps: 5 });
  await expect(page.locator('#wm')).toHaveClass(/lit/);
  await page.mouse.move(8, 8, { steps: 4 });
  await expect(page.locator('#wm')).not.toHaveClass(/lit/);
});

test('the subline types out and stays on one line at every width', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#sub .live')).toHaveText('Four millimeters. Press once and you’ll know.', { timeout: 8000 });
  for (const width of [360, 390, 600, 900, 1360, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const m = await page.locator('#sub .ghost').evaluate((g) => {
      const r = g.getBoundingClientRect();
      return { lines: Math.round(r.height / parseFloat(getComputedStyle(g).lineHeight)), fits: r.left >= 0 && r.right <= innerWidth };
    });
    expect(m, `width ${width}`).toEqual({ lines: 1, fits: true });
  }
});

test('the headline waits until scrolled into view, then types', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);
  await expect(page.locator('#h1type .live')).toHaveText('');
  await page.locator('#h1type').scrollIntoViewIfNeeded();
  await expect(page.locator('#h1type .live')).toHaveText('Every millimeter, felt.', { timeout: 6000 });
});

test('press and hold drives the switch to 4.0 mm and back', async ({ page }) => {
  await page.goto('/');
  await page.locator('#heroStage').scrollIntoViewIfNeeded();
  const box = await page.locator('#heroStage .hit').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator('#heroStage .roV')).toHaveText('4.0');
  await expect(page.locator('#heroStage .roS')).toHaveText('Bottomed out at 4.0 mm');
  const t = await page.locator('#heroStage video').evaluate((v) => v.currentTime);
  expect(t).toBeGreaterThan(4.5); // the clip really scrubbed, it isn't just a counter
  await page.mouse.up();
  await expect(page.locator('#heroStage .roV')).toHaveText('0.0');
});

test('progressive blur sits over the landing page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#pblur i')).toHaveCount(8);
  expect(await page.locator('#pblur').evaluate((e) => e.style.opacity)).toBe('1');
  await page.evaluate(() => scrollTo(0, 1800));
  await page.waitForTimeout(300);
  expect(await page.locator('#pblur').evaluate((e) => e.style.opacity)).toBe('1');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('typed text appears immediately, no ripple, materials stack instead of pinning', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#sub .live')).toHaveText('Four millimeters. Press once and you’ll know.');
    await expect(page.locator('#h1type .live')).toHaveText('Every millimeter, felt.');
    await expect(page.locator('#hs')).toHaveClass(/static/);
    await page.locator('.bp-copy .btn.key').first().scrollIntoViewIfNeeded();
    await page.locator('.bp-copy .btn:not(.key)').first().dispatchEvent('pointerdown', { button: 0, bubbles: true });
    await expect(page.locator('.ripple')).toHaveCount(0);
  });
});

test('button ripple spawns on press and cleans itself up', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('.bp-copy .btn.key').first();
  await btn.scrollIntoViewIfNeeded();
  await btn.evaluate((b) => b.addEventListener('click', (e) => e.preventDefault(), { capture: true }));
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(btn.locator('.ripple')).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator('.ripple')).toHaveCount(0);
});

test('typed text never outgrows the space reserved for it (the caret must not force an extra line)', async ({ page }) => {
  for (const width of [1100, 1360, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#h1type').scrollIntoViewIfNeeded();
    await expect(page.locator('#h1type .live')).toHaveText('Every millimeter, felt.', { timeout: 6000 });
    const m = await page.locator('#h1type').evaluate((h) => ({
      live: h.querySelector('.live').getBoundingClientRect().height,
      reserved: h.querySelector('.ghost').getBoundingClientRect().height,
    }));
    expect(m.live, `width ${width}`).toBeLessThanOrEqual(m.reserved + 1);
  }
});

test('has the metadata a shared link and a search result need', async ({ page }) => {
  await page.goto('/');
  expect((await page.locator('meta[name="description"]').getAttribute('content')).length).toBeGreaterThan(60);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /TRAVL/);
  await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
});

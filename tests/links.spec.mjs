import { test, expect } from '@playwright/test';

// The portfolio must not depend on anything private: every page is hosted in this repo's Pages site.
const PAGES = ['/', '/story/', '/case-study/'];

for (const path of PAGES) {
  test(`${path}: no links to claude.ai, and every on-site link resolves`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(600);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
    expect(hrefs.filter((h) => /claude\.ai/.test(h)), 'links to claude.ai').toEqual([]);

    const own = new URL(page.url()).origin;
    const targets = [...new Set(hrefs.filter((h) => h.startsWith(own)).map((h) => h.split('#')[0]))];
    for (const url of targets) {
      const res = await page.request.get(url);
      expect(res.status(), url).toBe(200);
    }
  });
}

test('the story and case study pages load and are the right pages', async ({ page }) => {
  await page.goto('/story/');
  await expect(page).toHaveTitle(/TRAVL/);
  await page.goto('/case-study/');
  await expect(page).toHaveTitle(/case study/i);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('TRAVL');
});

test('the story page links onward to the store configurator and the case study', async ({ page }) => {
  await page.goto('/story/');
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toContain('../#build');
  expect(hrefs).toContain('../case-study/');
});

test('#build opens the store and scrolls to the configurator', async ({ page }) => {
  await page.goto('/#build');
  await expect(page.locator('#cfg')).toBeInViewport({ timeout: 5000 });
  await expect(page.locator('#cfgView svg')).toBeVisible();
});

test('the home page links to the story and case study on this site', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toContain('story/');
  expect(hrefs).toContain('case-study/');
});

test('links between your own pages open in the same tab', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const newTabInternal = await page.$$eval('a[target="_blank"]', (as) => as.map((a) => a.getAttribute('href')).filter((h) => /^(\.\.\/)?(story\/|case-study\/|#build)/.test(h) || h === '../'));
    expect(newTabInternal, path).toEqual([]);
  }
});

test('no dead placeholder links (href="#") on any page', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    expect(await page.locator('a[href="#"]').count(), path).toBe(0);
  }
});

import { test, expect } from '@playwright/test';

// Regression tests for the expandable bento grid. The original bug: hovering made content jump,
// rows resize and text clip, because layout depended on the live (animating) panel sizes.

const ROWS = ['.r-a', '.r-b', '.r-c'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('.bento').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
});

const hoverPanel = async (page, rowSel, i) => {
  const b = await page.locator(`${rowSel} > .bp`).nth(i).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + 10, { steps: 3 });
  await page.waitForTimeout(1000);
};

test('hovering a panel does not move its content', async ({ page }) => {
  const probes = [['.r-b', 1, '.num'], ['.r-a', 0, '.lede'], ['.r-c', 1, '.price']];
  for (const [row, i, probe] of probes) {
    await page.locator(row).scrollIntoViewIfNeeded();
    await page.mouse.move(1357, 3);
    await page.waitForTimeout(900);
    const el = page.locator(`${row} > .bp`).nth(i).locator(probe).first();
    const before = (await el.boundingBox()).y;
    await hoverPanel(page, row, i);
    const after = (await el.boundingBox()).y;
    expect(Math.abs(after - before), `${row} panel ${i}`).toBeLessThan(0.5);
  }
});

test('a row never changes height, whichever panel is open', async ({ page }) => {
  for (const row of ROWS) {
    await page.locator(row).scrollIntoViewIfNeeded();
    const heights = new Set();
    const n = await page.locator(`${row} > .bp`).count();
    await page.mouse.move(1357, 3);
    await page.waitForTimeout(800);
    heights.add(Math.round((await page.locator(row).boundingBox()).height));
    for (let i = 0; i < n; i++) {
      await hoverPanel(page, row, i);
      heights.add(Math.round((await page.locator(row).boundingBox()).height));
    }
    expect([...heights], row).toHaveLength(1);
  }
});

test('resting the cursor on a panel edge does not flip-flop', async ({ page }) => {
  await page.locator('.r-b').scrollIntoViewIfNeeded();
  await page.mouse.move(1357, 3);
  await page.waitForTimeout(900);
  const row = await page.locator('.r-b').boundingBox();
  const p0 = await page.locator('.r-b > .bp').nth(0).boundingBox();
  await page.mouse.move(p0.x + p0.width - 2, row.y - 10);
  await page.mouse.move(p0.x + p0.width - 2, row.y + row.height / 2);
  const seen = [];
  for (let t = 0; t < 30; t++) {
    const s = await page.locator('.r-b > .bp').evaluateAll((els) => els.map((e) => (e.classList.contains('on') ? 1 : 0)).join(''));
    if (seen.at(-1) !== s) seen.push(s);
    await page.waitForTimeout(60);
  }
  expect(seen.length).toBeLessThanOrEqual(2); // at most: nothing open > one panel open
});

test('a slow sweep across a boundary switches panels exactly once', async ({ page }) => {
  await page.locator('.r-b').scrollIntoViewIfNeeded();
  await page.mouse.move(1357, 3);
  await page.waitForTimeout(900);
  const [a, b, row] = await Promise.all([0, 1].map((i) => page.locator('.r-b > .bp').nth(i).boundingBox()).concat(page.locator('.r-b').boundingBox()));
  const boundary = (a.x + a.width + b.x) / 2;
  const y = row.y + row.height * 0.55;
  await page.mouse.move(boundary - 70, row.y - 12);
  await page.mouse.move(boundary - 70, y);
  await page.waitForTimeout(500);
  const seq = [];
  for (let x = boundary - 70; x <= boundary + 70; x += 3) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(14);
    const idx = await page.locator('.r-b > .bp').evaluateAll((els) => els.findIndex((e) => e.classList.contains('on')));
    if (seq.at(-1) !== idx) seq.push(idx);
  }
  expect(seq).toEqual([0, 1]);
});

for (const width of [1100, 1360, 1920]) {
  test(`no text is clipped in any open state at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await page.locator('.bento').scrollIntoViewIfNeeded();
    const clipped = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const bad = [];
      for (const row of document.querySelectorAll('.bprow')) {
        const panels = [...row.children];
        for (let j = -1; j < panels.length; j++) {
          panels.forEach((p, i) => p.classList.toggle('on', i === j));
          await sleep(800);
          panels.forEach((p, i) => {
            const inner = p.querySelector('.bp-in');
            if (!inner) return;
            const box = p.getBoundingClientRect();
            inner.querySelectorAll('*').forEach((e) => {
              const r = e.getBoundingClientRect();
              const hidden = getComputedStyle(e).visibility === 'hidden';
              const revealed = !e.closest('.more') || j === i;
              if (r.width && !hidden && revealed && (r.right > box.right + 1 || r.bottom > box.bottom + 1)) bad.push(`${row.className} panel ${i} state ${j}: <${e.tagName.toLowerCase()}>`);
            });
          });
        }
        panels.forEach((p) => p.classList.remove('on'));
      }
      return bad;
    });
    expect(clipped).toEqual([]);
  });
}

test.describe('touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('the + toggle opens and closes a panel without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.r-b .bp-t').nth(1);
    await toggle.scrollIntoViewIfNeeded();
    await toggle.tap();
    await expect(page.locator('.r-b .bp').nth(1)).toHaveClass(/\bon\b/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.tap();
    await expect(page.locator('.r-b .bp').nth(1)).not.toHaveClass(/\bon\b/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
});

import { expect } from '@playwright/test';

export const settle = (page, ms = 700) => page.waitForTimeout(ms);

export async function addBoard(page, qty = 1) {
  await page.goto('/#p-board');
  for (let i = 1; i < qty; i++) await page.locator('[data-act="pq"][data-d="1"]').click();
  await page.locator('.buy [data-act="add"]:not([data-then])').click();
  await expect(page.locator('#cartCount')).toHaveText(String(qty));
}

export async function fillCheckout(page, email = 'ash@example.com') {
  await page.fill('#f-email', email);
  await page.fill('#f-name', 'Ash Tester');
  await page.fill('#f-addr1', '100 Main St');
  await page.fill('#f-city', 'Dallas');
  await page.selectOption('#f-state', 'TX');
  await page.fill('#f-zip', '75201');
}

export async function placeOrder(page, email) {
  await addBoard(page);
  await page.goto('/#checkout');
  await fillCheckout(page, email);
  await page.click('#placeBtn');
  await expect(page).toHaveURL(/#done$/);
}

export async function createAccount(page, { name = 'Ash Tester', email = 'ash@example.com', password = 'longenough1' } = {}) {
  await page.goto('/#login');
  await page.click('[data-act="tab"][data-t="up"]');
  await page.fill('#f-name', name);
  await page.fill('#f-email', email);
  await page.fill('#f-password', password);
  await page.click('form button[type="submit"]');
}

// Scroll position (in document pixels) where the pinned materials section begins and how far it travels.
export const materialsGeometry = (page) =>
  page.evaluate(() => {
    const hs = document.getElementById('hs');
    return { top: hs.getBoundingClientRect().top + scrollY, travel: hs.offsetHeight - innerHeight };
  });

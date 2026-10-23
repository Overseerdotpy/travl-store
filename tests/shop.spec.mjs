import { test, expect } from '@playwright/test';
import { addBoard, fillCheckout, placeOrder, createAccount } from './helpers.mjs';

test('cart totals: quantity, free shipping over $100, estimated tax', async ({ page }) => {
  await addBoard(page, 2);
  await page.goto('/#cart');
  await expect(page.locator('.summary .total dd')).toHaveText('$539.09'); // 2 x $249 + 8.25% tax, free shipping
  await page.locator('[data-act="dec"]').click();
  await expect(page.locator('.summary .total dd')).toHaveText('$269.54');
  await page.locator('[data-act="rm"]').click();
  await expect(page.getByRole('heading', { name: 'Your cart is empty.' })).toBeVisible();
});

test('checkout reports every problem, specifically, and links each to its field', async ({ page }) => {
  await addBoard(page);
  await page.goto('/#checkout');
  await page.click('#placeBtn');
  const alert = page.locator('.alert');
  await expect(alert).toContainText('6 things need fixing');
  await expect(alert).toContainText('Enter an email like name@example.com.');
  await expect(page.locator('#f-zip')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#err-zip')).toHaveText('Enter a 5-digit ZIP code.');
});

test('an expired card is rejected and a Luhn-invalid card is rejected', async ({ page }) => {
  await addBoard(page);
  await page.goto('/#checkout');
  await fillCheckout(page);
  await page.fill('#f-exp', '01/20');
  await page.fill('#f-card', '4242 4242 4242 4241');
  await page.click('#placeBtn');
  await expect(page.locator('#err-exp')).toContainText('expired');
  await expect(page.locator('#err-card')).toContainText('doesn’t look right');
});

test('placing an order clears the cart and records the order', async ({ page }) => {
  await placeOrder(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thanks, Ash.');
  await expect(page.locator('#cartCount')).toHaveText('0');
  const orders = await page.evaluate(() => JSON.parse(localStorage.getItem('travl.store.v1')).orders);
  expect(orders).toHaveLength(1);
  expect(orders[0].id).toMatch(/^TRVL-[0-9A-F]{6}$/);
  expect(orders[0].items[0]).toMatchObject({ name: 'TRAVL 75', price: 24900, qty: 1 });
});

test.describe('accounts', () => {
  test('create, sign out, reject a wrong password, sign back in, survive a reload', async ({ page }) => {
    await createAccount(page, { password: 'short' });
    await expect(page.locator('#err-password')).toHaveText('Use at least 8 characters for your password.');

    await page.fill('#f-password', 'longenough1');
    await page.click('form button[type="submit"]');
    await expect(page.locator('#acct')).toHaveText('Ash');

    // never stored in the clear
    const stored = await page.evaluate(() => localStorage.getItem('travl.store.v1'));
    expect(stored).not.toContain('longenough1');
    expect(JSON.parse(stored).accounts[0]).toMatchObject({ email: 'ash@example.com' });
    expect(JSON.parse(stored).accounts[0].hash).toMatch(/^[0-9a-f]{64}$/); // salted SHA-256

    await page.click('[data-act="signout"]');
    await page.goto('/#login');
    await page.fill('#f-email', 'ash@example.com');
    await page.fill('#f-password', 'wrongpass1');
    await page.click('form button[type="submit"]');
    await expect(page.locator('#err-password')).toContainText('don’t match');

    await page.fill('#f-password', 'longenough1');
    await page.click('form button[type="submit"]');
    await expect(page.locator('#acct')).toHaveText('Ash');
    await page.reload();
    await expect(page.locator('#acct')).toHaveText('Ash');
  });

  test('a guest order appears in the account once you sign up with the same email', async ({ page }) => {
    await placeOrder(page, 'ash@example.com');
    await createAccount(page);
    await expect(page).toHaveURL(/#account$/);
    await expect(page.locator('details.order')).toHaveCount(1);
  });

  test('an account page is not reachable signed out', async ({ page }) => {
    await page.goto('/#account');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back');
  });
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { addBoard } from './helpers.mjs';

// WCAG 2.0/2.1 A + AA via axe-core. Fails on serious or critical violations.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const routes = [
  ['home', '/', false],
  ['shop', '/#shop', false],
  ['product', '/#p-board', false],
  ['cart', '/#cart', true],
  ['checkout', '/#checkout', true],
  ['login', '/#login', false],
];

for (const scheme of ['dark', 'light']) {
  for (const [name, url, needsCart] of routes) {
    test(`axe: ${name} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      if (needsCart) await addBoard(page);
      await page.goto(url);
      await page.waitForTimeout(1500); // let typing / rise animations finish
      // A mid-fade toast ("Added to cart") is half transparent, which axe would measure as low contrast.
      await page.waitForFunction(() => !document.querySelector('#toast.show'));
      await page.waitForTimeout(400);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const blocking = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      const summary = blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(summary, `${name} ${scheme}`).toEqual([]);
    });
  }
}

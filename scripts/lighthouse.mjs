// Runs Lighthouse (mobile and desktop) against the built site and prints the four category scores
// plus the metrics behind performance. Raw reports go to .lighthouse/ (git-ignored).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const PORT = 4190;
const server = spawn('npx', ['http-server', 'dist', '-p', String(PORT), '-s', '-c-1'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
mkdirSync('.lighthouse', { recursive: true });

const pct = (x) => Math.round(x * 100);
const fmt = (a) => (a ? a.displayValue : 'n/a');
try {
  for (const formFactor of ['mobile', 'desktop']) {
    const flags = { port: chrome.port, output: 'json', logLevel: 'error' };
    const config = {
      extends: 'lighthouse:default',
      settings: formFactor === 'desktop'
        ? { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
        : { formFactor: 'mobile' },
    };
    const { lhr } = await lighthouse(`http://127.0.0.1:${PORT}/`, flags, config);
    writeFileSync(`.lighthouse/${formFactor}.json`, JSON.stringify(lhr, null, 2));
    const c = lhr.categories, a = lhr.audits;
    console.log(`\n${formFactor.toUpperCase()}  performance ${pct(c.performance.score)}  accessibility ${pct(c.accessibility.score)}  best-practices ${pct(c['best-practices'].score)}  seo ${pct(c.seo.score)}`);
    console.log(`  FCP ${fmt(a['first-contentful-paint'])} | LCP ${fmt(a['largest-contentful-paint'])} | TBT ${fmt(a['total-blocking-time'])} | CLS ${fmt(a['cumulative-layout-shift'])} | Speed Index ${fmt(a['speed-index'])} | page weight ${fmt(a['total-byte-weight'])}`);
  }
} finally {
  await chrome.kill();
  server.kill();
}

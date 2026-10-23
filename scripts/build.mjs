// Builds dist/index.html: one self-contained file (HTML + CSS + JS + images + clip + wordmark).
// No bundler on purpose: the JS sections in src/js are concatenated in filename order inside one IIFE.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p));
const text = (p) => read(p).toString('utf8');

const IMAGE_ORDER = ['intro', 'top', 'lift', 'press', 'v2', 'v3', 'v4', 'v5', 'esc', 'poster'];
const images = Object.fromEntries(
  IMAGE_ORDER.map((k) => [k, 'data:image/jpeg;base64,' + read(`assets/images/${k}.jpg`).toString('base64')])
);
const clip = read('assets/clips/press.mp4').toString('base64');
const wordmark = JSON.stringify(JSON.parse(text('assets/wordmark.json')));

const js = readdirSync(join(root, 'src/js'))
  .filter((f) => f.endsWith('.js'))
  .sort()
  .map((f) => text(`src/js/${f}`).replace(/\n$/, ''))
  .join('\n');
const app = `(function(){\n'use strict';\n${js}\n})();`;

const data =
  `<script type="application/json" id="imgs">${JSON.stringify(images)}</script>\n` +
  `<script type="application/json" id="clip">${JSON.stringify(clip)}</script>\n` +
  `<script type="application/json" id="wordmark">${wordmark}</script>`;

const html = text('src/index.html')
  .replace('{{STYLES}}', () => text('src/styles.css').replace(/\n$/, ''))
  .replace('{{DATA}}', () => data)
  .replace('{{APP}}', () => app);

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/index.html'), html);
writeFileSync(join(root, 'dist/.nojekyll'), '');
// Pages that are already complete (the scroll story, the case study) live in static/ and are copied as they are.
if (existsSync(join(root, 'static'))) cpSync(join(root, 'static'), join(root, 'dist'), { recursive: true });
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`dist/index.html  ${kb(statSync(join(root, 'dist/index.html')).size)}  (images ${kb(Buffer.byteLength(JSON.stringify(images)))}, clip ${kb(clip.length)}, css ${kb(text('src/styles.css').length)}, js ${kb(app.length)})`);

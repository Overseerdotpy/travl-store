# Design decisions

Short notes on the choices that shaped this project, including the trade-offs and the bugs that taught me something.

## 1. One self-contained file, no bundler
`npm run build` concatenates `src/js/*.js` (in filename order, inside one IIFE) and inlines the CSS, images, clip and wordmark into `dist/index.html`.
It hosts anywhere with zero configuration and the page can't have broken asset paths.
**Cost:** the page is about 1.5 MB, which is slow on a throttled mobile connection (Lighthouse mobile LCP is about 9 s). The fix is a multi-file build with lazy-loaded media (see the roadmap in the README).
**Also:** the JS files are sections of one scope, not ES modules. Converting them is on the roadmap.

## 2. The wordmark is outlines, not text
The first thing on the page has to look identical on every device and can't wait for a web font. `tools/make_wordmark.py` shapes "TRAVL" with HarfBuzz (so the A-V kerning is right) and exports one SVG path per letter, which also lets each letter animate.

## 3. Scrubbing video instead of playing it
The press interaction sets `video.currentTime` from the travel value. Normal playback encodes put keyframes seconds apart, which makes scrubbing stutter, so the clip is encoded with a keyframe every 8 frames.

## 4. The bento grid: hover from resting geometry, constant-width content, locked rows
Reported symptom: the grid "glitches when I barely hover each tab".
Measured cause (Chrome, 1360 px wide):
- content jumped when a panel opened: the stat number moved 20 px, the hero text up to 42 px and the board text 60 px, because content was re-centered as extra text appeared and paragraphs re-wrapped on every frame while widths animated;
- a row grew from 250 px to 259 px when its extra text opened, shifting everything under the cursor.

Fix:
- each panel's text is laid out at the **narrowest width it ever has**, so growing or shrinking only reveals or clips it;
- each row is sized **once** to its tallest open state and then locked;
- which panel counts as hovered is computed from the **resting** layout, never the live one, so a panel growing can't change what's under the cursor.

Regression tests in `tests/bento.spec.mjs` fail on the old build (content moved 20.3 px; row heights `[250, 259]`) and pass now.

## 5. A typing caret that can't change a line break
After the headline finished typing, the hidden caret still took up width and pushed the last word onto an unreserved third line, overlapping the paragraph below. This only showed up with the real web font, not the fallback. The caret's width and margins now sum to zero. `tests/home.spec.mjs` covers it.

## 6. Accounts and storage
State lives in `localStorage` (cart, orders, accounts). Passwords are stored as a per-account salted SHA-256 hash, never in the clear (a test checks this).
This is a **prototype**: there's no server, so it is not real authentication, and payments are simulated (a test card is prefilled and card data is never saved).
`src/js/40-storage.js` also contains an optional mirror that activates only inside Claude's artifact runtime; it's inert everywhere else. A real backend is on the roadmap.

## 7. Layout shift
Lighthouse reported a layout-shift score of 0.66: the footer sat at the top of an empty page until JavaScript rendered the content, then jumped. The empty page now reserves a viewport of height until first render. Score: 0.

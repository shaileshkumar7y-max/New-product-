# INNERWEAR V5 bug-fix patch

This is an incremental patch for the existing `shaileshkumar7y-max/New-product-` repository. It contains **no existing image files** and does not bundle the current catalogue images again.

## Confirmed root causes

1. The GitHub repository currently contains the WebP images at the repository root, but V5 HTML and data referenced `./assets/*.webp`. Those paths return 404.
2. Some product/story data used `../*.webp`, which resolves outside the GitHub Pages project.
3. The show CTA pointed to `../index.html#home`, which did not open a show experience. The full show page has been restored as `show-house.html` with separately named CSS/JS files.
4. Private Feedback links used `../private-feedback.html` from a root-level page, also resolving outside the project.
5. The npm test command expected a `tests/` directory, but the current repository has the test file flattened at its root.
6. Product and gallery image error fallback pointed to the wrong parent/assets path.

## Patch contents

- `index.html` — corrected all root-relative image and internal links.
- `data.js` — corrected all 26 catalogue items and story image paths.
- `app.js` — corrected gallery paths and broken-image fallback.
- `show-house.html`, `show-house.css`, `show-house.js` — restored full local show experience without duplicating existing poster/product images.
- `sw.js` — cache version bump, updated core routes and resilient optional pre-cache.
- `package.json` — corrected check/test scripts.
- `private-feedback.html` — removes a dead link to a non-existent `private-rate-lab/` folder.
- `v5-regression.test.mjs` — root-layout regression tests.
- `QA-REPORT.md` — exact checks and limitations.

## Upload on Android

1. Extract this ZIP.
2. Upload **only the files inside this ZIP** to the repository root.
3. Replace the existing files when GitHub asks: `index.html`, `app.js`, `data.js`, `sw.js`, `package.json`, and `private-feedback.html`.
4. Add the new files: `show-house.html`, `show-house.css`, `show-house.js`, and `v5-regression.test.mjs`.
5. Do **not** upload or delete any images. All image assets are already in your repository root.
6. Commit to `main`, then wait for the Pages workflow to complete.

Do not place any of these files inside an `assets/` folder. This patch intentionally matches your current flat repository layout.

## URLs after upload

- Main INNERWEAR V5: `https://shaileshkumar7y-max.github.io/New-product-/`
- BIG BOSS KE RANDIYA show: `https://shaileshkumar7y-max.github.io/New-product-/show-house.html`
- Private Feedback: `https://shaileshkumar7y-max.github.io/New-product-/private-feedback.html`

## Limits

All store, wheel, nominations and feedback records remain local frontend demos. There is no backend, checkout, remote account, upload, live vote or multi-device sync.

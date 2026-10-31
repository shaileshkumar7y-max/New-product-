# QA Report — THE NEW EDIT v2.0

## Checks run in the build environment

| Check | Result | Evidence |
|---|---|---|
| `node --check app.js` | PASS | No syntax errors |
| `node --check sw.js` | PASS | No syntax errors |
| `npm test` | PASS | Page, asset, feature, campaign, wheel, path and archive assertions passed |
| HTML IDs | PASS | 72 unique IDs; no duplicate IDs |
| HTML-linked static assets | PASS | No missing stylesheet, script, manifest or icon paths |
| Bundled images | PASS | 12 compressed WebP files are present |
| Legacy lab archive | PASS | `private-rate-lab/index.html`, app, styles, store, security and tests are present |
| External runtime dependencies | PASS | No external JavaScript packages; no remote font import |
| GitHub Pages path convention | PASS | Root-relative `./styles.css`, `./app.js`, `./manifest.webmanifest` and `./sw.js` |

## Test scope and limitations

- The browser automation attempt was blocked by the execution environment's browser policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). No live Android Chrome interaction test is claimed.
- The site must be uploaded to the repository before GitHub Pages deployment and real-device visual verification.
- The integration account currently has read-only effective permission on `New-product-`; this ZIP does not automatically commit or deploy changes.
- Sample product names, sizes and colours are prototype catalogue data. No real product price, SKU, stock, checkout or delivery flow is represented.
- The couples prompt game, date generator and wheels operate locally in one browser; they do not synchronise across devices.
- The size helper gives an illustrative starting estimate only. Confirm final brand sizing with actual garment measurements and a production size chart.

## Recommended post-upload device checklist

1. Open the Pages site in Android Chrome and reload after deployment.
2. Check the hero, BLXCKED, HER AFTER DARK and Art Atelier image loads.
3. Tap every bottom navigation item and open the mobile drawer.
4. Search/filter products; open quick view; add a size to the demo bag; save and remove a wishlist item.
5. Change all four wheels, spin each, add a custom option, reload and check persistence.
6. Generate date ideas for multiple filters; try couple choices and skip/next.
7. Test collection previews, art filters/lightbox, campaign tabs and fit helper validation.
8. Export and import the local JSON backup.
9. Open the preserved Private Rate Lab in a separate tab.
10. Install as a PWA and verify offline reopening after the first successful online load.

## Additional preservation verification

The nested `private-rate-lab/` archive was also checked independently:
- `npm run check` — PASS.
- `npm test` — 7/7 tests PASS, including encrypted backup round-trip, wrong-password rejection, navigation module presence, no backend SDK, PWA manifest/service worker and GitHub Pages root-path checks.

The brand-site static asset server check returned HTTP 200 for all 19 requested entry points and image files.

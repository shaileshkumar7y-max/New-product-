# Brand V3 — QA Report

## Scope
A new `brand-v3/` directory was created as an additive website. Existing root files are not modified by this package.

## Automated checks

- JavaScript syntax: `app.js` — PASS
- JavaScript syntax: `data.js` — PASS
- Product records: 12 — PASS
- BLXCKED campaign concepts: 10 — PASS
- Collaboration concepts: 12 — PASS
- Interactive wheel definitions: 4 — PASS
- Saved root image references: 12 expected masters — PASS (validated against current GitHub root tree)
- New local image crops: 9 WebP files — PASS
- Relative image paths within `brand-v3/`: PASS (local crops exist; 12 repository root master filenames are confirmed in the current root tree)

## Feature interaction coverage

The browser code implements:

1. Hero story switching.
2. Product filters (all, lace, everyday, men, signature).
3. Product sorting.
4. Search.
5. Product detail dialog and size selection.
6. Local wishlist toggles and count.
7. Local demo bag add/remove and count.
8. Four wheel modes and random selection animation.
9. Date Night Generator filters and result generation.
10. Boyfriend / Couples Gift Finder.
11. Approximate fit/size helper validation and result.
12. Image lightbox.
13. Mobile menu open/close and section links.
14. Campaign archive and collaboration ideas rendering.

## Current test run

- `npm test`: **6/6 passed**.
- `npm run check`: **passed**.
- Test coverage includes section IDs, 28 in-page anchor links, relative path inventory, catalogue data, campaign and collaboration counts, wheel definitions and interaction handler presence.
- Local static HTTP smoke test: **6/6 requests returned 200** (brand page, CSS, JS, data module, one new crop and one reused root image).
- HTML visual asset check: **15 referenced image paths present** in the merged repository fixture (9 local crops plus 6 direct HTML image references; additional product images are checked through data tests).
- A full live Android visual run is not claimed; deploy the folder and test on the actual Pages URL.

## Important not-yet-verified items

- Real Android Chrome visual/device interaction needs to be checked after the folder is uploaded to GitHub Pages.
- Real online shopping, checkout, payments, stock, delivery, bookings, authentication and cross-device sync are intentionally not included (no backend / zero budget).
- The three historical wheel source implementations were not present in the current repository. The four wheels here are working front-end recreations, not verified exact copies of the old versions.
- The 9 new WebP assets are crops made from prior image masters, not nine additional original photos.
- The saved sepia figure-study moodboard is intentionally not displayed in the public-facing gallery in this release; Art Atelier uses non-explicit fashion and poster visuals.
- Additional original AI images could not be generated in this release due to the image tool's daily generation limit.

## Upload safety

This package is additive. It contains only the new `brand-v3/` folder and its new files. It does not contain replacement root `index.html`, root `app.js`, root `styles.css`, root manifest, or replacements for the old 12 WebP images.

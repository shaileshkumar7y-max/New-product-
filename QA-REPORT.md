# QA report — V5 image-path repair

## Confirmed fixes

- Root asset layout matched against current GitHub tree: 52 WebP images are already at repository root.
- Corrected static images, gallery/lightbox images, product-card/detail data and dynamic poster carousel paths.
- Reconnected Show House and Private Feedback routes.
- Removed the dead `private-rate-lab/` feedback footer link.
- Updated Service Worker cache version and core routes.
- Corrected package test/check scripts.

## Automated results

- JavaScript syntax checks: PASS (main app, data module, restored show script).
- Regression tests: 7/7 PASS.
- Product catalogue: 26/26 entries have valid image and detail paths.
- Static page routes: 12/12 return HTTP 200 in local flat-root preview.
- Image paths referenced by HTML/data/scripts: 49/49 return HTTP 200 in local flat-root preview.
- Existing WebP assets: 52/52 passed image-file integrity verification.
- Duplicate/missing direct DOM IDs: none found in main or show page.
- ZIP image entries: 0 (intentionally, to avoid re-uploading existing images).

## Not verified

The environment blocked Chromium page navigation, so no claim is made about real Android Chrome visual rendering. After upload, inspect the live page once on the phone.

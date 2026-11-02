# NAKED CANVAS — Phase 3 completion report

**Phase:** 3 of 7 — AI Creator
**Build:** Phase 3.1 Creator hardening
**Date:** 02 November 2026
**Result:** Creator feature and static QA completed; live provider/device QA remains outstanding.

## What changed

The existing Phase 2 gallery, collection filters, artwork viewer, pose atlas, local favourites, theme and age acknowledgement are preserved. The AI Creator now supports six art-direction presets, live official image-model discovery, OAuth PKCE/BYOP connection, optional gallery reference images, optional seed, manual retry, cancellation, timeout feedback, generated-image preview/download, and a local My Studio shelf.

### Reference images

- 4 museum artwork image references from the current ArtFlip starter collection.
- 32 standard Shisei pose-angle images covering the eight pose sets already in the gallery.
- All 36 image references are selectable in AI Creator. All source paths were verified against their GitHub repository trees on 02 November 2026.
- The reference URL is sent only when the selected live image model advertises image-input support. These are source-hosted links; the ZIP does not repackage the source binaries.

The full ArtFlip archive (6,051 artwork images and thumbnails) is not bundled. Phase 1 identified its source repository at approximately 1.4 GB; mass-copying it would be unnecessary, heavy and unsafe from a rights/provenance perspective. The current gallery uses the individually documented public-domain museum records. Phase 4 will expand the collection in a curated way.

## Security and cost

The app includes no developer secret key and no backend. Users must register their own public Pollinations App Key, complete OAuth PKCE consent, and authorize a Pollen cap/expiry. The returned token is stored in sessionStorage and expires according to the provider response. The current Pollinations documentation says a `pk_` value is an OAuth client ID, not a generation credential; a user-authorized key is required for generation. Generation is not promised to be free.

Saved shelf records contain image URLs and prompt text only (up to 12 records) in browser localStorage. The app does not save image bytes to the project or sync across devices. Users should download any output they want to retain permanently.

## Validation performed

- `node --check app.js` — pass.
- `node --check creator.js` — pass.
- HTML parsed successfully.
- 88 unique HTML IDs; zero duplicate IDs.
- All static JavaScript ID references exist in the HTML.
- Shisei reference paths: 32/32 exist.
- ArtFlip image/thumbnail/metadata paths: 12/12 exist for the four starter records.

## Not claimed as tested

No Pollinations account/App Key was supplied, so OAuth consent, token exchange, actual generation, image reference calls, billing and downloaded outputs were not live-tested. Physical Android device testing, accessibility and GitHub Pages deployment smoke tests remain pending.

## Seven-phase tracker

1. Phase 1 — repository/source/rights audit: complete.
2. Phase 2 — gallery merge: complete; 4 artwork records + 8 pose sets.
3. Phase 3 — AI Creator: implementation + static validation complete; live integration QA pending.
4. Phase 4 — wider collections: next; curated classical art, figure studies, outfit/portrait references.
5. Phase 5 — brand and Hinglish voice.
6. Phase 6 — Android mobile/performance/PWA.
7. Phase 7 — security, accessibility, deployment and final QA.

No existing source repo was modified by this ZIP build.

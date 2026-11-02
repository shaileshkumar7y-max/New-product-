# Phase 2 QA Report

**Status:** Local static checks prepared; real browser/Android network validation remains outstanding.

## Implemented and statically checked

- [x] Artwork data schema includes id, title, artist, date, medium, category, image, thumbnail, museum, source URL, rights note and tags.
- [x] Pose data schema includes id, category, description and up to five angle paths.
- [x] Search and category filters are wired to render functions.
- [x] Artwork modal previous/next controls and Escape/arrow keyboard controls are wired.
- [x] Pose angle buttons disable unavailable views for each pose; selected sample includes multiple poses with different missing-angle patterns.
- [x] Favourites persist in localStorage and render in the saved shelf.
- [x] Age acknowledgement and theme preference use localStorage with fallback handling.
- [x] Image errors do not crash the gallery; Met image fallback URLs are configured for three Met artworks.
- [x] Artwork museum links and rights notes appear in the detail viewer.
- [x] No external framework or runtime backend is required.

## Commands to run

```bash
node --check app.js
python -m http.server 8000
```

## Checks completed in this environment

- [x] `node --check app.js` passes.
- [x] Python HTML parser accepts `index.html`; no duplicate IDs found.
- [x] All statically referenced JavaScript element IDs exist in `index.html`.
- [x] All four ArtFlip artwork image/thumbnail paths and the eight selected Shisei pose IDs were confirmed in their repository trees.

## Not yet verified in this environment

- [ ] Live image load from `raw.githubusercontent.com` and the museum image host.
- [ ] Browser automation: headless Chromium timed out even on a blank page in this container, so browser rendering/interaction is not claimed as tested.
- [ ] Tap, swipe and keyboard feel on a physical Android device.
- [ ] Screen-reader review and full WCAG contrast audit.
- [ ] GitHub Pages deployment smoke test.
- [ ] Automated broken-image checks against all remote source URLs.

## Known limitations

1. Starter sample only: 4 artworks and 8 general pose sets; this is not a full catalogue import.
2. Artwork/pose image files remain on third-party hosts; no local binary copy is included.
3. `localStorage` favourites are device/browser-local and are not synced.
4. AI generation, outfit/portrait references and content moderation beyond the 18+ acknowledgement belong to later phases.
5. A simple 18+ confirmation screen is not identity or age verification.

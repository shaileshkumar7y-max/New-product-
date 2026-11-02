# Android upload guide — Phase 3

1. Download `NAKED_CANVAS_PHASE_3_AI_CREATOR_HARDENED.zip` and extract it on your phone.
2. Open the extracted `naked-canvas-phase3` folder. `index.html`, `styles.css`, `app.js` and `creator.js` are at that folder's root.
3. Before replacing anything in GitHub, make a backup of the current Naked Canvas repository/branch. Do not upload this package to an unrelated project.
4. In the correct Naked Canvas repository, upload the contents of `naked-canvas-phase3` into the same published root folder as the existing `index.html` (not as a new nested folder). This package replaces the Phase 2 `index.html`, `styles.css` and `app.js`, and adds/replaces `creator.js` plus the markdown/CSV documentation.
5. Keep `.nojekyll` at the published root.
6. Check GitHub Pages is publishing the correct branch and folder. Open the published HTTPS URL.
7. Test Gallery, Pose Atlas, AI Creator, saved favourites and theme first. For image generation, configure a Pollinations App Key with this exact URL as its redirect URI and only approve a small budget.

**Important:** this package does not contain the third-party image binaries. Its artwork and pose-image links load from ArtFlip and Shisei source hosts; the CSV inventory documents every image reference used by the current gallery/Creator.

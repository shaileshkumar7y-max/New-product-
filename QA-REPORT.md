# V4 QA report

## Build scope
- New additive folder only; existing repository root files and images are referenced but not changed.
- All previous root WebP files use `../` paths when referenced from `/brand-v4/`.
- All new V4 master/crop images reside in `assets/` and use `./assets/` paths.
- Old Private Rate Lab preserved under `private-rate-lab/`.
- New 18+ text-only feedback page uses sessionStorage only; no upload or network calls.

## Test evidence
- Local HTTP smoke test: **55/55** page, script, stylesheet, restored-lab and image requests returned HTTP 200 against a fixture matching the repository root image inventory.
- JavaScript syntax checks: app.js, data.js, feedback.js — run before package.
- Catalogue data: 26 entries after expansion.
- Visual library: 16 distinct master files in the interactive gallery.
- New image files: 29 total (16 masters + 13 detail derivatives).
- All HTML/CSS/JS/module/image URLs are checked against the extracted local folder and repository-root image fixture.
- HTML section IDs and local navigation are checked.
- Feedback tests cover age gate, local session persistence, export and clear controls by source-level/static assertions; a real Android browser run remains pending.

## Not claimed
- No live multi-user rating/reviewer network.
- No image upload, remote storage, authentication, payment or checkout.
- No verified stock/prices/sizes beyond concept placeholders.
- No real Android Chrome test until the user uploads the additive folder and opens the live Pages route.

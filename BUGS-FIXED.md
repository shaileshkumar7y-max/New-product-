# Confirmed V5 issues fixed

- Repointed 40+ static and dynamic image references from missing `assets/` paths to repository-root image files.
- Normalised all data-layer image references so 26 product cards and their detail views use the correct project root.
- Corrected artwork lightbox URLs and the fallback placeholder path.
- Replaced broken parent-directory navigation with root-relative `show-house.html` and `private-feedback.html` routes.
- Restored the full show page with its own stylesheet and script; reused the already-uploaded show posters and campaign images.
- Bumped Service Worker cache and added show/feedback routes; an optional cached asset failing no longer blocks Service Worker installation.
- Fixed the test command for the repository's actual flattened file layout.

No existing image asset is included in this patch ZIP.

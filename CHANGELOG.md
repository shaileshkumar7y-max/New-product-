# Changelog

## v2.0 — Brand Studio merge

- Replaced the top-level Private Rate Lab landing screen with a multi-collection brand studio.
- Added BLXCKED shop catalogue, product quick-view, sample size/colour selection, local wishlist and demo bag.
- Added HER AFTER DARK campaign stories for the After Dark, Silk Morning, Golden Reflection and Lace edits.
- Added Art Atelier gallery with filters and image lightbox.
- Added Royal Sanskari, Noor Edit, Grace Edit, Grace & Light and Noor Evening previews.
- Added Boyfriend & Couples section and local couples prompt game.
- Added four working local wheels: Style, Date, Mood and Surprise.
- Added Date Night Generator and Wellness & Size Guide.
- Added Campaign Lookbook with 10 BLXCKED campaign concepts, 12 collaboration concepts and 10 romance-poster titles.
- Added mobile bottom navigation, accessible labels, dialogs, responsive layouts and reduced-motion support.
- Compressed 12 recovered Library campaign images to WebP for faster loading.
- Preserved the previous Private Rate Lab in `private-rate-lab/` instead of deleting its app files.
- Added root-level GitHub Pages paths, new manifest and a versioned Service Worker cache.

## Known limitations

- Prior brand-site repositories `New-brand-v1` and `Brand-website-v2` could not be read through the connected GitHub account during this update. Therefore, this release re-implements the recovered requirements and saved assets; it is not a byte-for-byte merge of inaccessible repositories.
- The exact original three wheel source implementations could not be recovered from the current `New-product-` repository. This release provides three fully working wheel experiences plus the new Surprise Wheel. If the older wheel logic had different labels/segments, those can be mapped into this wheel engine once the old source is available.
- Direct GitHub commit is not included. The connected GitHub integration previously returned 403 for writes; this ZIP must be uploaded by the repository owner.

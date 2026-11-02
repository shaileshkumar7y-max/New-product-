# Phase 3 QA Report — AI Creator

**Status:** Creator implementation and static checks complete. Live Pollinations authorization, model generation and physical Android testing remain release gates.

## Implemented in this update

- [x] AI Creator navigation and prompt-builder preserved from the previous Phase 3 build.
- [x] Six fine-art prompt presets with medium, pose, lighting, palette and editable direction.
- [x] Gallery reference chooser includes all existing image entries: 4 ArtFlip artworks and 32 Shisei pose-angle views.
- [x] Artwork and pose image URLs are retained as source-hosted references; no unlicensed image repository was copied.
- [x] Live model catalogue parsing accepts array, `data` or `models` response shapes, prefers canonical IDs, and can restore model aliases.
- [x] Image-input capability is read from live catalogue metadata. The app blocks a reference-image request when the selected model does not advertise image input.
- [x] Optional seed input is validated as an integer in the unsigned 32-bit range and omitted when blank; model support/reproducibility is provider-controlled.
- [x] Pollinations BYOP OAuth authorization-code flow uses PKCE S256 and provider discovery metadata.
- [x] OAuth `expires_in` is required; the application no longer invents a seven-day token lifetime if expiry is absent. Expired or invalid tokens are removed from tab session storage.
- [x] Generated output preview, open-full-size and download actions.
- [x] Manual retry, user cancellation and 180-second client timeout. Cancelled requests are explicitly not assumed to be free; user is told to check provider usage before retrying.
- [x] My Studio saves up to 12 generated image URLs, prompt text, model, optional seed and date in browser localStorage. Remove/clear and copy-prompt actions are wired.
- [x] Storage-blocked/full handling, 401 reconnect hint, 402 budget/balance hint and 429 retry-later hint.
- [x] No developer secret key, account token or App Key is embedded in source files.
- [x] No server/backend, framework or paid hosting dependency added.

## Static validation completed

- [x] `node --check app.js` passes.
- [x] `node --check creator.js` passes.
- [x] HTML parser accepted `index.html`.
- [x] No duplicate HTML IDs found (88 unique IDs).
- [x] All statically referenced JavaScript element IDs exist in the HTML.
- [x] New reference, seed, cancel/retry, save and shelf controls are present in the document.
- [x] Source tree verification: all 32 Shisei pose-angle image paths exist in `wquguru/shisei`; all 12 image/thumbnail/metadata paths for the four ArtFlip records exist in `lewdry/artflip` (checked 02 November 2026). `IMAGE_REFERENCE_INVENTORY.csv` lists the 40 displayed/source image URLs.
- [x] The source remains static HTML/CSS/JS; `app.js` and `creator.js` are both loaded by the page.

## Not verified (must test after HTTPS publish)

- [ ] Register the exact page URL as an allowed Pollinations App Key redirect URI.
- [ ] Complete live OAuth consent and token exchange on the final GitHub Pages URL.
- [ ] Verify the live `/image/models?source=official` JSON schema and image-input metadata in Android Chrome.
- [ ] Generate an image with a user-authorized Pollen budget; confirm actual per-model price and provider usage.
- [ ] Test a reference-image generation with a model that advertises image input.
- [ ] Test seed reproducibility on a model that honours the seed parameter.
- [ ] Test cancel, timeout, manual retry and provider error handling. Check whether a cancelled request incurred provider usage.
- [ ] Verify output URL, direct download and Android browser “open full size” fallback.
- [ ] Test My Studio localStorage, remove/clear, and link expiry behaviour.
- [ ] Physical Android viewport, touch targets, screen reader and full keyboard/accessibility review.
- [ ] Chromium headless render did not complete in the build container (timeout); verify the full visual render in Android Chrome after upload.
- [ ] GitHub Pages deployment and image-loading smoke test.

## Known limitations

1. The current gallery still contains 4 ArtFlip artworks and 8 Shisei pose sets. Phase 4 is the planned wider collection expansion. This Phase 3 reference picker exposes every image already present in those collections, not every image in the full source repositories.
2. ArtFlip contains a very large image archive; the complete repository is not copied. Only individually documented public-domain records are referenced. Verify each museum record before commercial redistribution or reuse.
3. RuiC-PoseAtlas image data is not redistributed; its image licence is separate from its MIT code licence.
4. The image binary is not stored by My Studio. It saves a provider-hosted URL and prompt; download results to preserve a durable copy.
5. A basic client-side phrase check is not a moderation system and can be bypassed. Provider terms and model-specific moderation still apply.
6. An 18+ acknowledgement is not identity verification. Keep the gallery non-explicit and educational/classical in presentation.
7. No Pollinations App Key/account was supplied, so no real API generation was made and no cost claim is made.

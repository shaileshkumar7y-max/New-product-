# Naked Canvas — Phase 3 Creator Build

A lightweight, Android-first static fine-art gallery with a new AI Creator studio. This update preserves the Phase 2 artwork gallery, pose atlas, favourites and theme controls, then adds a prompt builder and optional Pollinations image generation connection.

## What is included

### Gallery (preserved from Phase 2)
- Artwork grid with title, artist, date, medium and museum source.
- Artwork search and category filters.
- Artwork viewer with previous/next controls, metadata and official museum-record link.
- Pose atlas with search, category filters and a five-angle viewer.
- Browser-local favourites, 18+ acknowledgement, light/dark theme and keyboard shortcuts.

### AI Creator (new in Phase 3)
- Fine-art prompt builder with six presets: academic figure study, draped classical study, gesture drawing, portrait, sculpture study and adult duo composition.
- Controls for medium, pose/composition, lighting, palette and output size.
- Editable final prompt, copy-to-clipboard and inspiration shuffle.
- Optional visual reference input from every image already integrated in the gallery: 4 museum artworks plus all 32 available Shisei pose-angle views. Source-hosted images are selected from a dropdown and are not copied as binaries into the ZIP.
- The live model catalogue is loaded on page open; selected models are checked for advertised image-input capability before a reference is sent.
- Optional Pollinations sign-in using OAuth authorization-code + PKCE (Bring Your Own Pollen / BYOP).
- User-selected budget cap and key expiry are passed to the Pollinations consent screen; the token expiry returned by OAuth is enforced rather than guessed.
- Optional numeric seed for repeatable variations on models that honour the seed parameter.
- Generated image preview, open-full-size and download actions, manual retry, cancel/timeout handling, and error-status feedback.
- “My Studio” local shelf stores up to 12 generated image links with model, prompt and save date. It stores links and prompt text only, not the image binary; download an image to keep a permanent copy.
- Adult-only, non-explicit fine-art framing and basic prompt checks against minor/explicit/coercive terms. This is not a moderation system.
- No application backend, no server-held credentials, no framework or build tooling.

## Important: AI generation is not automatically free

Pollinations requires an authorized generation key for current API requests. New browser apps should use its BYOP flow: register a publishable App Key (`pk_...`), let the user approve a scoped key, then send generation calls with that temporary user-authorized key. A `pk_` value identifies the app; it is **not** itself a generation credential.

The user chooses the maximum Pollen budget and expiry in Pollinations' own consent screen. Actual image cost depends on the selected model and its current pricing. Check the live [image model catalogue](https://gen.pollinations.ai/image/models) and your Pollinations balance before generating. This project does not promise a free quota or guarantee a zero-cost image.

### Connect Pollinations on the published site

1. Publish this static folder on an HTTPS host (for example, GitHub Pages). OAuth will not work from a `file://` URL.
2. Open the site and go to **AI Creator**. Tap **Copy this page’s redirect URL**.
3. Sign in to [Pollinations App Keys](https://enter.pollinations.ai/keys), create an App Key for this web app, and add the exact copied redirect URL to that app's allowed redirect URLs. Enable BYOP / user authorization for the app.
4. Copy the resulting public `pk_...` App Key into the Creator and choose a budget cap and expiry.
5. Tap **Connect Pollinations**. Review the Pollinations consent screen carefully and approve only the budget/model permissions you are comfortable with.
6. Return to the Creator. Choose an available model, review the prompt, then generate.

The redirect URL is tied to the published site path. When moving the site to a different domain or path, update the App Key's registered redirect URL.

## Credential and privacy handling

- The public App Key (`pk_...`) is stored in this browser's `localStorage` so it does not need to be re-entered every visit. It is an OAuth client identifier, not a spend credential.
- The scoped user-authorized access token is stored in `sessionStorage` only, for the current browser tab session. It is not written into the source code, ZIP, `localStorage`, or any app server.
- Disconnect removes the tab's stored access token. The user can also revoke/edit approved keys from their Pollinations account.
- The prompt and image request go directly from the browser to Pollinations. Do not enter personal or confidential information into prompts.
- Generated images are not uploaded to this project or persisted by its app code. They are displayed from the returned URL or in-memory image blob.
- This is a static client-side design, not a security boundary. Anyone who can use a device/browser session should be able to access its currently connected session. Disconnect when finished on a shared device.

## Content scope

The Creator is framed for clearly adult, non-explicit academic and classical fine art. It includes a basic client-side prompt check for references to minors and explicit sexual activity, but that check is not a moderation system and can be bypassed. Pollinations and individual model policies/moderation still apply. Do not use this app to generate sexual content involving minors or explicit sexual imagery.

## Run locally

No build tooling is needed.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. Gallery and prompt-building features can be explored locally. Pollinations OAuth requires a valid registered redirect URI; a public HTTPS deployment is the intended connection flow.

## GitHub Pages deployment

Upload all files in this folder to the root of a repository and select **Settings → Pages → Deploy from a branch → main / root**. This folder is standalone and does not change any existing project repository. Register the final Pages URL as the Pollinations App Key redirect URI after deployment.

## Current known limits

- The gallery still contains 4 ArtFlip artwork records and 8 Shisei pose sets. The Creator can use all 4 artwork images and all 32 available pose-angle image views as reference inputs. The 40 current gallery image URLs (4 full-size artwork files, 4 thumbnails, 32 pose-angle files) are listed in `IMAGE_REFERENCE_INVENTORY.csv`. The full source repositories are not imported.
- Source gallery images are remote references; the ZIP does not bundle third-party image binaries. Their availability depends on the source hosts.
- AI generation requires the user to create/configure a Pollinations App Key, complete OAuth BYOP consent and approve their own budget. No developer key or user token is included. Image generation is not guaranteed free.
- The My Studio shelf stores hosted URLs and prompts locally; remote links may expire or disappear. Download outputs you want to keep.
- The real OAuth, model catalogue and generation calls were not live-tested from this container. Browser CORS, account balance, moderation, region/model availability and provider behaviour must be verified on the published HTTPS site.
- JavaScript syntax and static HTML/ID checks pass. Chromium headless did not complete in this container (timeout), so a full browser render and physical Android tap/scroll test remain outstanding.
- An 18+ self-acknowledgement is not identity or age verification.

## Smoke checks

```bash
node --check app.js
node --check creator.js
python -m http.server 8000
```

See `PHASE_2_QA.md` and `PHASE_3_QA.md` for performed checks and remaining manual tests. See `PHASE_3_CREATOR_SETUP.md` for the Pollinations setup checklist.

## Phase 3.1 — Creator hardening details

- Gallery references are sourced only from the four ArtFlip museum records and the 32 Shisei pose-angle paths already documented in `SOURCES_AND_LICENCES.md`. All 32 Shisei paths and all 12 ArtFlip image/thumbnail/metadata paths were checked against their source repository trees on 02 November 2026.
- Reference URLs are sent only when the selected model advertises image input in its live model metadata. The request uses Pollinations’ documented `image` input field.
- The Creator supports optional `seed`, manual retry, user cancel and a 180-second client timeout. A cancelled request may already have reached the provider; check provider usage before retrying.
- OAuth token expiry must be supplied by the provider and is not replaced with a guessed duration.
- Generated media links and prompts can be saved locally (maximum 12 entries). This is not a binary backup or cloud sync.

See `PHASE_3_QA.md` for the exact validation completed and outstanding manual tests.

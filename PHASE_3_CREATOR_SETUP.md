# Phase 3 — AI Creator setup checklist

## Before connecting

- [ ] Publish the static site over HTTPS.
- [ ] Open **AI Creator** and copy the exact redirect URL shown by the page.
- [ ] In Pollinations, create an App Key and register that exact redirect URL.
- [ ] Check the current Pollinations image-model catalogue and account balance. Do not assume a model or generation is free.
- [ ] The public `pk_...` key is only the OAuth client ID; new browser apps need the user-authorized `sk_...` token returned by BYOP.

## Connect

- [ ] Enter the publishable `pk_...` App Key.
- [ ] Set a conservative Pollen cap and short expiry.
- [ ] Tap **Connect Pollinations** and review the Pollinations consent screen.
- [ ] Return to the site and check that the connection status is shown.
- [ ] Choose a model from the live catalogue and review its supported image inputs/pricing.
- [ ] Optional: choose a gallery reference image. The app sends it only when the chosen model advertises image input.
- [ ] Optional: enter a whole-number seed. Only models that honour seed will use it consistently.
- [ ] Review the final prompt and tap **Generate artwork**.
- [ ] Verify preview, open-full-size, download and **Save to studio**.
- [ ] Test cancel and manual retry. Check provider usage before repeating a cancelled request.
- [ ] Disconnect and verify generation becomes disabled.

## Images and saved outputs

- The Creator reference selector exposes the 4 artwork images and all 32 available pose-angle views already included by Phase 2.
- Museum artwork and Shisei pose images are source-hosted; the ZIP does not include copies of their binary files. Keep source/rights details in `SOURCES_AND_LICENCES.md`.
- “My Studio” stores up to 12 result URLs and prompt details in this browser only. It does not save image bytes or sync to another device. Download images you want to keep permanently.

## Security expectations

- The app must never contain a developer `sk_...` secret key.
- The `pk_...` App Key is a public OAuth client identifier and may be stored locally.
- The user-authorized access token is stored in tab `sessionStorage`, not in source files or localStorage. Its provider-supplied expiry is enforced.
- The exact redirect URL must be registered with Pollinations; update it after any domain/path change.
- The user chooses a budget cap and expiry. Actual usage is governed by Pollinations and the selected model's current price.
- Prompts and selected reference-image URLs are sent directly from the browser to Pollinations. Do not enter private or confidential information.

## Phase 3 limitation

Live OAuth, token exchange, model catalogue, real generation, image-input calls and physical Android tests are not verified in this package because no Pollinations account/App Key was supplied and no authorized spending was requested. Do not mark this Creator production-verified until those tests are completed.

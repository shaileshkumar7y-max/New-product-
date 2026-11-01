# INNERWEAR — THE NEW EDIT V5

A single, frontend-only hub that brings the saved INNERWEAR brand worlds and the existing BIG BOSS KE RANDIYA show together.

## What is included
- INNERWEAR umbrella homepage and world navigation.
- BLXCKED / HER AFTER DARK / ART ATELIER / Royal Sanskari / Noor Edit / Grace Edit / Couples Studio.
- 26 concept catalogue entries with working search, brand filters, sorting, quick view, local wishlist and local demo bag.
- 10 saved BLXCKED campaign directions and 12 collaboration concepts.
- Art Atelier gallery with lightbox.
- Date Night Generator and Boyfriend Gift Finder.
- Installable PWA with offline app-shell caching and runtime image caching.
- Four interactive wheels with custom local options.
- Wellness and approximate size helper.
- Big Boss Ke Randiya launch panel linking to the existing show page and private feedback page.
- Local-only, no backend, no checkout and no remote user data.

## Upload to GitHub Pages
This is an additive folder. Extract the ZIP, then upload the whole `innerwear-v5/` folder to the root of `New-product-` without replacing any existing root files or folders.

Open:
`https://shaileshkumar7y-max.github.io/New-product-/innerwear-v5/`

The show itself remains at the current root URL:
`https://shaileshkumar7y-max.github.io/New-product-/`

Private feedback remains at:
`https://shaileshkumar7y-max.github.io/New-product-/private-feedback.html`

## Local development
From this folder:
```bash
npm test
npm run check
python3 -m http.server 8000
```
Open `http://localhost:8000/`. The service worker needs localhost or HTTPS.

## Important limitations
This is a concept frontend. It does not process orders, payments, inventory, shipping, account logins, bookings, real votes or multi-device game sessions. The bag and wishlist are stored only in this browser. Size helper is a rough starting point only. The show and private feedback links point to the current repository pages. The adult-only pages use a self-attestation gate and do not verify legal age.

# THE NEW EDIT — Brand V3 (frontend-only)

This is a **new, additive folder** for the existing `shaileshkumar7y-max/New-product-` repository. It does not replace or delete the existing root files, Private Rate Lab, or the 12 original root-level WebP campaign images.

## Where it runs
After uploading this `brand-v3/` folder into the repository root, open:

`https://shaileshkumar7y-max.github.io/New-product-/brand-v3/`

The original root homepage remains unchanged. Existing root image masters are referenced with `../filename.webp`; nine new focused WebP detail crops are stored in `brand-v3/assets/`.

## Included experiences

- Multi-brand home with 3-story hero and world navigation.
- BLXCKED concept storefront with 12 concept products, filters, sorting, product detail dialog, size selection, local wishlist and local demo bag.
- HER AFTER DARK editorial stories including Silk Morning and Golden Reflection.
- Art Atelier creative section with fashion/runway and poster studies plus clearly labelled pending artwork slots.
- Grace Edit, Noor Edit, Royal Sanskari and Christian-inspired Coming Soon collection previews.
- Boyfriend / Couples Gift Finder.
- Four local interactive wheels: Style, Mood, Date Night and Surprise.
- Date Night Generator with vibe, time and budget controls.
- Wellness & Size Guide with an approximate measurement helper and fit notes.
- Ten BLXCKED campaign directions and twelve collaboration ideas.
- Mobile navigation, search, image lightbox, responsive product grid and reduced-motion support.

## Local-only boundaries

- No backend, login, payment, inventory, shipping, online order creation or actual booking service is connected.
- Bag and wishlist are saved locally in this browser with `localStorage`.
- Prices and real stock are not invented; the catalog is marked as a concept preview.
- Gift Finder, wheels and date-night ideas are local suggestion tools.
- Size helper gives only a rough starting point; actual fit varies by brand, style and body. It is not medical or professional fitting advice.
- Images are the saved project assets and derivative crops from those masters. These crops are **not** new original photography.
- New AI campaign imagery could not be generated during this release because the image-generation daily limit was reached. Additional original imagery remains a follow-up asset task.

## Deployment / upload (Android friendly)

1. Extract the ZIP.
2. In the existing GitHub repository, choose **Add file → Upload files**.
3. Upload the single `brand-v3/` folder into the repository root. Preserve its inner `assets/` folder.
4. Do not replace or delete existing root files. This release is additive.
5. Commit the new files.
6. Wait for GitHub Pages deployment to complete.
7. Open `https://shaileshkumar7y-max.github.io/New-product-/brand-v3/`.

Do not upload this folder by itself as a ZIP inside GitHub; extract it first so `brand-v3/index.html` is present.

## Files

- `index.html` — website structure
- `styles.css` — visual design and mobile responsiveness
- `app.js` — interactions and UI state
- `data.js` — product, campaign, wheel and date suggestion data
- `assets/*.webp` — nine focused detail crops made from existing saved image masters
- `QA-REPORT.md` — checks, coverage and limitations

## Local preview

Run from the repository root with a local web server and open `/brand-v3/`. Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/brand-v3/`.

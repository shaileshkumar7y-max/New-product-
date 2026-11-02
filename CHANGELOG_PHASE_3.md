# Phase 3.1 changelog

- Kept the existing Phase 2 artwork gallery, pose atlas, lightbox, filters, favourites, theme, age acknowledgement and mobile layout.
- Added all currently integrated artwork/pose imagery as selectable Creator references: four artwork images and 32 Shisei pose-angle images.
- Added image-input support checks from the live Pollinations model catalogue and passed selected references via the documented `image` request field.
- Added optional validated seed, manual retry, cancel, 180-second timeout, and clearer 401/402/429/provider errors.
- Enforced the token expiry returned by OAuth; removed the previous guessed fallback expiry.
- Added a local My Studio shelf for up to 12 hosted result links and prompts.
- Added image-source inventory and Android upload instructions.

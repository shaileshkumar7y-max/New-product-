# Feature preservation and acceptance checklist

| Area | Included in this package | Interaction status |
|---|---|---|
| BLXCKED innerwear branding | Brand home, runway hero, Everyday Comfort, Black Lace, Pink Lace, Better Together, Men and Couples sample listings, Master Series Signature Design | Working local frontend |
| BLXCKED campaign concepts | 10 concepts from the saved High-Heat deck | Lookbook entries |
| BLXCKED collaborations | 12 saved collaboration concepts | Lookbook entries |
| HER AFTER DARK | After Dark hero, Silk Morning, Golden Reflection, Lace edit | Working page and campaign cards |
| Art Atelier | Sepia couples moodboard, movement studies, poster archive, runway/art references | Filters + lightbox |
| Royal Sanskari | Preview card and collection note | Working preview |
| Noor Edit | Modest styling preview | Working preview |
| Grace Edit | Occasionwear preview | Working preview |
| Christian-inspired preview | Grace & Light | Working preview |
| Boyfriend Section | Gifting and product direction | Working navigation |
| Couples Section | Paired edit and prompt game | Local game prompts/choices |
| Three wheel locations | Style Wheel, Date Wheel, Mood Wheel | Working local spin |
| New wheel | Surprise Wheel | Working local spin |
| Date Night Generator | Mood, time and budget filters | Working local generator |
| Wellness & Size Guide | Saved fit guide, measurement helper, care notes | Working local calculator |
| Product discovery | Search, category and collection filters | Working local filters |
| Product interaction | Quick view, sample size/colour, local bag, wishlist | Working local state |
| Data continuity | Export/import for bag, wishlist and wheel options | Working local JSON backup |
| Images | 12 optimised WebP assets from Library | Bundled locally |
| Mobile | Responsive layouts, mobile drawer and bottom nav | CSS implemented; device QA needed |
| PWA | Manifest and versioned service worker | Static checks; live offline QA needed |
| Previous Private Rate Lab | Kept under `private-rate-lab/` | Separate preserved app |

## Important source-recovery notes

- The saved library proves the campaign names, artwork and direction for BLXCKED, HER AFTER DARK and Art Atelier.
- The exact source of prior brand-specific wheel implementations and any hidden custom interactions was not available in the selected `New-product-` repository. The 4-wheel system here is a clean functional recreation, not a verified source-code port of those older implementations.
- Brand website repositories mentioned in earlier chats could not be accessed by the connected GitHub integration at this time. No old repository files were deleted or overwritten by this ZIP.

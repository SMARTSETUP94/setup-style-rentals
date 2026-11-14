- Language comes from the URL: public `/en/...` is rewritten to internal `?lang=en` (src/lib/lang-url.ts + router `rewrite`, root retains `lang`), so one route file serves both languages; never add `/en` route files or read language from localStorage. Why: indexable English pages without touching French URLs.
- Storage product/category photos render through `src/lib/image.ts` (render/image with `resize=contain`, 400/800/1200 srcset, onError fallback to the original). Why: without `resize=contain` the transform crops.

- Public rental routes load active catalogue data through publishable-key server functions and reuse loader DTOs for HTML and metadata; never rely on mount-time fetching for initial product content. Why: crawlers receive the same catalogue as visitors without exposing private data.
- Keep the product SSR HTTP integration test runnable against local or published origins via `SSR_TEST_BASE_URL`, asserting actual H1 and visible tariff outside scripts. Why: metadata alone cannot detect an empty server-rendered product page.

- Admin presentation helpers classify custom-only totals and imported image filenames without updating records; internal HT estimates are converted to TTC only for TTC dashboard aggregates. Why: avoid false zero prices and mixing tax bases.

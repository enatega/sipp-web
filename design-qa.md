# Product Design QA

## Restaurant detail — selected option 2

- Source visual truth:
  `/Users/umarkhalid/.codex/generated_images/01a042cf-6c5f-7c73-bd57-0b516032457f/exec-6cd100f5-5b4d-4c46-9c62-9b644045bdd7.png`
- Implementation screenshot: unavailable because the in-app browser control
  surface is not exposed in this session
- Intended comparison viewport: 1487 x 1058 CSS pixels
- Source pixels: 1487 x 1058 at 1x
- Implementation pixels and density normalization: unavailable
- State: authenticated restaurant detail, light theme, populated menu, product
  configurator open, and one required add-on group invalid after submission

### Full-view comparison evidence

Blocked. The selected visual was opened at original resolution, but no
browser-rendered implementation screenshot could be captured. Production
build output and source inspection are not substitutes for a visual
comparison.

### Focused region comparison evidence

Blocked. The required focused comparisons are the restaurant hero, sticky
category navigation/active state, product-card grid, and configurator's
required add-on error state.

### Static implementation findings

- The desktop composition follows the selected three-column structure:
  sticky category rail, grouped product grid, and sticky configurator.
- Mobile replaces the left rail with a sticky horizontal category rail and
  presents customization as a full-height side sheet.
- Category buttons smooth-scroll to real category sections; an
  `IntersectionObserver` updates the active category while the menu scrolls.
- Product, variation, add-on, cart, store-conflict, pricing, and stock behavior
  use same-origin BFF routes backed by the production delivery APIs.
- Required customization groups expose `aria-invalid`, an inline translated
  error, and focus/scroll recovery after an invalid Add to Cart attempt.
- Light/dark styling uses the existing SIPP semantic tokens. Images use
  the existing `next/image` delivery-image component.

### Required fidelity surfaces

- Fonts and typography: implemented with the existing app heading/body font
  tokens; browser comparison blocked.
- Spacing and layout rhythm: implemented against the 220 px navigation and
  390 px configurator proportions from the source; browser comparison blocked.
- Colors and tokens: light-blue brand, red secondary, semantic surfaces, borders, text, and
  status colors are used in both themes; browser comparison blocked.
- Image quality and assets: live restaurant/product image URLs are rendered
  with cover/contain behavior matching their slots; runtime crop comparison
  blocked.
- Copy and content: all new UI, error, accessible, and state text is present in
  English and German catalogs; the API remains the source of store/product
  content.

### Primary interactions and console

- Category click and scrollspy: implementation inspected; browser test blocked.
- Search debounce and paginated full-menu loading: implementation inspected;
  browser test blocked.
- Variation/add-on selection, required validation, quantity, add-to-cart, and
  cross-store cart replacement: implementation inspected; browser test blocked.
- Keyboard focus loop/Escape close and mobile panel behavior: implementation
  inspected; browser test blocked.
- Browser console errors: unavailable.

### Comparison history

- Initial target: selected option 2 with left navigation, grouped product
  cards, and a right configurator showing a required add-on failure.
- Implementation pass: replaced the legacy account-owned restaurant monolith
  with a delivery-owned modular experience and production BFF contracts.
- Post-fix visual evidence: unavailable because browser capture is blocked.
- Follow-up card reference: the user's attached compact product-card image was
  used as directional guidance rather than a clone. The implementation keeps
  live SIPP imagery and data, reduces the media to a 16:9 banner, uses a
  denser responsive 2/3/4-column grid, and does not invent badges, ratings,
  favourites, or ETA fields absent from the product contract.
- Follow-up interaction pass: the free-delivery tile was removed, long category
  names now wrap within a wider 240 px rail, and the configurator now opens and
  closes as an animated right sheet at every viewport size. Reduced-motion
  preferences are respected.

## Earlier discovery refinements

The earlier banner, Top Brand, store-card, and Order Again changes remain in
place. Their prior browser comparison was also blocked because this session
does not expose the in-app browser control surface.

final result: blocked

# UI, Forms, Styling, Themes, and Internationalization

The customer web application follows the reuse discipline of `super-admin`
while retaining Shaaneiol's burgundy customer brand and customer-facing UX.

## Component hierarchy

Use this order before creating UI:

1. Existing primitive from `components/ui/`.
2. Existing cross-module composite from `components/shared/`.
3. Existing component from the owning module.
4. A new module component.
5. A new shared component only after real reuse exists.

Base primitives own accessibility, focus behavior, disabled behavior, sizes,
and visual variants. Feature components own business composition. Pages own
route composition only.

Use composition instead of large option-heavy components. Keep component
props explicit, prefer named slots/children, and avoid boolean-prop matrices.
Every component file exports one primary UI component. Extract meaningful
subcomponents and hooks.

## Styling and tokens

- Use Tailwind CSS 4 utilities and `cn()` for conditional composition.
- Colors, backgrounds, text, borders, focus rings, shadows, and status states
  use semantic tokens declared in global CSS.
- Every semantic color token must have light and dark values.
- Do not use arbitrary color literals in feature components.
- Brand tokens retain Shaaneiol burgundy; do not copy the admin's yellow
  primary palette.
- Put reusable variants on primitives with a typed variant utility. Do not
  repeat long button/input/card class strings across features.
- Keep `app/globals.css` limited to Tailwind setup, application-wide tokens,
  base behavior, and genuinely global utilities. Use Tailwind for regular UI.
  When isolated complex visual art or animation is clearer in CSS, keep a
  `*.module.css` file inside its owning module and import it only from that
  module. Do not place feature selectors in global CSS.
- Build mobile-first. Validate mobile, tablet, desktop, zoom, long translated
  copy, and reduced-motion preferences.
- Use `next/image` for raster content and Lucide React for standard UI icons.
- Animation communicates state or hierarchy, respects reduced motion, and
  never blocks an interaction.

`next-themes` is installed once in the root provider. The default follows the
system setting and an explicit selection persists. Components do not read the
theme merely to choose CSS colors; use semantic tokens under `.dark`. A theme
toggle needs an accessible name and a hydration-safe mounted state.

## Accessibility

- Use semantic HTML before ARIA.
- Every input has a programmatic label and stable ID.
- Every action is keyboard operable and has a visible focus indicator.
- Icon-only controls have a translated accessible name.
- Dialogs trap focus, provide a title, close predictably, and restore focus.
- Errors use `aria-invalid` and `aria-describedby`; form-level errors use an
  appropriate live region.
- Loading indicators expose status without repeatedly announcing refreshes.
- Do not encode state through color alone. Maintain contrast in both themes.
- Images have meaningful translated alt text or empty alt when decorative.

## Form ownership

Use Formik and Yup for forms that submit business data, including auth,
profile, saved address, checkout, payment selection, support, and ratings.
Simple search/filter inputs that continuously update URL or local view state
may use controlled state.

Each business form has:

```text
modules/<module>/
  components/<feature>/<FeatureForm>.tsx
  schemas/<feature>Schema.ts
  types/<feature>.ts
```

- Initial values are stable and typed.
- Yup schemas own synchronous validation and receive translated messages; do
  not embed English text in schemas.
- Normalize values at the boundary: trim text, canonicalize email/phone, and
  convert dates/numbers deliberately.
- Disable duplicate submission and connect loading to Formik/mutation state.
- Do not clear user input after a failed request.
- Reset only after confirmed success or an explicit user action.
- Multi-step forms preserve validated values and announce the active step.
- Never place passwords, OTPs, card data, or sensitive identity data in URLs,
  logs, analytics, or persistent client storage.

## Shared form primitives

The shared form layer provides consistent Button, Input, PasswordInput,
PhoneInput, Textarea, Select, Checkbox, Radio, Switch, OTP input, field helper,
and form-error components as they become needed.

Every field primitive accepts a name, label, optional helper text, required,
disabled and read-only states, explicit/Formik-connected error text,
`className`, and applicable native attributes without discarding Formik
handlers.

Formik errors use the `touchedOrSubmit` policy: show a field error after it is
touched or after submission is attempted. Nested names resolve through
Formik's `getIn`. Keep one reusable resolver instead of repeating field error
expressions throughout forms.

Known backend `fieldErrors` map to `setFieldError`. A business or unknown
error that cannot be assigned safely appears in a form-level translated alert.
A toast may confirm success or report a global failure, but must not be the
only location of a field validation error.

## Internationalization

`next-intl` is the only user-facing translation mechanism.

- No hardcoded visible text in components, pages, schemas, toast calls,
  metadata, empty states, errors, tooltips, placeholders, aria labels, image
  alt text, or confirmation dialogs.
- Add every key to both `messages/en.json` and `messages/de.json` in the same
  change. The i18n audit must pass.
- Organize namespaces by ownership: `common`, `auth`, `account`, and
  `deliveries.<feature>`.
- Keep keys semantic, not copies of English sentences.
- Use ICU arguments for variables, plurals, dates, numbers, and currency.
- Format currency and dates with locale-aware formatters.
- Backend messages are not trusted translations. Map stable codes/status to
  local keys and use a translated generic fallback.
- Locale selection persists through the existing `NEXT_LOCALE` flow.

## Required component states

Reusable screens and data blocks explicitly design initial loading, background
refresh, empty state, disabled/submitting controls, inline and form-level
errors, offline/retry, unavailable and auth recovery, light/dark mode, and
narrow/wide layouts.

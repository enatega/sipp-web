# Product

## Platform and audience

`super-web` is the customer-facing Shaaneiol web application. It serves
visitors and authenticated customers using the public site and food-delivery
journey.

## Current product scope

The active commerce module is Multi Vendor food delivery. It must support the
complete customer journey:

1. Sign in or create a customer account.
2. Select, save, or update a delivery address.
3. Discover shop types, nearby stores, top brands, categories, deals, and
   relevant order-again content.
4. Search stores and products and apply supported filters.
5. View a store and configure a product.
6. Add and update cart items and resolve incompatible-store conflicts.
7. Review checkout, fulfillment, schedule, notes, tip, coupon, and available
   payment choices.
8. Place an order and view order history/details.
9. Follow order status, tracking, rider chat, support, and rating where the
   backend enables them.
10. Manage profile, saved addresses, wallet/cards, notification preferences,
    password, language, appearance, legal pages, and account lifecycle.

Availability, prices, currency, stores, catalog, fulfillment, and checkout
behavior remain backend- and address-driven. The web app must not replace
backend business rules with guessed client logic.

## Expansion boundary

- Multi Vendor is the only delivery mode implemented now.
- Architecture permits a future Single Vendor mode through a delivery-mode
  interface while reusing address, product, cart, checkout, orders, account,
  and shell capabilities.
- New platform services are independent modules with public contracts rather
  than additions to one global feature layer.
- Single Vendor must not be represented by non-functional placeholder screens.
- Chain delivery mode and Drive/Ride Sharing are out of scope unless product
  scope is explicitly revised.

The public homepage may describe the broader Shaaneiol ecosystem, but its copy
does not authorize implementation of an out-of-scope service.

## Existing behavior to preserve

- The public homepage and customer header/account experience.
- Email/password login with customer app type.
- Phone OTP login and customer registration.
- HTTP-only server-managed authentication and same-origin BFF requests.
- Profile and saved-address management already present in the web project.
- English/German locale selection and system/light/dark theme persistence.

The current app returns authenticated customers to `/`; a later delivery-route
task may revise navigation deliberately. Structural migrations must not alter
these behaviors accidentally.

## Product principles

- Address context comes before address-dependent discovery and checkout.
- Make the path from discovery to order clear, fast, and recoverable.
- Preserve customer input across recoverable failures.
- Treat price, availability, payment, and order state as backend-owned truth.
- Surface errors with a useful next action rather than backend terminology.
- Keep authentication and payment handling private and trustworthy.
- Build shared platform capabilities once without coupling future services to
  delivery internals.

## Brand, accessibility, and localization

- Product name: Shaaneiol.
- Preserve the existing burgundy customer brand; do not copy the admin theme.
- Support responsive mobile, tablet, and desktop layouts.
- All journeys are keyboard operable, visibly focused, screen-reader labelled,
  and usable in light and dark mode.
- All user-facing content is translated in every configured locale.

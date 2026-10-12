const STRIPE_CHECKOUT_ORIGIN = "https://checkout.stripe.com";

/** True only for a hosted Stripe Checkout page, so a bad upstream URL can never redirect elsewhere. */
export function isStripeCheckoutUrl(value: string) {
  try {
    return new URL(value).origin === STRIPE_CHECKOUT_ORIGIN;
  } catch {
    return false;
  }
}

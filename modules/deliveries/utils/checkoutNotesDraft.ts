/** Checkout notes typed before a quick trip back to the cart, per cart. */
export interface CheckoutNotesDraft {
  restaurantNote: string;
  courierNote: string;
}

const keyFor = (bucketId: string) => `sipp:checkout-notes:${bucketId}`;

export function readCheckoutNotesDraft(bucketId: string): CheckoutNotesDraft | null {
  try {
    const raw = window.sessionStorage.getItem(keyFor(bucketId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutNotesDraft>;
    return {
      restaurantNote: typeof parsed.restaurantNote === "string" ? parsed.restaurantNote : "",
      courierNote: typeof parsed.courierNote === "string" ? parsed.courierNote : "",
    };
  } catch {
    return null;
  }
}

export function writeCheckoutNotesDraft(bucketId: string, draft: CheckoutNotesDraft) {
  try {
    if (!draft.restaurantNote && !draft.courierNote) {
      window.sessionStorage.removeItem(keyFor(bucketId));
      return;
    }
    window.sessionStorage.setItem(keyFor(bucketId), JSON.stringify(draft));
  } catch {
    // Storage unavailable (private mode, blocked): the draft just isn't kept.
  }
}

export function clearCheckoutNotesDraft(bucketId: string) {
  try {
    window.sessionStorage.removeItem(keyFor(bucketId));
  } catch {
    // Nothing to clear.
  }
}

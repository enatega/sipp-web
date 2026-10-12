import type { DeliveryStore } from "@/modules/deliveries/types/discovery";

export function storeOfferLabel(
  store: DeliveryStore,
  amount: (value: number) => string,
  off: string,
) {
  if (store.dealAmount && store.dealAmount > 0) {
    return store.dealType?.toLowerCase() === "percentage"
      ? `${store.dealAmount}% ${off}`
      : `${amount(store.dealAmount)} ${off}`;
  }
  return store.deal?.trim() || null;
}

export function storeDeliveryTimeLabel(
  value: DeliveryStore["deliveryTime"],
  minutesLabel: (count: number) => string,
) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? minutesLabel(value) : null;
  }

  const normalized = value?.trim();
  if (!normalized) return null;
  const duration = /^(\d{1,3}):(\d{2}):(\d{2})$/.exec(normalized);
  if (duration) {
    const hours = Number(duration[1]);
    const minutes = Number(duration[2]);
    const seconds = Number(duration[3]);
    if (minutes >= 60 || seconds >= 60) return null;
    const totalMinutes = Math.ceil((hours * 3600 + minutes * 60 + seconds) / 60);
    return totalMinutes > 0 ? minutesLabel(totalMinutes) : null;
  }
  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    const count = Number(normalized);
    return count > 0 ? minutesLabel(count) : null;
  }
  const numericValue = Number.parseFloat(normalized);
  return Number.isNaN(numericValue) || numericValue > 0 ? normalized : null;
}

export function storeHref(store: DeliveryStore) {
  return `/restaurants/${encodeURIComponent(store.slug || store.storeId)}`;
}

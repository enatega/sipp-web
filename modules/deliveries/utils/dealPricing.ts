import type { ProductDeal } from "../types/restaurant";

/**
 * Mirrors the server cart: a product deal is applied to the full configured
 * unit price (variation + add-ons), never letting the price drop below zero.
 */
export function applyProductDeal(unitPrice: number, deal: ProductDeal | null) {
  if (!deal || deal.discountValue <= 0) return unitPrice;
  const discounted =
    deal.discountType === "percentage"
      ? unitPrice - (unitPrice * deal.discountValue) / 100
      : unitPrice - deal.discountValue;
  return Math.max(0, Number(discounted.toFixed(2)));
}

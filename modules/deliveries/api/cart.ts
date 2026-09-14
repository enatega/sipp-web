import { apiRoutes } from "@/config/api";
import { requestJson } from "@/services/api/client";
import { parseCart } from "../utils/cartMappers";
import type { AddCartItemInput } from "../types/cart";

export const cartApi = {
  async details(signal?: AbortSignal) {
    return parseCart(await requestJson<unknown>(apiRoutes.deliveryCart, { signal }));
  },
  async addItem(input: AddCartItemInput) {
    return parseCart(await requestJson<unknown>(apiRoutes.deliveryCart, {
      method: "POST",
      body: JSON.stringify(input),
    }));
  },
  async updateQuantity(itemId: string, quantity: number) {
    return parseCart(await requestJson<unknown>(
      `${apiRoutes.deliveryCart}/items/${encodeURIComponent(itemId)}`,
      { method: "PATCH", body: JSON.stringify({ quantity }) },
    ));
  },
  async removeItem(itemId: string) {
    return parseCart(await requestJson<unknown>(
      `${apiRoutes.deliveryCart}/items/${encodeURIComponent(itemId)}`,
      { method: "DELETE" },
    ));
  },
  async clear() {
    return parseCart(await requestJson<unknown>(apiRoutes.deliveryCart, {
      method: "DELETE",
    }));
  },
};


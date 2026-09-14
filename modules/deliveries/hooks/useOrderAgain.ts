"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restaurantApi } from "../api/restaurant";
import type { OrderDetail, OrderProduct } from "../types/orders";
import { buildOrderAgainInput } from "../utils/orderAgain";
import { useCartMutations, useCartQuery } from "./useCart";

export function useOrderAgain() {
  const router = useRouter();
  const cart = useCartQuery();
  const cartMutations = useCartMutations();
  const [pendingOrder, setPendingOrder] = useState<OrderDetail | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function prepareProduct(product: OrderProduct) {
    const customizations = product.selectedOptions?.length && product.productId
      ? await restaurantApi.productCustomizations(product.productId)
      : undefined;
    return buildOrderAgainInput(product, customizations);
  }

  async function addOrder(order: OrderDetail, shouldClearCart: boolean) {
    if (isRunning) return;
    setIsRunning(true);
    setHasError(false);
    setPendingOrder(null);
    try {
      if (shouldClearCart) await cartMutations.clear.mutateAsync();
      let addedCount = 0;
      for (const product of order.orderItems?.products ?? []) {
        try {
          const input = await prepareProduct(product);
          await cartMutations.addItem.mutateAsync(input);
          addedCount += 1;
        } catch {
          // Products or saved options can become unavailable after an order.
        }
      }
      if (addedCount === 0) {
        setHasError(true);
        return;
      }
      router.push("/cart");
    } catch {
      setHasError(true);
    } finally {
      setIsRunning(false);
    }
  }

  function start(order: OrderDetail) {
    if (isRunning || cart.isPending) return;
    const currentStoreId = cart.data?.storeId;
    if (currentStoreId && currentStoreId !== order.store?.id) {
      setPendingOrder(order);
      return;
    }
    void addOrder(order, false);
  }

  return {
    cancelConflict: () => setPendingOrder(null),
    confirmConflict: () => {
      if (pendingOrder) void addOrder(pendingOrder, true);
    },
    hasConflict: Boolean(pendingOrder),
    hasError,
    isRunning,
    start,
  };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { deliveryQueryKeys } from "../queries/queryKeys";
import { preserveCartItemOrder } from "../utils/cartMappers";
import type { AddCartItemInput, CartResponse } from "../types/cart";

const CART_STALE_TIME = 15_000;

export function useCartQuery(enabled = true) {
  return useQuery({
    queryKey: deliveryQueryKeys.cart(),
    queryFn: ({ signal }) => cartApi.details(signal),
    enabled,
    staleTime: CART_STALE_TIME,
  });
}

function syncCart(
  queryClient: ReturnType<typeof useQueryClient>,
  cart: CartResponse,
) {
  queryClient.setQueryData<CartResponse>(
    deliveryQueryKeys.cart(),
    (previous) => preserveCartItemOrder(previous, cart),
  );
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const onSuccess = (cart: CartResponse) => syncCart(queryClient, cart);
  const addItem = useMutation({
    mutationFn: (input: AddCartItemInput) => cartApi.addItem(input),
    onSuccess,
  });
  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess,
  });
  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess,
  });
  const clear = useMutation({ mutationFn: cartApi.clear, onSuccess });
  return { addItem, updateQuantity, removeItem, clear };
}

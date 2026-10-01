"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/config/api";
import { currencyQueryKeys, fallbackCurrency, formatAppCurrency, resolveCurrencySymbol } from "@/config/currency";
import { requestJson } from "@/services/api/client";

interface ActiveCurrency {
  code: string;
  symbol: string;
}

export function useAppCurrency() {
  const query = useQuery({
    queryKey: currencyQueryKeys.active(),
    queryFn: ({ signal }) =>
      requestJson<ActiveCurrency | null>(apiRoutes.currency, {
        cache: "no-store",
        signal,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: "always",
  });

  return {
    ...query,
    code: query.data?.code?.trim() || fallbackCurrency.code,
    symbol: resolveCurrencySymbol(query.data?.symbol, query.data?.code),
  };
}

export function useAppCurrencyFormatter() {
  const { symbol } = useAppCurrency();
  return (
    format: Parameters<typeof formatAppCurrency>[0],
    value: number,
    options?: Parameters<typeof formatAppCurrency>[2],
  ) => formatAppCurrency(format, value, options, symbol);
}

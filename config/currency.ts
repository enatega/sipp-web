export const fallbackCurrency = { code: "CRC", symbol: "₡" } as const;
export const currencyQueryKeys = {
  active: () => ["active-currency"] as const,
};

export function resolveCurrencySymbol(symbol?: string | null, code?: string | null) {
  const configured = symbol?.trim();
  if (configured && configured !== code && !/^[A-Z]{3}$/i.test(configured)) {
    return configured === "¡" ? "₡" : configured;
  }
  const currencyCode = code?.trim() || configured || fallbackCurrency.code;
  if (currencyCode.toUpperCase() === "CRC") return "₡";
  try {
    const resolved = new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0).find((part) => part.type === "currency")?.value;
    return resolved && resolved.toUpperCase() !== currencyCode.toUpperCase()
      ? resolved
      : "¤";
  } catch {
    return "¤";
  }
}

type AppCurrencyFormatOptions = Omit<
  Intl.NumberFormatOptions,
  "currency" | "currencyDisplay" | "currencySign" | "style"
>;

interface AppCurrencyFormatter {
  number(value: number, options?: Intl.NumberFormatOptions): string;
}

export function formatAppCurrency(
  format: AppCurrencyFormatter,
  value: number,
  options: AppCurrencyFormatOptions = {},
  symbol: string = fallbackCurrency.symbol,
) {
  const minimumFractionDigits =
    options.minimumFractionDigits ??
    (options.maximumFractionDigits === 0 ? 0 : 2);

  return `${format.number(value, {
    minimumFractionDigits,
    maximumFractionDigits: 2,
    ...options,
  })}${symbol}`;
}

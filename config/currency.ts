export const appCurrency = {
  code: "CRC",
  symbol: "₡",
  label: "CRC",
} as const;

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
) {
  const minimumFractionDigits =
    options.minimumFractionDigits ??
    (options.maximumFractionDigits === 0 ? 0 : 2);

  return `${format.number(value, {
    minimumFractionDigits,
    maximumFractionDigits: 2,
    ...options,
  })}${appCurrency.symbol}`;
}

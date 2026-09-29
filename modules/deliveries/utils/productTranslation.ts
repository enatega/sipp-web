type TranslatedProduct = {
  name: string;
  nameTranslations?: Record<string, string>;
};

export function getLocalizedProductName(
  product: TranslatedProduct,
  locale: string,
): string {
  const code = locale.trim().toLowerCase().split('-')[0];
  return (
    product.nameTranslations?.[code]?.trim() ||
    product.nameTranslations?.en?.trim() ||
    product.name
  );
}

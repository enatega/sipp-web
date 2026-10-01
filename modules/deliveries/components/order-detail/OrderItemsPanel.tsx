"use client";

import { ShoppingBag } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useAppCurrencyFormatter } from "@/lib/useAppCurrency";
import { DeliveryImage } from "../discovery/DeliveryImage";
import type { OrderProduct } from "../../types/orders";

interface Props {
  products: OrderProduct[];
}

export function OrderItemsPanel({ products }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const format = useFormatter();
  const formatAppCurrency = useAppCurrencyFormatter();
  const money = (value: number) =>
    formatAppCurrency(format, value);

  return (
    <section className="rounded-2xl bg-card p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">{t("itemsTitle")}</h2>
          <p className="mt-1 text-xs text-muted">
            {t("itemCount", {
              count: products.reduce((total, item) => total + item.quantity, 0),
            })}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
          <ShoppingBag aria-hidden="true" className="size-5" />
        </span>
      </div>

      {products.length ? (
        <div className="mt-5 divide-y divide-line">
          {products.map((product, index) => (
            <article
              className="flex min-w-0 gap-4 py-5 first:pt-0 last:pb-0"
              key={`${product.productId ?? product.name}-${index}`}
            >
              <DeliveryImage
                alt={product.name}
                className="size-20 shrink-0 rounded-xl sm:size-24"
                sizes="96px"
                src={product.image}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-bold text-ink sm:text-base">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {t("quantity", { count: product.quantity })} · {t("each", { price: money(product.unitPrice) })}
                    </p>
                  </div>
                  <strong className="shrink-0 text-sm tabular-nums text-ink sm:text-base">
                    {money(product.totalPrice)}
                  </strong>
                </div>

                {product.selectedOptions?.length ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("customizations")}>
                    {product.selectedOptions.map((option, optionIndex) => {
                      const label = [option.groupName, option.optionName]
                        .filter(Boolean)
                        .join(": ");
                      if (!label) return null;
                      return (
                        <li
                          className="rounded-lg bg-[var(--soft-surface)] px-2.5 py-1 text-[11px] leading-4 text-body"
                          key={`${label}-${optionIndex}`}
                        >
                          {label}
                          {typeof option.price === "number" && option.price > 0
                            ? ` · +${money(option.price)}`
                            : ""}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-[var(--soft-surface)] p-5 text-sm text-body">
          {t("itemsUnavailable")}
        </p>
      )}
    </section>
  );
}

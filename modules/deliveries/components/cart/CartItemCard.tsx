"use client";

import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";
import type { CartItem } from "../../types/cart";

interface Props {
  item: CartItem;
  isUpdating: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemCard({ item, isUpdating, onQuantityChange, onRemove }: Props) {
  const t = useTranslations("deliveries.cart");
  const format = useFormatter();
  const price = (value: number) => formatAppCurrency(format, value);
  const optionNames = item.selectedOptions.map((option) => option.optionName).filter(Boolean);

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card shadow-[0_8px_26px_rgba(35,22,26,0.045)] transition-[border-color,box-shadow] hover:border-brand/20 hover:shadow-card">
      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[var(--soft-surface)] sm:h-32 sm:w-36">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <span className="grid size-full place-items-center text-muted"><ImageOff aria-hidden="true" className="size-7" /></span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-[15px] font-bold text-ink sm:text-base">{item.name}</h2>
              {optionNames.length ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{optionNames.join(" · ")}</p> : item.description ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{item.description}</p> : null}
            </div>
            <button type="button" onClick={onRemove} disabled={isUpdating} aria-label={t("removeItem", { name: item.name })} className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-40">
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>

          {!item.inStock ? <p className="mt-2 text-xs font-semibold text-brand">{t("outOfStock")}</p> : null}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-[11px] text-muted">{t("unitPrice", { price: price(item.unitPrice) })}</p>
              <p className="mt-0.5 text-base font-bold text-brand">{price(item.lineTotal)}</p>
            </div>
            <div className="inline-flex h-10 items-center rounded-full border border-line bg-surface p-1 shadow-sm" aria-label={t("quantityFor", { name: item.name })}>
              <button type="button" disabled={isUpdating} onClick={() => item.quantity === 1 ? onRemove() : onQuantityChange(item.quantity - 1)} aria-label={item.quantity === 1 ? t("removeItem", { name: item.name }) : t("decreaseQuantity")} className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-40">
                {item.quantity === 1 ? <Trash2 aria-hidden="true" className="size-3.5" /> : <Minus aria-hidden="true" className="size-3.5" />}
              </button>
              <span className="min-w-8 text-center text-sm font-bold tabular-nums text-ink" aria-live="polite">{item.quantity}</span>
              <button type="button" disabled={isUpdating || item.quantity >= 99 || !item.inStock} onClick={() => onQuantityChange(item.quantity + 1)} aria-label={t("increaseQuantity")} className="grid size-8 place-items-center rounded-full bg-brand text-ink transition-colors hover:bg-brand/85 disabled:opacity-40">
                <Plus aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

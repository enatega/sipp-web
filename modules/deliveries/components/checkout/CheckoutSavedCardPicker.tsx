"use client";

import Link from "next/link";
import { Check, CreditCard, LoaderCircle, Plus } from "lucide-react";
import type { SavedCard } from "@/modules/account";

interface Props {
  cards: SavedCard[];
  selectedCardId: string | null;
  isLoading: boolean;
  loadError: boolean;
  labels: {
    title: string;
    description: string;
    defaultCard: string;
    expires: string;
    anotherCard: string;
    anotherCardHint: string;
    manageCards: string;
    loading: string;
    error: string;
  };
  onSelect: (cardId: string | null) => void;
}

export function CheckoutSavedCardPicker({ cards, selectedCardId, isLoading, loadError, labels, onSelect }: Props) {
  return (
    <div className="mt-5 border-t border-line pt-5">
      <h3 className="text-sm font-bold text-ink">{labels.title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted">{labels.description}</p>

      {isLoading ? (
        <div className="mt-4 flex min-h-16 items-center gap-3 rounded-xl bg-[var(--soft-surface)] px-4 text-sm text-body" role="status">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand" />
          {labels.loading}
        </div>
      ) : loadError ? (
        <p className="mt-4 rounded-xl bg-brand/8 p-3 text-xs font-medium text-brand" role="alert">{labels.error}</p>
      ) : (
        <div aria-label={labels.title} className="mt-4 grid gap-2" role="radiogroup">
          {cards.map((card) => {
            const selected = card.id === selectedCardId;
            return (
              <button
                aria-checked={selected}
                className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 text-left transition-[border-color,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selected ? "border-brand bg-brand/5" : "border-line bg-surface hover:border-brand/35"}`}
                key={card.id}
                onClick={() => onSelect(card.id)}
                role="radio"
                type="button"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${selected ? "bg-brand text-white" : "bg-[var(--soft-surface)] text-brand"}`}>
                  <CreditCard aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-ink">{card.brand.toUpperCase()} •••• {card.last4}</strong>
                  <small className="mt-0.5 block text-xs text-muted">{labels.expires} {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}{card.isDefault ? ` · ${labels.defaultCard}` : ""}</small>
                </span>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selected ? "border-brand bg-brand text-white" : "border-line"}`}>
                  {selected ? <Check aria-hidden="true" className="size-3" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}

          <button
            aria-checked={selectedCardId === null}
            className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 text-left transition-[border-color,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selectedCardId === null ? "border-brand bg-brand/5" : "border-line bg-surface hover:border-brand/35"}`}
            onClick={() => onSelect(null)}
            role="radio"
            type="button"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-surface)] text-brand"><Plus aria-hidden="true" className="size-4" /></span>
            <span className="min-w-0 flex-1"><strong className="block text-sm text-ink">{labels.anotherCard}</strong><small className="mt-0.5 block text-xs text-muted">{labels.anotherCardHint}</small></span>
            <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selectedCardId === null ? "border-brand bg-brand text-white" : "border-line"}`}>{selectedCardId === null ? <Check aria-hidden="true" className="size-3" strokeWidth={3} /> : null}</span>
          </button>
        </div>
      )}

      <Link className="mt-3 inline-flex min-h-9 items-center text-xs font-bold text-brand underline-offset-4 hover:underline" href="/profile/saved-cards">{labels.manageCards}</Link>
    </div>
  );
}

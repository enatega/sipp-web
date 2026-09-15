"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, MapPin, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SavedAddress } from "@/modules/account";
import { cn } from "@/lib/utils";
import styles from "./checkout-transitions.module.css";

interface Props {
  addresses: SavedAddress[];
  error: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: SavedAddress) => void;
  selectedAddressId: string;
  validatingAddressId: string | null;
}

export function CheckoutAddressPicker({
  addresses,
  error,
  isOpen,
  onClose,
  onSelect,
  selectedAddressId,
  validatingAddressId,
}: Props) {
  const t = useTranslations("deliveries.checkout");
  const panelRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !validatingAddressId) setIsClosing(true);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, validatingAddressId]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href]:not([aria-disabled="true"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4 sm:p-6",
        isClosing ? styles.backdropExit : styles.backdropEnter,
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !validatingAddressId) {
          setIsClosing(true);
        }
      }}
    >
      <div
        aria-labelledby="checkout-address-picker-title"
        aria-modal="true"
        className={cn(
          "flex max-h-[min(720px,88vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_70px_rgba(20,10,14,0.3)] outline-none",
          isClosing ? styles.dialogExit : styles.dialogEnter,
        )}
        onAnimationEnd={(event) => {
          if (isClosing && event.currentTarget === event.target) onClose();
        }}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="checkout-address-picker-title" className="text-lg font-bold text-ink">
              {t("chooseAddress")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">{t("chooseAddressHint")}</p>
          </div>
          <button
            aria-label={t("closeAddressPicker")}
            autoFocus
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--soft-surface)] hover:text-ink"
            disabled={Boolean(validatingAddressId)}
            onClick={() => setIsClosing(true)}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="space-y-2.5">
            {addresses.map((address) => {
              const isSelected = address.id === selectedAddressId;
              const isValidating = validatingAddressId === address.id;
              return (
                <button
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color] ${isSelected ? "border-brand bg-brand/5" : "border-line hover:border-brand/30 hover:bg-[var(--soft-surface)]"}`}
                  disabled={Boolean(validatingAddressId)}
                  key={address.id}
                  onClick={() => onSelect(address)}
                  type="button"
                >
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${isSelected ? "bg-brand text-ink" : "bg-brand/10 text-brand"}`}>
                    {isValidating ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : isSelected ? <Check aria-hidden="true" className="size-4" /> : <MapPin aria-hidden="true" className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm text-ink">
                      {address.location_name || t(`addressType${address.type}`)}
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-body">{address.address}</span>
                  </span>
                  {isSelected ? <span className="shrink-0 pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-brand">{t("selected")}</span> : null}
                </button>
              );
            })}
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-3 text-xs font-medium leading-5 text-brand" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="border-t border-line bg-surface p-4 sm:px-5">
          <Link className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-brand/25 text-sm font-bold text-brand transition-colors hover:bg-brand/5" href="/profile/address-book">
            <Plus aria-hidden="true" className="size-4" />
            {t("manageAddresses")}
          </Link>
        </footer>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Clock3, ExternalLink, Mail, MapPin, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RestaurantStore } from "../../types/restaurant";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export function formatStoreTime(value: string) {
  if (/\b(?:am|pm)\b/i.test(value)) return value.toUpperCase();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return value;
  const hour = Number(match[1]);
  if (hour > 24 || Number(match[2]) > 59) return value;
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 && hour < 24 ? "PM" : "AM"}`;
}

export function RestaurantInfo({ store, onClose }: { store: RestaurantStore; onClose: () => void }) {
  const t = useTranslations("deliveries.restaurant");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const coordinates = store.latitude != null && store.longitude != null && Number.isFinite(store.latitude) && Number.isFinite(store.longitude)
    ? `${store.latitude},${store.longitude}` : null;
  const mapQuery = coordinates ?? store.address;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setClosing(true); };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onEscape);
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timeout = window.setTimeout(onClose, 240);
    return () => window.clearTimeout(timeout);
  }, [closing, onClose]);

  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return createPortal(
    <div className={`fixed inset-0 z-[200] flex justify-end bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${entered && !closing ? "opacity-100" : "opacity-0"}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setClosing(true); }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="restaurant-details-title" onKeyDown={trapFocus} className={`flex h-full w-full max-w-[520px] flex-col bg-card shadow-[-18px_0_60px_rgba(0,0,0,0.18)] transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${entered && !closing ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-7">
          <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{t("businessInfo")}</p><h2 id="restaurant-details-title" className="mt-1 truncate font-heading text-2xl font-bold text-ink">{store.name}</h2></div>
          <button ref={closeRef} type="button" onClick={() => setClosing(true)} aria-label={t("closeDetails")} className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-soft-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><X className="size-5" aria-hidden="true" /></button>
        </header>
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 text-sm text-body sm:px-7">
          {store.description || store.tagLine ? <p className="leading-6">{store.description || store.tagLine}</p> : null}
          {store.deliveryAllowed !== null || store.pickupAllowed !== null ? <section aria-label={t("fulfillmentTitle")}><h3 className="font-bold text-ink">{t("fulfillmentTitle")}</h3><div className="mt-3 flex flex-wrap gap-2">{store.deliveryAllowed !== null ? <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${store.deliveryAllowed ? "bg-success-soft text-success" : "bg-soft-surface text-muted"}`}>{store.deliveryAllowed ? t("deliveryAvailable") : t("deliveryUnavailable")}</span> : null}{store.pickupAllowed !== null ? <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${store.pickupAllowed ? "bg-success-soft text-success" : "bg-soft-surface text-muted"}`}>{store.pickupAllowed ? t("pickupAvailable") : t("pickupUnavailable")}</span> : null}</div></section> : null}
          {mapQuery ? (
            <section aria-label={t("locationTitle")}>
              <h3 className="flex items-center gap-2 font-bold text-ink"><MapPin className="size-4 text-brand" aria-hidden="true" />{t("locationTitle")}</h3>
              {store.address ? <p className="mt-2 leading-6">{store.address}</p> : null}
              <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-soft-surface">
                <iframe title={t("mapTitle", { name: store.name })} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-52 w-full border-0 sm:h-60" />
              </div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 font-bold text-ink transition-colors hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{t("directions")}<ExternalLink className="size-4" aria-hidden="true" /></a>
            </section>
          ) : null}
          {store.storeTimings ? <section><h3 className="flex items-center gap-2 font-bold text-ink"><Clock3 className="size-4 text-brand" aria-hidden="true" />{t("openingHours")}</h3><dl className="mt-3 divide-y divide-line rounded-2xl border border-line px-4">{DAYS.map((day) => { const timing = store.storeTimings?.[day]; return <div className="flex justify-between gap-4 py-2.5" key={day}><dt>{t(`days.${day}`)}</dt><dd className="text-right font-semibold text-ink">{timing?.is_active && timing.slots?.length ? timing.slots.map((slot) => `${formatStoreTime(slot.open ?? "")}–${formatStoreTime(slot.close ?? "")}`).join(", ") : t("closed")}</dd></div>; })}</dl></section> : null}
          {store.contact.phone || store.contact.email ? <section><h3 className="font-bold text-ink">{t("contactTitle")}</h3><div className="mt-3 space-y-2">{store.contact.phone ? <a href={`tel:${store.contact.phone}`} className="flex min-h-10 items-center gap-3 break-all hover:text-ink"><Phone className="size-4 shrink-0 text-brand" aria-hidden="true" />{store.contact.phone}</a> : null}{store.contact.email ? <a href={`mailto:${store.contact.email}`} className="flex min-h-10 items-center gap-3 break-all hover:text-ink"><Mail className="size-4 shrink-0 text-brand" aria-hidden="true" />{store.contact.email}</a> : null}</div></section> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

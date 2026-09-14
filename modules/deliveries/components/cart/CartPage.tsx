"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, ShoppingBag, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Header } from "@/components/shared/app-shell/Header";
import { useSessionQuery } from "@/modules/account";
import { loginHref } from "@/modules/account/utils/authRedirect";
import { CartItemCard } from "./CartItemCard";
import { useCartMutations, useCartQuery } from "../../hooks/useCart";

function LoadingState() {
  const t = useTranslations("deliveries.cart");
  return <main className="grid min-h-[65vh] place-items-center text-brand"><LoaderCircle aria-hidden="true" className="size-8 animate-spin" /><span className="sr-only">{t("loading")}</span></main>;
}

function EmptyCart() {
  const t = useTranslations("deliveries.cart");
  return (
    <main className="section-wrap grid min-h-[68vh] place-items-center py-12 text-center">
      <div className="max-w-md">
        <div className="relative mx-auto grid size-28 place-items-center rounded-[32px] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-brand)_14%,var(--card)),var(--card))] text-brand shadow-card">
          <ShoppingCart aria-hidden="true" className="size-11" />
          <Sparkles aria-hidden="true" className="absolute right-4 top-4 size-4 text-gold" />
        </div>
        <h1 className="mt-7 text-2xl font-bold text-ink sm:text-3xl">{t("emptyTitle")}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-body">{t("emptyMessage")}</p>
        <Link href="/discovery" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(183,24,47,0.22)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-brand-deep">
          <ShoppingBag aria-hidden="true" className="size-4" />{t("browseFood")}
        </Link>
      </div>
    </main>
  );
}

export function CartPage() {
  const t = useTranslations("deliveries.cart");
  const format = useFormatter();
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const cart = useCartQuery(authenticated);
  const mutations = useCartMutations();
  const [clearOpen, setClearOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace(loginHref("/cart"));
  }, [authenticated, router, session.isPending]);

  const price = (value: number) => format.number(value, { style: "currency", currency: "INR" });
  const isMutating = mutations.updateQuantity.isPending || mutations.removeItem.isPending || mutations.clear.isPending;

  function updateQuantity(itemId: string, quantity: number) {
    setError("");
    mutations.updateQuantity.mutate({ itemId, quantity }, { onError: () => setError(t("updateError")) });
  }

  function removeItem(itemId: string) {
    setError("");
    mutations.removeItem.mutate(itemId, { onError: () => setError(t("removeError")) });
  }

  if (session.isPending || (authenticated && cart.isPending)) return <><Header /><LoadingState /></>;
  if (!authenticated) return <><Header /><LoadingState /></>;
  if (cart.isError) {
    return <><Header /><main className="section-wrap grid min-h-[65vh] place-items-center py-12 text-center"><div><ShoppingCart className="mx-auto size-10 text-brand" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-ink">{t("loadErrorTitle")}</h1><p className="mt-2 text-sm text-body">{t("loadErrorMessage")}</p><button type="button" onClick={() => void cart.refetch()} className="mt-5 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-deep">{t("retry")}</button></div></main></>;
  }
  if (!cart.data || cart.data.isEmpty) return <><Header cartCount={0} /><EmptyCart /></>;

  const data = cart.data;
  return (
    <>
      <Header cartCount={data.totalItems} />
      <main className="min-h-[calc(100vh-76px)] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_300px)] pb-28 pt-7 sm:pb-12 sm:pt-10">
        <div className="section-wrap">
          <Link href={data.storeId ? `/restaurants/${data.storeId}` : "/discovery"} className="inline-flex items-center gap-2 text-sm font-semibold text-body transition-colors hover:text-brand"><ArrowLeft aria-hidden="true" className="size-4" />{t("continueShopping")}</Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t("eyebrow")}</p><h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1><p className="mt-2 text-sm text-body">{t("itemCount", { count: data.totalItems })}</p></div>
            <button type="button" onClick={() => setClearOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold text-muted transition-colors hover:bg-brand/10 hover:text-brand"><Trash2 aria-hidden="true" className="size-4" />{t("clearCart")}</button>
          </div>

          <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
            <section className="space-y-4" aria-label={t("itemsLabel")}>
              {data.items.map((item) => <CartItemCard key={item.id} item={item} isUpdating={isMutating} onQuantityChange={(quantity) => updateQuantity(item.id, quantity)} onRemove={() => removeItem(item.id)} />)}
              {error ? <p role="alert" className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">{error}</p> : null}
            </section>

            <aside className="rounded-3xl border border-line bg-card p-5 shadow-card lg:sticky lg:top-24 sm:p-6">
              <h2 className="text-xl font-bold text-ink">{t("summary")}</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-body"><span>{t("subtotal")}</span><span className="font-medium text-ink">{price(data.totalPrice)}</span></div>
                {data.discountAmount > 0 ? <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400"><span>{t("discount")}</span><span className="font-semibold">− {price(data.discountAmount)}</span></div> : null}
              </div>
              <div className="my-5 border-t border-dashed border-line" />
              <div className="flex items-end justify-between gap-4"><div><p className="font-bold text-ink">{t("cartTotal")}</p><p className="mt-1 text-[11px] text-muted">{t("feesAtCheckout")}</p></div><strong className="text-2xl text-brand">{price(data.finalPrice)}</strong></div>
              <Link href="/checkout" className="mt-6 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(183,24,47,0.22)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-brand-deep">{t("checkout")}</Link>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">{t("secureCheckout")}</p>
            </aside>
          </div>
        </div>
      </main>

      {clearOpen ? <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-5" role="dialog" aria-modal="true" aria-labelledby="clear-cart-title" onClick={(event) => { if (event.target === event.currentTarget && !mutations.clear.isPending) setClearOpen(false); }}><div className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 shadow-[0_24px_70px_rgba(20,10,14,0.3)]"><span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand"><Trash2 aria-hidden="true" className="size-5" /></span><h2 id="clear-cart-title" className="mt-4 text-lg font-bold text-ink">{t("clearTitle")}</h2><p className="mt-2 text-sm leading-6 text-body">{t("clearMessage")}</p>{error ? <p role="alert" className="mt-3 text-sm text-brand">{error}</p> : null}<div className="mt-6 flex justify-end gap-2"><button type="button" disabled={mutations.clear.isPending} onClick={() => setClearOpen(false)} className="min-h-10 rounded-full px-4 text-sm font-semibold text-body hover:bg-[var(--soft-surface)]">{t("cancel")}</button><button type="button" disabled={mutations.clear.isPending} onClick={() => mutations.clear.mutate(undefined, { onSuccess: () => setClearOpen(false), onError: () => setError(t("clearError")) })} className="min-h-10 rounded-full bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep disabled:opacity-50">{mutations.clear.isPending ? t("clearing") : t("confirmClear")}</button></div></div></div> : null}
    </>
  );
}

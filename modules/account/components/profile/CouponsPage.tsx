"use client";

import { Gift, LoaderCircle, SearchX, TicketPercent } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/services/api/client";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileBackLink } from "./ProfileBackLink";
import { CouponListItem } from "./CouponListItem";
import { useClaimCouponMutation, useClaimedCouponsQuery, useCouponActivationMutation } from "@/modules/account/queries/useCouponQueries";
import { useSessionQuery } from "@/modules/account/queries/useAccountQueries";

export function CouponsPage() {
  const t = useTranslations("coupons");
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const coupons = useClaimedCouponsQuery(authenticated);
  const claim = useClaimCouponMutation();
  const activation = useCouponActivationMutation();
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const items = useMemo(() => coupons.data?.pages.flatMap((page) => page.data) ?? [], [coupons.data]);

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  function errorMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 409) return t("alreadyClaimed");
    if (error instanceof ApiError && error.status === 400) return t("invalidCode");
    return t("genericError");
  }

  async function claimCode() {
    const normalized = code.trim().toUpperCase();
    setNotice(null);
    if (!/^[A-Z0-9_-]{2,64}$/.test(normalized)) {
      setNotice({ kind: "error", text: t("invalidCode") });
      return;
    }
    try {
      await claim.mutateAsync(normalized);
      setCode("");
      setNotice({ kind: "success", text: t("claimedSuccess") });
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    }
  }

  async function toggleCoupon(id: string, isActive: boolean) {
    setNotice(null);
    setBusyId(id);
    try {
      await activation.mutateAsync({ id, isActive });
      setNotice({ kind: "success", text: isActive ? t("activatedSuccess") : t("deactivatedSuccess") });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof ApiError && error.status === 400 ? t("notApplicable") : t("genericError") });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
      <ProfileSidebar />
      <div className="min-w-0">
        <div className="mx-auto w-full max-w-[1080px] px-5 py-7 sm:px-8 sm:py-10">
          <header className="max-w-[68ch]">
            <ProfileBackLink />
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-danger-soft text-brand"><TicketPercent className="size-5" aria-hidden="true" /></div>
            <h1 className="text-[27px] font-semibold tracking-[-0.025em] sm:text-[32px]">{t("title")}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-body">{t("subtitle")}</p>
          </header>

          <section className="mt-8 overflow-hidden rounded-2xl bg-brand text-ink shadow-[0_14px_34px_rgba(102,192,242,0.2)]" aria-labelledby="claim-coupon-title">
            <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] md:items-end">
              <div>
                <Gift className="size-6 text-white/75" aria-hidden="true" />
                <h2 id="claim-coupon-title" className="mt-4 text-xl font-bold tracking-[-0.02em]">{t("claimTitle")}</h2>
                <p className="mt-1 max-w-[55ch] text-xs leading-5 text-white/80">{t("claimDescription")}</p>
              </div>
              <div>
                <label htmlFor="coupon-code" className="text-xs font-bold text-white">{t("codeLabel")}</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input id="coupon-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void claimCode(); } }} maxLength={64} autoComplete="off" spellCheck={false} placeholder={t("codePlaceholder")} className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/25 bg-white px-4 font-mono text-sm font-bold uppercase tracking-[0.08em] text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-white focus:ring-4 focus:ring-white/20" />
                  <button type="button" onClick={() => void claimCode()} disabled={claim.isPending || !code.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-white px-6 text-sm font-bold text-brand transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">{claim.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{claim.isPending ? t("claiming") : t("claim")}</button>
                </div>
              </div>
            </div>
          </section>

          {notice ? <p role={notice.kind === "error" ? "alert" : "status"} className={`mt-4 rounded-xl px-4 py-3 text-xs font-medium ${notice.kind === "error" ? "bg-danger-soft text-danger" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>{notice.text}</p> : null}

          <section className="mt-9" aria-labelledby="claimed-coupons-title">
            <div className="flex items-end justify-between gap-4">
              <div><h2 id="claimed-coupons-title" className="text-xl font-bold tracking-[-0.02em] text-ink">{t("claimedTitle")}</h2><p className="mt-1 text-xs text-body">{t("claimedDescription")}</p></div>
              {items.length ? <span className="text-xs font-semibold text-muted">{t("couponCount", { count: coupons.data?.pages[0]?.total ?? items.length })}</span> : null}
            </div>

            {coupons.isPending ? <div className="grid min-h-56 place-items-center" role="status"><span className="flex items-center gap-2 text-sm text-muted"><LoaderCircle className="size-5 animate-spin text-brand" aria-hidden="true" />{t("loading")}</span></div> : coupons.isError ? <div className="mt-5 rounded-2xl border border-line bg-card p-7 text-center"><SearchX className="mx-auto size-7 text-brand" aria-hidden="true" /><p className="mt-3 text-sm font-bold text-ink">{t("loadError")}</p><button type="button" onClick={() => void coupons.refetch()} className="mt-4 rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-ink">{t("retry")}</button></div> : items.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-line bg-card p-8 text-center"><TicketPercent className="mx-auto size-8 text-muted" aria-hidden="true" /><h3 className="mt-3 text-sm font-bold text-ink">{t("emptyTitle")}</h3><p className="mx-auto mt-1 max-w-[48ch] text-xs leading-5 text-body">{t("emptyDescription")}</p></div> : <div className="mt-5 grid gap-4">{items.map((coupon) => <CouponListItem key={coupon.id} coupon={coupon} isBusy={activation.isPending && busyId === coupon.id} onToggle={(selected) => void toggleCoupon(selected.id, !selected.is_active)} />)}</div>}

            {coupons.hasNextPage ? <div className="mt-6 text-center"><button type="button" onClick={() => void coupons.fetchNextPage()} disabled={coupons.isFetchingNextPage} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-card px-6 text-xs font-bold text-ink hover:border-brand/30 disabled:opacity-55">{coupons.isFetchingNextPage ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{t("loadMore")}</button></div> : null}
          </section>
        </div>
      </div>
    </main>
  );
}

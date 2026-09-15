"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, CalendarClock, Check, Eye, LoaderCircle, ReceiptText, RefreshCw, Star, X } from "lucide-react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";

import { Icon } from "@/components/shared/brand/Icon";
import { profileApi } from "@/modules/account/api/profile";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";

import { ordersApi } from "../api/orders";
import { deliveryQueryKeys } from "../queries/queryKeys";
import type { OrderCard } from "../types/orders";

type OrdersTab = "active" | "past" | "scheduled";
type SortOrder = "latest" | "oldest";

const observedStages = new Map<string, number>();

function rawOrderStatus(order: OrderCard) {
  return String(order.status ?? order.orderStatus ?? "pending").toLowerCase();
}

function uniqueOrders(pages: Array<{ items: OrderCard[] }>) {
  const orders = new Map<string, OrderCard>();
  pages.flatMap((page) => page.items).forEach((order) => {
    orders.set(order.orderId, order);
  });
  return [...orders.values()];
}

export function OrdersExperience() {
  const t = useTranslations("deliveries.orders");
  const format = useFormatter();
  const [tab, setTab] = useState<OrdersTab>("active");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [reviewOrder, setReviewOrder] = useState<OrderCard | null>(null);
  const [reviewReadOnly, setReviewReadOnly] = useState(false);

  const query = useInfiniteQuery({
    queryKey: deliveryQueryKeys.orderList(tab),
    queryFn: ({ pageParam, signal }) => ordersApi.list(tab, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    refetchInterval: tab === "active" ? 5_000 : tab === "scheduled" ? 30_000 : false,
    refetchIntervalInBackground: tab !== "past",
  });
  const summary = useQuery({
    queryKey: ["profile", "summary"],
    queryFn: profileApi.summary,
    refetchInterval: 30_000,
  });

  const loadedOrders = useMemo(
    () => uniqueOrders(query.data?.pages ?? []),
    [query.data?.pages],
  );
  const orders = useMemo(
    () => loadedOrders
      .filter((order) => statusFilter === "all" || rawOrderStatus(order) === statusFilter)
      .sort((a, b) => sortOrder === "latest"
        ? +new Date(b.orderedAt) - +new Date(a.orderedAt)
        : +new Date(a.orderedAt) - +new Date(b.orderedAt)),
    [loadedOrders, sortOrder, statusFilter],
  );
  const totalOrders = query.data?.pages[0]?.total ?? loadedOrders.length;

  function changeTab(nextTab: OrdersTab) {
    setTab(nextTab);
    setStatusFilter("all");
    setSortOrder(nextTab === "scheduled" ? "oldest" : "latest");
    setExpanded(null);
  }

  return (
    <div className="min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <main className="min-w-0 overflow-y-auto overflow-x-hidden bg-background px-4 py-6 min-[600px]:px-5 min-[900px]:px-10">
        <div className="mx-auto max-w-[980px]">
          <section className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand px-5 py-5 text-ink shadow-card min-[600px]:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/15">
                <ReceiptText aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-white/80">{t("totalSpent")}</p>
                <strong className="mt-0.5 block text-2xl font-bold tabular-nums">
                  {formatAppCurrency(
                    format,
                    Number(summary.data?.data?.delivered_spend ?? 0),
                  )}
                </strong>
              </div>
            </div>
            {summary.isPending ? (
              <span aria-label={t("loadingSummary")} className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white" role="status" />
            ) : null}
          </section>

          <h1 className="text-2xl font-bold tracking-[-0.025em] text-ink">{t("title")}</h1>
          <div className="mt-4 flex gap-5 overflow-x-auto border-b border-line sm:gap-7">
            <button className={`min-h-11 whitespace-nowrap border-b-2 px-1 text-sm font-semibold transition-colors ${tab === "active" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`} onClick={() => changeTab("active")} type="button">
              {t("ongoing")}
            </button>
            <button className={`min-h-11 whitespace-nowrap border-b-2 px-1 text-sm font-semibold transition-colors ${tab === "past" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`} onClick={() => changeTab("past")} type="button">
              {t("past")}
            </button>
            <button className={`min-h-11 whitespace-nowrap border-b-2 px-1 text-sm font-semibold transition-colors ${tab === "scheduled" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`} onClick={() => changeTab("scheduled")} type="button">
              {t("scheduled")}
            </button>
          </div>

          <div className="my-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex flex-wrap gap-2">
              {tab !== "scheduled" ? <>
                <label className="sr-only" htmlFor="order-status-filter">{t("statusFilter")}</label>
                <select className="min-h-10 rounded-lg border border-line bg-card px-3 text-xs text-ink shadow-sm" id="order-status-filter" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                  <option value="all">{t("allStatuses")}</option>
                  {tab === "past" ? (
                  <>
                    <option value="delivered">{t("status.delivered")}</option>
                    <option value="cancelled">{t("status.cancelled")}</option>
                    <option value="rejected">{t("status.rejected")}</option>
                  </>
                ) : (
                  <>
                    <option value="pending">{t("status.pending")}</option>
                    <option value="preparing">{t("status.preparing")}</option>
                    <option value="ready">{t("status.ready")}</option>
                    <option value="picked_up">{t("status.pickedUp")}</option>
                    <option value="out_for_delivery">{t("status.outForDelivery")}</option>
                  </>
                  )}
                </select>
              </> : null}
              <label className="sr-only" htmlFor="order-sort">{t("sortLabel")}</label>
              <select className="min-h-10 rounded-lg border border-line bg-card px-3 text-xs text-ink shadow-sm" id="order-sort" onChange={(event) => setSortOrder(event.target.value as SortOrder)} value={sortOrder}>
                <option value="latest">{tab === "scheduled" ? t("scheduledLatest") : t("latestFirst")}</option>
                <option value="oldest">{tab === "scheduled" ? t("scheduledSoonest") : t("oldestFirst")}</option>
              </select>
            </div>
            <span className="text-xs text-muted">{t("showingOrders", { shown: loadedOrders.length, total: totalOrders })}</span>
          </div>

          {query.isPending ? <OrdersSkeleton /> : null}
          {query.isError && !query.data ? (
            <div className="rounded-xl bg-card p-8 text-center shadow-card">
              <p className="text-sm font-medium text-danger">{t("loadError")}</p>
              <button className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-ink transition-colors hover:bg-brand/85" onClick={() => void query.refetch()} type="button">
                <RefreshCw aria-hidden="true" className="size-4" />
                {t("retry")}
              </button>
            </div>
          ) : null}
          {!query.isPending && query.data && orders.length === 0 ? (
            <div className="rounded-xl bg-card p-10 text-center shadow-card">
              <p className="font-semibold text-ink">{tab === "scheduled" ? t("scheduledEmptyTitle") : t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted">{tab === "scheduled" ? t("scheduledEmptyMessage") : statusFilter === "all" ? t("emptyMessage") : t("emptyFilteredMessage")}</p>
            </div>
          ) : null}

          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow
                expanded={expanded === order.orderId}
                key={order.orderId}
                onRate={(viewOnly) => {
                  setReviewReadOnly(viewOnly);
                  setReviewOrder(order);
                }}
                onToggle={() => setExpanded(expanded === order.orderId ? null : order.orderId)}
                order={order}
                past={tab === "past"}
                scheduled={tab === "scheduled"}
              />
            ))}
          </div>

          {query.hasNextPage ? (
            <div className="py-7 text-center">
              {query.isFetchNextPageError ? <p className="mb-3 text-sm font-medium text-danger" role="alert">{t("loadMoreError")}</p> : null}
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand/30 bg-card px-6 text-sm font-bold text-brand transition-[background-color,border-color] hover:border-brand hover:bg-brand/5 disabled:cursor-wait disabled:opacity-60" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} type="button">
                {query.isFetchingNextPage ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ArrowDown aria-hidden="true" className="size-4" />}
                {query.isFetchingNextPage ? t("loadingMore") : t("loadMore")}
              </button>
            </div>
          ) : loadedOrders.length > 0 ? (
            <p className="py-7 text-center text-xs text-muted">{t("allLoaded")}</p>
          ) : null}
        </div>
      </main>

      {reviewOrder ? <ReviewModal onClose={() => setReviewOrder(null)} order={reviewOrder} readOnly={reviewReadOnly} /> : null}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      {[0, 1, 2].map((item) => <div className="h-36 animate-pulse rounded-xl bg-card shadow-card" key={item} />)}
    </div>
  );
}

interface OrderRowProps {
  order: OrderCard;
  past: boolean;
  scheduled: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRate: (viewOnly: boolean) => void;
}

function OrderRow({ order, past, scheduled, expanded, onToggle, onRate }: OrderRowProps) {
  const t = useTranslations("deliveries.orders");
  const format = useFormatter();
  const rawStatus = rawOrderStatus(order);
  const name = order.store?.name ?? order.storeName ?? t("storeFallback");
  const image = order.store?.logo ?? order.store?.image ?? order.storeLogo ?? order.storeImage;
  const address = order.deliveryDetails?.address ?? order.deliveryAddress ?? t("notAvailable");
  const reviewQuery = useQuery({
    queryKey: deliveryQueryKeys.orderReview(order.orderId),
    queryFn: ({ signal }) => ordersApi.reviewDetails(order.orderId, signal),
    enabled: rawStatus === "delivered",
    staleTime: 30_000,
  });
  const reviewed = Boolean(reviewQuery.data?.is_reviewed);
  const mappedStage = rawStatus === "delivered" ? 3 : ["out_for_delivery", "arrived", "picked_up", "rider_assigned"].includes(rawStatus) ? 2 : ["preparing", "ready"].includes(rawStatus) ? 1 : 0;
  const activeStage = Math.max(observedStages.get(order.orderId) ?? 0, mappedStage);
  observedStages.set(order.orderId, activeStage);

  const status = (() => {
    switch (rawStatus) {
      case "delivered": return t("status.delivered");
      case "cancelled": return t("status.cancelled");
      case "rejected": return t("status.rejected");
      case "scheduled": return t("status.scheduled");
      case "preparing": return t("status.preparing");
      case "ready": return t("status.ready");
      case "picked_up": return t("status.pickedUp");
      case "out_for_delivery": return t("status.outForDelivery");
      default: return t("status.pending");
    }
  })();

  return (
    <article className="overflow-hidden rounded-xl bg-card shadow-card">
      <div className="grid gap-4 p-4 min-[800px]:grid-cols-[1.2fr_0.9fr_1fr_auto] min-[800px]:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-12 flex-none overflow-hidden rounded-lg bg-soft-surface">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="size-full object-cover" />
            ) : <Icon name="store" className="m-3.5 size-5 text-brand" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-brand">{t("orderId", { id: order.orderCode ?? order.orderId.slice(0, 8).toUpperCase() })}</p>
            <p className="truncate font-semibold text-ink">{name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted">
              {scheduled ? <CalendarClock aria-hidden="true" className="size-3 shrink-0 text-brand" /> : null}
              {scheduled
                ? t("scheduledFor", { date: format.dateTime(new Date(order.orderedAt), { dateStyle: "medium", timeStyle: "short" }) })
                : format.dateTime(new Date(order.orderedAt), { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{t("items")}</p>
          <p className="line-clamp-2 text-xs text-body">{order.itemsSummary ?? t("noItems")}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{t("deliveryAddress")}</p>
          <p className="line-clamp-2 text-xs text-body" title={address}>{address}</p>
        </div>
        <div className="min-[800px]:text-right">
          <p className="text-[10px] text-muted">{t("totalAmount")}</p>
          <p className="font-bold tabular-nums text-ink">{formatAppCurrency(format, Number(order.totalAmount ?? order.orderPrice ?? 0))}</p>
          <span className="mt-1 inline-flex rounded-full bg-brand/10 px-2.5 py-1 text-[9px] font-bold uppercase text-brand">{status}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <Link className="inline-flex min-h-9 items-center gap-2 rounded-full bg-brand px-4 text-[11px] font-bold text-ink transition-colors hover:bg-brand/85" href={`/orders/${order.orderId}`}>
          <Eye aria-hidden="true" className="size-3.5" />
          {t("viewDetails")}
        </Link>
        {!past && !scheduled ? (
          <button className="min-h-9 rounded-full border border-brand/30 px-4 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/5" onClick={onToggle} type="button">
            {expanded ? t("hideTracking") : t("trackOrder")}
          </button>
        ) : rawStatus === "delivered" ? (
          <button className="min-h-9 rounded-full border border-brand/30 px-4 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/5 disabled:cursor-wait disabled:opacity-55" disabled={reviewQuery.isPending} onClick={() => onRate(reviewed)} type="button">
            {reviewQuery.isPending ? t("checkingReview") : reviewed ? t("viewReview") : t("rateOrder")}
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="border-t border-line px-5 py-4">
          <p className="font-semibold text-ink">{t("orderStatus")}</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[t("progress.placed"), t("progress.inProgress"), t("progress.onWay"), t("progress.delivered")].map((stage, index) => (
              <div className="text-center text-[10px] text-muted" key={stage}>
                <span className={`mx-auto mb-2 block size-3 rounded-full ${index <= activeStage ? "bg-brand" : "bg-soft-surface"}`} />
                <span>{stage}</span>
                {index === activeStage ? <small className="mt-1 block font-semibold uppercase text-brand">{t("currentStage")}</small> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

interface ReviewModalProps {
  order: OrderCard;
  readOnly?: boolean;
  onClose: () => void;
}

function ReviewModal({ order, readOnly = false, onClose }: ReviewModalProps) {
  const t = useTranslations("deliveries.orders");
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const name = order.store?.name ?? order.storeName ?? t("storeFallback");
  const image = order.store?.logo ?? order.store?.image ?? order.storeLogo ?? order.storeImage;
  const existing = useQuery({
    queryKey: deliveryQueryKeys.orderReview(order.orderId),
    queryFn: ({ signal }) => ordersApi.reviewDetails(order.orderId, signal),
    enabled: readOnly,
  });
  const displayStars = Math.max(0, Math.min(5, existing.data?.review_detail?.rating ?? stars));
  const displayText = existing.data?.review_detail?.description ?? text;
  const isConfirmation = saved || readOnly;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, submitting]);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setHasSubmitError(false);
    try {
      await ordersApi.review({ orderId: order.orderId, rating: stars, description: text.trim() || undefined });
      await queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderReview(order.orderId) });
      setSaved(true);
    } catch {
      setHasSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    if (!submitting) onClose();
  }

  return (
    <div aria-labelledby="order-review-title" aria-modal="true" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) closeModal(); }} role="dialog">
      <div className="relative max-h-[94svh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-card p-6 shadow-pop sm:p-7">
        <h2 className="sr-only" id="order-review-title">{readOnly ? t("yourReview") : t("rateOrder")}</h2>
        <button aria-label={t("closeReview")} autoFocus className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-soft-surface hover:text-ink disabled:cursor-wait disabled:opacity-50" disabled={submitting} onClick={closeModal} type="button">
          <X aria-hidden="true" className="size-5" />
        </button>

        {readOnly && existing.isPending ? (
          <div className="grid min-h-72 place-items-center" role="status">
            <span className="flex items-center gap-2 text-sm font-medium text-muted"><LoaderCircle aria-hidden="true" className="size-5 animate-spin text-brand" />{t("loadingReview")}</span>
          </div>
        ) : readOnly && existing.isError ? (
          <div className="py-14 text-center">
            <p className="font-semibold text-danger">{t("reviewLoadError")}</p>
            <button className="mt-4 min-h-10 rounded-full bg-brand px-5 text-sm font-semibold text-ink" onClick={() => void existing.refetch()} type="button">{t("retry")}</button>
          </div>
        ) : isConfirmation ? (
          <div className="pb-2 pt-7 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success"><Check aria-hidden="true" className="size-8" /></div>
            <h3 className="mt-5 text-2xl font-bold tracking-[-0.025em] text-ink">{readOnly ? t("yourReview") : t("reviewThanks")}</h3>
            <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-muted">{readOnly ? displayText || t("reviewShared") : t("reviewSubmitted")}</p>
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-soft-surface p-3 text-left">
              <div className="size-12 flex-none overflow-hidden rounded-lg bg-card">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="size-full object-cover" />
                ) : <Icon name="store" className="m-3.5 size-5 text-brand" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{name}</p>
                <p className="truncate text-xs text-muted">{t("deliveredOrder", { id: order.orderCode ?? order.orderId.slice(0, 8).toUpperCase() })}</p>
              </div>
              <span aria-label={t("ratingValue", { rating: displayStars })} className="flex flex-none gap-0.5 text-brand">
                {Array.from({ length: displayStars }, (_, index) => <Star aria-hidden="true" className="size-4 fill-current" key={index} />)}
              </span>
            </div>
            <button className="mt-6 min-h-11 w-full rounded-full bg-brand px-5 text-sm font-bold text-ink transition-colors hover:bg-brand/85" onClick={closeModal} type="button">{t("done")}</button>
          </div>
        ) : (
          <>
            <div className="pr-12">
              <h3 className="text-xl font-bold text-ink">{t("rateOrder")}</h3>
              <p className="mt-1 text-sm text-muted">{t("shareExperience")}</p>
            </div>
            <div className="my-7 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button aria-label={t("setRating", { rating })} className={`grid size-11 place-items-center rounded-full transition-colors ${rating <= stars ? "bg-brand/10 text-brand" : "bg-soft-surface text-muted hover:text-brand"}`} disabled={submitting} key={rating} onClick={() => setStars(rating)} type="button">
                  <Star aria-hidden="true" className={`size-6 ${rating <= stars ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-soft-surface p-4">
              <p className="font-semibold text-ink">{name}</p>
              <p className="mt-0.5 text-xs text-muted">{t("ratingQuestion")}</p>
            </div>
            <label className="sr-only" htmlFor="order-review-text">{t("reviewLabel")}</label>
            <textarea className="mt-5 min-h-28 w-full resize-y rounded-xl border border-line bg-card p-3 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15" disabled={submitting} id="order-review-text" maxLength={500} onChange={(event) => setText(event.target.value)} placeholder={t("reviewPlaceholder")} value={text} />
            {hasSubmitError ? <p className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">{t("reviewSubmitError")}</p> : null}
            <button className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-ink transition-colors hover:bg-brand/85 disabled:cursor-wait disabled:opacity-65" disabled={submitting} onClick={() => void submit()} type="button">
              {submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
              {submitting ? t("submittingReview") : t("submitReview")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

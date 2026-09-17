"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { formatAppCurrency } from "@/config/currency";

import { AddCardModal } from "@/modules/account/components/profile/AddCardModal";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import {
  useActiveCurrencyQuery,
  useCreateSavedCardSetupIntentMutation,
  useSavedCardsQuery,
  useSessionQuery,
  useSetDefaultSavedCardMutation,
  useWalletQuery,
  useWalletTransactionsQuery,
} from "@/modules/account/queries/useAccountQueries";
import type {
  SavedCard,
  WalletTransaction,
} from "@/modules/account/types";

const FALLBACK_CURRENCY_SYMBOL = "₡";

function formatExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

function formatMoney(
  amount: number,
  symbol: string,
  format: ReturnType<typeof useFormatter>,
) {
  return `${format.number(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}${symbol}`;
}

function isCreditTransaction(type: string) {
  const normalized = type.toLowerCase();
  return (
    normalized === "deposit" ||
    normalized === "credit" ||
    normalized === "migrationopeningbalance"
  );
}

function transactionTitle(
  transaction: WalletTransaction,
  t: ReturnType<typeof useTranslations<"wallet">>,
) {
  switch (transaction.type.toLowerCase()) {
    case "deposit":
      return t("transactionTopUp");
    case "debit":
      return t("transactionOrderPayment");
    case "credit":
      return t("transactionRefund");
    case "migrationopeningbalance":
      return t("transactionMigratedOpeningBalance");
    case "withdrawal":
      return t("transactionWithdrawal");
    default:
      return t("transactionFallback");
  }
}

function SavedCardRow({
  card,
  isBusy,
  isCurrent,
  onSetDefault,
}: {
  card: SavedCard;
  isBusy: boolean;
  isCurrent: boolean;
  onSetDefault: () => void;
}) {
  const t = useTranslations("wallet");
  const brand = card.brand.trim().toUpperCase() || t("cardFallback");

  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-line py-3 last:border-b-0">
      <span className="grid size-11 flex-none place-items-center rounded-xl bg-soft-surface text-brand">
        <CreditCard aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink">{brand}</p>
          {card.isDefault ? (
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-bold uppercase text-success">
              {t("defaultCard")}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {t("cardDetails", {
            last4: card.last4,
            expiry: formatExpiry(card.expMonth, card.expYear),
          })}
        </p>
      </div>
      {!card.isDefault ? (
        <button
          className="min-h-9 flex-none rounded-full px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand/5 disabled:cursor-wait disabled:opacity-55"
          disabled={isBusy}
          onClick={onSetDefault}
          type="button"
        >
          {isCurrent ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            t("makeDefault")
          )}
        </button>
      ) : (
        <Check aria-hidden="true" className="size-4 flex-none text-success" />
      )}
    </div>
  );
}

function TransactionRow({
  currencySymbol,
  transaction,
}: {
  currencySymbol: string;
  transaction: WalletTransaction;
}) {
  const t = useTranslations("wallet");
  const format = useFormatter();
  const isCredit = isCreditTransaction(transaction.type);
  const amount = Math.abs(Number(transaction.amount) || 0);
  const parsedDate = new Date(transaction.createdAt);
  const hasValidDate = !Number.isNaN(parsedDate.getTime());
  const status = (() => {
    switch (transaction.status?.toLowerCase()) {
      case "approved":
        return t("approved");
      case "pending":
        return t("pending");
      case "failed":
      case "rejected":
        return t("failed");
      default:
        return t("completed");
    }
  })();

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-4 last:border-b-0">
      <span
        className={`grid size-10 place-items-center rounded-full ${
          isCredit
            ? "bg-success-soft text-success"
            : "bg-danger-soft text-danger"
        }`}
      >
        {isCredit ? (
          <ArrowDownLeft aria-hidden="true" className="size-5" />
        ) : (
          <ArrowUpRight aria-hidden="true" className="size-5" />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">
          {transactionTitle(transaction, t)}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>
            {hasValidDate
              ? format.dateTime(parsedDate, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : t("dateUnavailable")}
          </span>
          {transaction.orderId ? (
            <Link
              className="font-semibold text-brand underline-offset-2 hover:underline"
              href={`/orders/${transaction.orderId}`}
            >
              {t("viewOrder")}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-bold tabular-nums ${
            isCredit ? "text-success" : "text-ink"
          }`}
        >
          {isCredit ? "+" : "−"}
          {formatMoney(amount, currencySymbol, format)}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase text-muted">
          {status}
        </p>
      </div>
    </div>
  );
}

export function WalletDashboard() {
  const t = useTranslations("wallet");
  const format = useFormatter();
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const wallet = useWalletQuery(authenticated);
  const currency = useActiveCurrencyQuery(authenticated);
  const cards = useSavedCardsQuery(authenticated);
  const transactions = useWalletTransactionsQuery(authenticated);
  const setupIntent = useCreateSavedCardSetupIntentMutation();
  const setDefault = useSetDefaultSavedCardMutation();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardActionError, setCardActionError] = useState("");

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  const allTransactions = useMemo(() => {
    const byId = new Map<string, WalletTransaction>();
    transactions.data?.pages.forEach((page) => {
      page.transactions.forEach((transaction) => {
        byId.set(transaction.id, transaction);
      });
    });
    return [...byId.values()];
  }, [transactions.data?.pages]);
  const totalTransactions = transactions.data?.pages[0]?.total ?? 0;
  const savedCards = cards.data?.cards ?? [];
  const currencySymbol =
    currency.data?.symbol?.trim() || FALLBACK_CURRENCY_SYMBOL;

  function openAddCard() {
    setCardActionError("");
    setIsAddingCard(true);
    setupIntent.reset();
    setupIntent.mutate();
  }

  async function makeDefault(card: SavedCard) {
    setCardActionError("");
    try {
      await setDefault.mutateAsync(card.id);
    } catch {
      setCardActionError(t("defaultCardError"));
    }
  }

  if (session.isError) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
        <ProfileSidebar />
        <div className="grid min-h-[60vh] place-items-center px-5 text-center" role="alert">
          <div>
            <RefreshCw aria-hidden="true" className="mx-auto size-7 text-danger" />
            <p className="mt-3 font-semibold text-ink">{t("sessionError")}</p>
            <button className="mt-4 min-h-10 rounded-full bg-brand px-5 text-xs font-bold text-ink" onClick={() => void session.refetch()} type="button">{t("retry")}</button>
          </div>
        </div>
      </main>
    );
  }

  if (session.isPending || !authenticated) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr]">
        <ProfileSidebar />
        <div className="grid min-h-[60vh] place-items-center" role="status">
          <span className="flex items-center gap-3 text-sm font-medium text-muted">
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-brand" />
            {t("loading")}
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <div className="min-w-0 min-[1100px]:overflow-y-auto">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9">
          <header>
            <h1 className="text-[28px] font-bold tracking-[-0.025em] text-ink sm:text-[32px]">
              {t("title")}
            </h1>
            <p className="mt-1 max-w-[60ch] text-sm text-body">{t("subtitle")}</p>
          </header>

          <div className="mt-7 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <section className="relative min-h-52 overflow-hidden rounded-2xl bg-brand p-6 text-ink shadow-card sm:p-7">
              <span aria-hidden="true" className="absolute -right-14 -top-16 size-52 rounded-full border-[30px] border-white/10" />
              <span aria-hidden="true" className="absolute -bottom-20 right-24 size-44 rounded-full border-[22px] border-white/5" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-white/15">
                    <WalletCards aria-hidden="true" className="size-5" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
                    <ShieldCheck aria-hidden="true" className="size-4" />
                    {t("secureBalance")}
                  </span>
                </div>
                <div className="mt-10">
                  <p className="text-sm font-medium text-white/80">{t("availableBalance")}</p>
                  {wallet.isPending ? (
                    <div className="mt-2 h-10 w-40 animate-pulse rounded-lg bg-white/15" />
                  ) : wallet.isError ? (
                    <button className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-brand bg-white px-4 text-xs font-bold text-brand" onClick={() => void wallet.refetch()} type="button">
                      <RefreshCw aria-hidden="true" className="size-4" />
                      {t("retryBalance")}
                    </button>
                  ) : (
                    <strong className="mt-1 block text-4xl font-bold tracking-[-0.03em] tabular-nums sm:text-5xl">
                      {formatMoney(
                        Number(wallet.data?.data?.wallet_balance ?? 0),
                        currencySymbol,
                        format,
                      )}
                    </strong>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">{t("cardsTitle")}</h2>
                  <p className="mt-0.5 text-xs text-muted">{t("cardsSubtitle")}</p>
                </div>
                <Link aria-label={t("manageCards")} className="grid size-10 place-items-center rounded-full text-brand transition-colors hover:bg-brand/5" href="/profile/saved-cards">
                  <ChevronRight aria-hidden="true" className="size-5" />
                </Link>
              </div>

              {cards.isPending ? (
                <div className="mt-5" aria-live="polite" role="status">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand" />
                    <span>{t("loadingCards")}</span>
                  </div>
                  <div aria-hidden="true" className="mt-3 space-y-3">
                    {[0, 1].map((item) => (
                      <div
                        className="h-14 animate-pulse rounded-xl bg-[var(--soft-surface)]"
                        key={item}
                      />
                    ))}
                  </div>
                </div>
              ) : cards.isError ? (
                <div className="mt-5 rounded-xl bg-danger-soft p-4 text-sm text-danger" role="alert">
                  <p>{t("cardsError")}</p>
                  <button className="mt-2 font-bold underline underline-offset-2" onClick={() => void cards.refetch()} type="button">{t("retry")}</button>
                </div>
              ) : savedCards.length ? (
                <div className="mt-3">
                  {savedCards.slice(0, 3).map((card) => (
                    <SavedCardRow card={card} isBusy={setDefault.isPending} isCurrent={setDefault.isPending && setDefault.variables === card.id} key={card.id} onSetDefault={() => void makeDefault(card)} />
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-muted">{t("noCards")}</p>
              )}

              {cardActionError ? <p className="mt-3 text-xs font-medium text-danger" role="alert">{cardActionError}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-4 text-xs font-bold text-ink transition-colors hover:bg-brand/85 disabled:cursor-wait disabled:opacity-65" disabled={setupIntent.isPending} onClick={openAddCard} type="button">
                  {setupIntent.isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Plus aria-hidden="true" className="size-4" />}
                  {setupIntent.isPending ? t("preparingCard") : t("addCard")}
                </button>
                <Link className="inline-flex min-h-10 items-center rounded-full px-4 text-xs font-bold text-brand transition-colors hover:bg-brand/5" href="/profile/saved-cards">{t("manageCards")}</Link>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl bg-card p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">{t("transactionsTitle")}</h2>
                <p className="mt-0.5 text-xs text-muted">{t("transactionsSubtitle")}</p>
              </div>
              {totalTransactions > 0 ? <span className="rounded-full bg-soft-surface px-3 py-1 text-xs font-semibold text-body">{t("transactionCount", { count: totalTransactions })}</span> : null}
            </div>

            {transactions.isPending ? (
              <div className="py-5" aria-live="polite" role="status">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted">
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand" />
                  <span>{t("loadingTransactions")}</span>
                </div>
                <div aria-hidden="true" className="mt-4 space-y-2">
                  {[0, 1, 2].map((item) => (
                    <div
                      className="h-[72px] animate-pulse rounded-xl bg-[var(--soft-surface)]"
                      key={item}
                    />
                  ))}
                </div>
              </div>
            ) : transactions.isError && !transactions.data ? (
              <div className="py-12 text-center" role="alert">
                <RefreshCw aria-hidden="true" className="mx-auto size-7 text-danger" />
                <p className="mt-3 text-sm font-semibold text-ink">{t("transactionsError")}</p>
                <button className="mt-4 min-h-10 rounded-full bg-brand px-5 text-xs font-bold text-ink" onClick={() => void transactions.refetch()} type="button">{t("retry")}</button>
              </div>
            ) : allTransactions.length ? (
              <div>
                {allTransactions.map((transaction) => (
                  <TransactionRow
                    currencySymbol={currencySymbol}
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
                {transactions.hasNextPage ? (
                  <div className="pt-5 text-center">
                    {transactions.isFetchNextPageError ? <p className="mb-3 text-xs font-medium text-danger" role="alert">{t("moreTransactionsError")}</p> : null}
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brand/30 px-5 text-xs font-bold text-brand transition-colors hover:bg-brand/5 disabled:cursor-wait disabled:opacity-60" disabled={transactions.isFetchingNextPage} onClick={() => void transactions.fetchNextPage()} type="button">
                      {transactions.isFetchingNextPage ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ReceiptText aria-hidden="true" className="size-4" />}
                      {transactions.isFetchingNextPage ? t("loadingMore") : t("loadMore")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-soft-surface text-muted"><ReceiptText aria-hidden="true" className="size-6" /></span>
                <h3 className="mt-4 font-bold text-ink">{t("emptyTransactionsTitle")}</h3>
                <p className="mx-auto mt-1 max-w-[42ch] text-sm text-muted">{t("emptyTransactionsDescription")}</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <AddCardModal
        error={setupIntent.isError ? t("prepareCardError") : ""}
        isLoading={setupIntent.isPending}
        onClose={() => setIsAddingCard(false)}
        onSaved={() => {
          setIsAddingCard(false);
          void cards.refetch();
        }}
        open={isAddingCard}
        setupIntent={setupIntent.data}
      />
    </main>
  );
}

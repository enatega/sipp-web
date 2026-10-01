"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionToast } from "@/components/shared/useActionToast";
import { AddCardModal } from "@/modules/account/components/profile/AddCardModal";
import { ProfileSidebar } from "@/modules/account/components/profile/ProfileSidebar";
import { ProfileBackLink } from "@/modules/account/components/profile/ProfileBackLink";
import {
  useCreateSavedCardSetupIntentMutation,
  useRemoveSavedCardMutation,
  useSavedCardsQuery,
  useSessionQuery,
  useSetDefaultSavedCardMutation,
} from "@/modules/account/queries/useAccountQueries";
import type { SavedCard } from "@/modules/account/types";

function formatExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

function CardBrand({ brand, isDefault }: { brand: string; isDefault: boolean }) {
  const normalized = brand.toLowerCase();
  if (normalized === "mastercard") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-[#df7519] px-2 py-1 text-[7px] font-bold tracking-[0.05em] text-white">
        <span className="relative flex size-3.5" aria-hidden="true">
          <span className="absolute left-0 top-0 size-3.5 rounded-full bg-[#ed1c24]" />
          <span className="absolute right-0 top-0 size-3.5 rounded-full bg-[#f79e1b]/90" />
        </span>
        MASTERCARD
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[8px] font-bold tracking-[0.06em] ${
        isDefault ? "bg-[#143b78] text-white" : "bg-[#df7519] text-white"
      }`}
    >
      <CreditCard className="size-3" aria-hidden="true" />
      {brand.toUpperCase()}
    </span>
  );
}

interface PaymentCardProps {
  card: SavedCard;
  isBusy: boolean;
  onRemove: () => void;
  onSetDefault: () => void;
}

function PaymentCard({
  card,
  isBusy,
  onRemove,
  onSetDefault,
}: PaymentCardProps) {
  const t = useTranslations("savedCards");
  const brand = card.brand.trim().toUpperCase() || t("card");

  return (
    <article
      className={`relative flex h-[170px] min-h-0 flex-col overflow-hidden rounded-xl border p-4 shadow-[0_10px_30px_rgba(35,22,26,0.07)] transition-transform hover:-translate-y-0.5 sm:p-4 ${
        card.isDefault
          ? "border-brand bg-brand text-ink"
          : "border-brand bg-card text-foreground"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-h-6 items-center gap-2">
          {card.isDefault ? (
            <span className="rounded bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-brand">
              {t("primary")}
            </span>
          ) : (
            <span
              className="grid size-5 place-items-center rounded-full border border-current opacity-40"
              aria-hidden="true"
            >
              <CreditCard className="size-3" />
            </span>
          )}
        </div>
        <CardBrand brand={brand} isDefault={card.isDefault} />
      </div>

      <p className="mt-2 font-mono text-[12px] tracking-[0.15em] sm:text-[13px]">
        •••• •••• •••• {card.last4}
      </p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <div>
          <span className={`block text-[7px] uppercase tracking-[0.08em] ${card.isDefault ? "text-white/70" : "text-muted"}`}>
            {t("cardNumberEnding")}
          </span>
          <strong className="mt-0.5 block text-[10px] font-semibold">
            {t("endingIn", { last4: card.last4 })}
          </strong>
        </div>
        <div className="text-right">
          <span className={`block text-[7px] uppercase tracking-[0.08em] ${card.isDefault ? "text-white/70" : "text-muted"}`}>
            {t("expires")}
          </span>
          <strong className="mt-0.5 block text-[10px] font-semibold">
            {formatExpiry(card.expMonth, card.expYear)}
          </strong>
        </div>
      </div>

      <div className={`mt-2 flex justify-end gap-2 border-t pt-1 ${card.isDefault ? "border-white/20" : "border-line"}`}>
        {!card.isDefault ? (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={isBusy}
            className="inline-flex min-h-6 items-center gap-1 rounded-full px-1.5 text-[7px] font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
          >
            <Check className="size-3" aria-hidden="true" />
            {t("setPrimary")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          disabled={isBusy}
          className={`inline-flex min-h-6 items-center gap-1 rounded-full px-1.5 text-[7px] font-semibold transition-colors disabled:opacity-50 ${
            card.isDefault
              ? "text-white hover:bg-white/10"
              : "text-brand hover:bg-brand/10"
          }`}
        >
          <Trash2 className="size-3" aria-hidden="true" />
          {t("remove")}
        </button>
      </div>
    </article>
  );
}

export function SavedCards() {
  const t = useTranslations("savedCards");
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const cards = useSavedCardsQuery(authenticated);
  const setupIntent = useCreateSavedCardSetupIntentMutation();
  const removeCard = useRemoveSavedCardMutation();
  const setDefault = useSetDefaultSavedCardMutation();
  const [isAdding, setIsAdding] = useState(false);
  const notify = useActionToast();

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  const openAddCard = () => {
    setIsAdding(true);
    setupIntent.reset();
    setupIntent.mutate();
  };

  const remove = async (card: SavedCard) => {
    if (!window.confirm(t("removeConfirmation", { last4: card.last4 }))) return;
    try {
      await removeCard.mutateAsync(card.id);
      notify.success("cardRemoved");
    } catch (caught) {
      notify.error(caught, "cardRemoveFailed");
    }
  };

  const makeDefault = async (card: SavedCard) => {
    try {
      await setDefault.mutateAsync(card.id);
      notify.success("defaultCardUpdated");
    } catch (caught) {
      notify.error(caught, "defaultCardUpdateFailed");
    }
  };

  const loading = session.isPending || (authenticated && cards.isPending);
  const isCardActionPending = removeCard.isPending || setDefault.isPending;

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground md:min-h-[calc(100svh-4.75rem)] min-[700px]:grid min-[700px]:grid-cols-[240px_1fr] min-[1100px]:h-[calc(100svh-4.75rem)] min-[1100px]:overflow-hidden">
      <ProfileSidebar />
      <div className="min-w-0 min-[1100px]:overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-7 sm:px-8 sm:py-10">
          <header className="mb-7">
            <ProfileBackLink />
            <h1 className="text-[25px] font-semibold tracking-[-0.025em] sm:text-[29px]">
              {t("title")}
            </h1>
            <p className="mt-1 text-[12px] text-body">{t("subtitle")}</p>
          </header>

          {loading ? (
            <div className="grid min-h-72 place-items-center" role="status">
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <LoaderCircle className="size-5 animate-spin text-brand" />
                {t("loading")}
              </div>
            </div>
          ) : cards.isError ? (
            <div role="alert" className="rounded-xl bg-card p-6 text-[13px] text-brand shadow-card">
              <p>{t("loadError")}</p>
              <button
                type="button"
                onClick={() => void cards.refetch()}
                className="mt-4 rounded-full bg-brand px-5 py-2.5 text-[11px] font-semibold text-ink"
              >
                {t("retry")}
              </button>
            </div>
          ) : authenticated ? (
            <>
              <section
                aria-label={t("paymentMethods")}
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                <button
                  type="button"
                  onClick={openAddCard}
                  className="group flex h-[170px] min-h-0 flex-col items-center justify-center rounded-xl border border-dashed border-brand bg-card px-4 text-center transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:bg-brand/10"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-brand/10 text-brand transition-transform group-hover:scale-105">
                    <Plus className="size-5" aria-hidden="true" />
                  </span>
                  <strong className="mt-4 text-[13px] font-semibold">
                    {t("addNew")}
                  </strong>
                  <span className="mt-1 text-[10px] text-muted">
                    {t("addDescription")}
                  </span>
                </button>

                {(cards.data?.cards ?? []).map((card) => (
                  <PaymentCard
                    key={card.id}
                    card={card}
                    isBusy={isCardActionPending}
                    onRemove={() => void remove(card)}
                    onSetDefault={() => void makeDefault(card)}
                  />
                ))}
              </section>

              {!cards.data?.cards.length ? (
                <p className="mt-5 text-center text-xs text-muted">
                  {t("empty")}
                </p>
              ) : null}

              <section className="mt-10 flex items-start gap-4 rounded-xl border border-[#d7eee6] bg-[#f0fbf7] p-5 text-[#145f49] dark:border-[#285647] dark:bg-[#18342b] dark:text-[#8ee0c3] sm:p-6">
                <span className="grid size-11 flex-none place-items-center rounded-xl bg-white/75 dark:bg-white/10">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[12px] font-semibold">
                    {t("securityTitle")}
                  </h2>
                  <p className="mt-1 max-w-[75ch] text-[10px] leading-[1.7] opacity-80">
                    {t("securityDescription")}
                  </p>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </div>

      <AddCardModal
        open={isAdding}
        setupIntent={setupIntent.data}
        isLoading={setupIntent.isPending}
        error={setupIntent.isError ? t("prepareError") : ""}
        onClose={() => setIsAdding(false)}
        onSaved={() => {
          setIsAdding(false);
          void cards.refetch();
        }}
      />
    </main>
  );
}

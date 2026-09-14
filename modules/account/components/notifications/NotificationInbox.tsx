"use client";

import Link from "next/link";
import { Bell, CheckCheck, LoaderCircle, RefreshCw, Settings2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSessionQuery } from "@/modules/account";
import { useMarkAllNotificationsReadMutation, useNotificationInboxQuery } from "@/modules/account/queries/useNotificationInboxQueries";
import type { InboxNotification } from "@/modules/account/types/notifications";

function NotificationRow({ item, period }: { item: InboxNotification; period: "today" | "past" }) {
  const format = useFormatter();
  const t = useTranslations("notificationInbox");
  const date = new Date(item.createdAt);
  return (
    <article className={`grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-4 sm:gap-4 sm:py-5 ${item.isRead ? "" : "bg-brand/[0.035]"}`}>
      <span className={`ml-3 mt-0.5 grid size-10 place-items-center rounded-xl sm:ml-5 ${item.isRead ? "bg-[var(--soft-surface)] text-muted" : "bg-danger-soft text-brand"}`}>
        <Bell className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 pr-3 sm:pr-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`text-sm leading-5 text-ink ${item.isRead ? "font-semibold" : "font-bold"}`}>{item.title}</h3>
          <time className="shrink-0 text-[10px] font-medium tabular-nums text-muted" dateTime={item.createdAt}>
            {period === "today"
              ? format.dateTime(date, { hour: "numeric", minute: "2-digit" })
              : format.dateTime(date, { day: "numeric", month: "short", year: "numeric" })}
          </time>
        </div>
        <p className="mt-1 max-w-[70ch] text-xs leading-5 text-body">{item.description}</p>
        {!item.isRead ? <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-brand"><span className="size-1.5 rounded-full bg-brand" />{t("unread")}</span> : null}
      </div>
    </article>
  );
}

function InboxSection({ period, enabled }: { period: "today" | "past"; enabled: boolean }) {
  const t = useTranslations("notificationInbox");
  const query = useNotificationInboxQuery(period, enabled);
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? items.length;

  if (query.isPending) return <div className="h-36 animate-pulse rounded-2xl bg-[var(--soft-surface)]" aria-label={t("loading")} />;
  if (query.isError) return <div role="alert" className="rounded-2xl bg-danger-soft p-5 text-sm text-danger"><p>{t("sectionError")}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 inline-flex items-center gap-2 font-bold underline decoration-1 underline-offset-4"><RefreshCw className="size-4" />{t("retry")}</button></div>;
  if (!items.length) return null;

  return (
    <section aria-labelledby={`notifications-${period}`}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id={`notifications-${period}`} className="text-lg font-bold tracking-[-0.02em] text-ink">{t(period)}</h2>
        <span className="text-[11px] font-semibold text-muted">{t("count", { count: total })}</span>
      </div>
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-card">
        {items.map((item) => <NotificationRow key={item.id} item={item} period={period} />)}
      </div>
      {query.hasNextPage ? <button type="button" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-card px-5 text-xs font-bold text-ink hover:border-brand/35 disabled:opacity-55">{query.isFetchingNextPage ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{t("showMore")}</button> : null}
    </section>
  );
}

export function NotificationInbox() {
  const t = useTranslations("notificationInbox");
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const today = useNotificationInboxQuery("today", authenticated);
  const past = useNotificationInboxQuery("past", authenticated);
  const markAll = useMarkAllNotificationsReadMutation();
  const [notice, setNotice] = useState("");
  const allItems = [...(today.data?.pages.flatMap((page) => page.items) ?? []), ...(past.data?.pages.flatMap((page) => page.items) ?? [])];
  const unread = allItems.filter((item) => !item.isRead).length;
  const isEmpty = !today.isPending && !past.isPending && !today.isError && !past.isError && allItems.length === 0;

  useEffect(() => {
    if (!session.isPending && !authenticated) router.replace("/login");
  }, [authenticated, router, session.isPending]);

  async function markEverythingRead() {
    setNotice("");
    try {
      await markAll.mutateAsync();
      setNotice(t("markedRead"));
    } catch {
      setNotice(t("markError"));
    }
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_380px)] pb-16 md:min-h-[calc(100svh-4.75rem)]">
      <div className="section-wrap py-7 sm:py-10">
        <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[68ch]">
            <span className="mb-4 grid size-11 place-items-center rounded-xl bg-danger-soft text-brand"><Bell className="size-5" aria-hidden="true" /></span>
            <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm leading-6 text-body">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/profile/notification-settings" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-xs font-bold text-ink hover:border-brand/30"><Settings2 className="size-4 text-brand" aria-hidden="true" />{t("settings")}</Link>
            <button type="button" onClick={() => void markEverythingRead()} disabled={unread === 0 || markAll.isPending} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-bold text-ink hover:bg-brand/85 disabled:cursor-not-allowed disabled:opacity-45">{markAll.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CheckCheck className="size-4" aria-hidden="true" />}{t("markAll")}</button>
          </div>
        </header>

        {notice ? <p role="status" className="mt-4 rounded-xl bg-[var(--soft-surface)] px-4 py-3 text-xs font-medium text-body">{notice}</p> : null}
        {isEmpty ? <div className="mx-auto grid min-h-[420px] max-w-lg place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-card text-muted shadow-card"><Bell className="size-7" aria-hidden="true" /></span><h2 className="mt-5 text-lg font-bold text-ink">{t("emptyTitle")}</h2><p className="mt-2 text-sm leading-6 text-body">{t("emptyDescription")}</p></div></div> : <div className="mt-8 grid gap-10"><InboxSection period="today" enabled={authenticated} /><InboxSection period="past" enabled={authenticated} /></div>}
      </div>
    </main>
  );
}

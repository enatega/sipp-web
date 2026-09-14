"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, LoaderCircle, MessageSquare, Plus, Search } from "lucide-react";
import { useSessionQuery } from "@/modules/account";
import { useSupport } from "../../hooks/useSupport";
import { SupportConversation } from "./SupportConversation";
import { SupportTicketForm } from "./SupportTicketForm";

export function SupportExperience() {
  const t = useTranslations("deliveries.support");
  const session = useSessionQuery();
  const user = session.data?.authenticated ? session.data.user : null;
  const [selectedId, setSelectedId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const support = useSupport(user?.id ?? "", selectedId);
  const allTickets = support.tickets.data?.tickets ?? [];
  const selected = allTickets.find((ticket) => ticket.chatBoxId === selectedId);
  const tickets = allTickets.filter((ticket) => (filter === "all" || (filter === "active" ? ["opened", "in_progress"].includes(ticket.status.key) : ["resolved", "closed"].includes(ticket.status.key))) && `${ticket.title} ${ticket.subtitle} ${ticket.id}`.toLowerCase().includes(search.toLowerCase()));
  const title = (value: string) => value.split(" - ").map((key) => t.has(`options.${key}`) ? t(`options.${key}`) : key.replaceAll("_", " ")).join(" · ");

  if (session.isPending) return <main className="grid min-h-[60svh] place-items-center"><p role="status" className="flex items-center gap-2 text-muted"><LoaderCircle className="size-5 animate-spin" />{t("loading")}</p></main>;
  if (!user) return <main className="mx-auto max-w-lg px-5 py-20 text-center"><Headphones className="mx-auto size-10 text-brand" /><h1 className="mt-5 text-2xl font-bold text-ink">{t("title")}</h1><p className="mt-3 text-body">{session.isError ? t("loadError") : t("signInHint")}</p><Link href="/login" className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-white">{t("signIn")}</Link></main>;

  return <main className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col bg-[var(--soft-surface)] p-3 md:h-[calc(100dvh-4.75rem)] md:p-6">
    <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1"><div><h1 className="text-2xl font-bold text-ink">{t("title")}</h1><p className="mt-1 hidden text-sm text-muted sm:block">{t("subtitle")}</p></div><button type="button" onClick={() => { setIsCreating(true); setIsExpanded(false); }} disabled={isCreating} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="size-4" />{t("newTicket")}</button></header>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-card">
        {!isExpanded && !isCreating ? <aside className={`${selected ? "hidden md:flex" : "flex"} w-full min-h-0 flex-col border-line md:w-80 md:shrink-0 md:border-r lg:w-96`}>
          <div className="space-y-3 border-b border-line p-4"><label className="flex items-center gap-2 rounded-xl border border-line px-3"><Search className="size-4 shrink-0 text-muted" /><input aria-label={t("search")} placeholder={t("search")} value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none" /></label><select aria-label={t("filter")} value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-body">{["all", "active", "closed"].map((key) => <option key={key} value={key}>{t(`filterOptions.${key}`)}</option>)}</select></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {support.tickets.isPending ? <p role="status" className="flex items-center justify-center gap-2 py-12 text-muted"><LoaderCircle className="size-5 animate-spin" />{t("loading")}</p> : support.tickets.isError ? <div role="alert" className="p-5 text-sm text-danger">{t("loadError")} <button type="button" onClick={() => void support.tickets.refetch()} className="underline">{t("retry")}</button></div> : !tickets.length ? <p className="px-5 py-12 text-center text-sm text-muted">{t("noTickets")}</p> : null}
            {tickets.map((ticket) => <button key={ticket.id} type="button" disabled={!ticket.chatBoxId} onClick={() => { setSelectedId(ticket.chatBoxId ?? ""); setIsExpanded(false); }} aria-pressed={selectedId === ticket.chatBoxId} className={`mb-1 w-full rounded-xl p-4 text-left transition-colors disabled:opacity-50 ${selectedId === ticket.chatBoxId ? "bg-brand/10" : "hover:bg-[var(--soft-surface)]"}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-muted">#{ticket.id.slice(0, 8).toUpperCase()}</span><span className="rounded-full bg-[var(--soft-surface)] px-2 py-1 text-xs font-semibold text-body">{t.has(`status.${ticket.status.key}`) ? t(`status.${ticket.status.key}`) : ticket.status.label}</span></div><p className="mt-2 text-sm font-semibold text-ink">{title(ticket.title)}</p><p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-muted">{ticket.subtitle}</p>{ticket.unreadCount > 0 ? <span className="mt-2 inline-block rounded-full bg-brand px-2 py-0.5 text-xs text-white">{t("unread", { count: ticket.unreadCount })}</span> : null}</button>)}
          </div>
        </aside> : null}
        <div className={`${!isCreating && !selected ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col`}>
          {isCreating ? <div className="min-h-0 overflow-y-auto"><SupportTicketForm email={user.email ?? ""} onCancel={() => setIsCreating(false)} onSubmit={async (values) => { const result = await support.create.mutateAsync(values); setSelectedId(result.chatBoxId); setIsCreating(false); }} /></div> : selected ? <SupportConversation key={selected.chatBoxId} ticket={selected} thread={support.thread.data} userId={user.id} isLoading={support.thread.isPending} isError={support.thread.isError} isLive={support.isLive} isExpanded={isExpanded} onExpand={() => setIsExpanded(!isExpanded)} onBack={() => { setSelectedId(""); setIsExpanded(false); }} onRetry={() => void support.thread.refetch()} onSend={async (text) => { await support.send.mutateAsync({ id: selectedId, text }); }} /> : <div className="grid flex-1 place-items-center px-8 text-center"><div className="max-w-sm"><MessageSquare className="mx-auto size-12 text-brand" /><h2 className="mt-5 text-xl font-semibold text-ink">{t("selectTicket")}</h2><p className="mt-2 text-sm leading-6 text-muted">{t("selectHint")}</p></div></div>}
        </div>
      </div>
    </div>
  </main>;
}

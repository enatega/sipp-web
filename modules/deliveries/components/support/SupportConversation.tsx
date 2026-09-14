"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowDown, ArrowLeft, Headphones, LoaderCircle, Maximize2, Minimize2, Paperclip, Send } from "lucide-react";
import type { SupportThread, SupportTicket } from "../../types/support";

interface Props {
  ticket: SupportTicket; thread?: SupportThread; userId: string;
  isLoading: boolean; isError: boolean; isLive: boolean; isExpanded: boolean;
  onExpand: () => void; onBack: () => void; onRetry: () => void;
  onSend: (text: string) => Promise<void>;
}
export function SupportConversation({ ticket, thread, userId, isLoading, isError, isLive, isExpanded, onExpand, onBack, onRetry, onSend }: Props) {
  const t = useTranslations("deliveries.support");
  const format = useFormatter();
  const scroll = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [lastSeenId, setLastSeenId] = useState<string | undefined>();
  const [isReadingHistory, setIsReadingHistory] = useState(false);
  const [hasSendError, setHasSendError] = useState(false);
  const messages = useMemo(() => [...new Map((thread?.messages ?? []).map((message) => [message.id, message])).values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id)), [thread?.messages]);
  const lastId = messages.at(-1)?.id;
  const hasNew = isReadingHistory && lastId !== lastSeenId;
  const status = thread?.originalStatus ?? ticket.status.key;
  const isClosed = ["closed", "resolved"].includes(status) || thread?.status === "closed";
  const goBottom = () => { scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "instant" }); nearBottom.current = true; setIsReadingHistory(false); setLastSeenId(lastId); };
  useEffect(() => {
    if (nearBottom.current) scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "instant" });
  }, [lastId]);
  const form = useFormik({ initialValues: { text: "" }, validationSchema: yup.object({ text: yup.string().trim().required(t("required")).max(5000, t("tooLong")) }), async onSubmit(values, helpers) {
    setHasSendError(false);
    try { nearBottom.current = true; await onSend(values.text.trim()); helpers.resetForm(); goBottom(); }
    catch { setHasSendError(true); }
  } });
  return <section className="flex h-full min-h-0 flex-col bg-card">
    <header className="flex items-center gap-3 border-b border-line px-4 py-4 sm:px-6">
      <button type="button" onClick={onBack} aria-label={t("back")} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-[var(--soft-surface)]"><ArrowLeft className="size-5" /></button>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Headphones className="size-5" /></span>
      <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-ink">{t("team")}</h2><p className="text-xs text-muted">{t("ticketCode", { code: ticket.id.slice(0, 8).toUpperCase() })} · {t.has(`status.${status}`) ? t(`status.${status}`) : status}</p></div>
      <button type="button" onClick={onExpand} className="hidden size-10 place-items-center rounded-full hover:bg-[var(--soft-surface)] md:grid" aria-label={t(isExpanded ? "collapse" : "expand")}>{isExpanded ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}</button>
    </header>
    <div className="border-b border-line px-5 py-2 text-xs text-muted" role="status">{t(isLive ? "live" : "reconnecting")}</div>
    <div ref={scroll} onScroll={() => { const el = scroll.current; if (el) { nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; setIsReadingHistory(!nearBottom.current); if (nearBottom.current || !isReadingHistory) setLastSeenId(lastId); } }} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
      <details className="mb-6 rounded-xl bg-[var(--soft-surface)] p-4" open><summary className="cursor-pointer text-sm font-semibold text-ink">{t("ticketDetails")}</summary><p className="mt-2 whitespace-pre-wrap break-words text-sm text-body">{thread?.ticket?.description || ticket.subtitle || ticket.title.replaceAll("_", " ")}</p>{thread?.ticket?.attachmentUrls?.filter((url) => /^https?:\/\//i.test(url)).map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 text-sm text-brand underline"><Paperclip className="size-4" />{t("attachment", { number: index + 1 })}</a>)}</details>
      {isLoading ? <p role="status" className="flex items-center justify-center gap-2 py-12 text-muted"><LoaderCircle className="size-5 animate-spin" />{t("loadingMessages")}</p> : isError ? <div role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">{t("loadError")} <button type="button" onClick={onRetry} className="underline">{t("retry")}</button></div> : !messages.length ? <p className="py-12 text-center text-sm text-muted">{t("noMessages")}</p> : null}
      <div className="space-y-5" role="log" aria-label={t("messages")} aria-live="polite" aria-relevant="additions">
        {messages.map((message) => { const mine = message.senderId === userId; const date = new Date(message.createdAt); return <article key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className="max-w-[88%] sm:max-w-[75%]"><p className={`mb-1 text-xs font-semibold text-muted ${mine ? "text-right" : ""}`}>{mine ? t("you") : t("team")}</p><div className={`rounded-2xl px-4 py-3 ${mine ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-[var(--soft-surface)] text-ink"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{message.text}</p></div>{!Number.isNaN(date.getTime()) ? <time dateTime={message.createdAt} className={`mt-1 block text-[11px] text-muted ${mine ? "text-right" : ""}`}>{format.dateTime(date, { dateStyle: "medium", timeStyle: "short" })}</time> : null}</div></article>; })}
      </div>
    </div>
    {hasNew ? <button type="button" onClick={goBottom} className="mx-auto my-2 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm text-white"><ArrowDown className="size-4" />{t("newMessages")}</button> : null}
    <footer className="border-t border-line p-4 sm:p-5">
      {isClosed ? <p className="rounded-xl bg-[var(--soft-surface)] p-4 text-sm text-body">{t("closedHint")}</p> : <form onSubmit={form.handleSubmit}>
        {hasSendError ? <p role="alert" className="mb-3 rounded-xl bg-danger-soft p-3 text-sm text-danger">{t("sendError")}</p> : null}
        <label htmlFor="support-message" className="sr-only">{t("messageLabel")}</label>
        <div className="flex items-end gap-3"><textarea id="support-message" name="text" value={form.values.text} onChange={form.handleChange} onBlur={form.handleBlur} rows={2} maxLength={5000} disabled={form.isSubmitting || isLoading || !thread} placeholder={t("messagePlaceholder")} className="max-h-40 min-h-12 min-w-0 flex-1 resize-y rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /><button type="submit" disabled={form.isSubmitting || isLoading || !thread || !form.values.text.trim()} aria-label={t("send")} className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-white disabled:opacity-50">{form.isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}</button></div>
        {form.submitCount > 0 && form.errors.text ? <p role="alert" className="mt-2 text-sm text-danger">{form.errors.text}</p> : null}
      </form>}
    </footer>
  </section>;
}

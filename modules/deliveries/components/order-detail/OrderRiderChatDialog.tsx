"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, Send, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMarkOrderChatRead, useOrderChatThread, useSendOrderChatMessage } from "../../hooks/useOrderChat";

interface Props {
  onClose: () => void;
  orderId: string;
  riderName: string;
  riderUserId: string | null;
}

export function OrderRiderChatDialog({ onClose, orderId, riderName, riderUserId }: Props) {
  const t = useTranslations("deliveries.orderDetails");
  const format = useFormatter();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const lastReadMessage = useRef<string | null>(null);
  const thread = useOrderChatThread(orderId, true);
  const send = useSendOrderChatMessage(orderId);
  const markRead = useMarkOrderChatRead(orderId);
  const latestMessageId = thread.data?.messages.at(-1)?.id ?? null;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [latestMessageId]);

  useEffect(() => {
    if (!latestMessageId || latestMessageId === lastReadMessage.current) return;
    lastReadMessage.current = latestMessageId;
    markRead.mutate(undefined, {
      onError: () => {
        lastReadMessage.current = null;
      },
    });
  }, [latestMessageId, thread.dataUpdatedAt, markRead.mutate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || send.isPending) return;
    setSendError(false);
    try {
      await send.mutateAsync(text);
      setDraft("");
    } catch {
      setSendError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-label={t("chatWithRider")} aria-modal="true" className="flex max-h-[min(80vh,680px)] min-h-96 w-full max-w-lg flex-col rounded-2xl bg-card shadow-pop" role="dialog">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">{t("chatWithRider")}</h2>
            <p className="text-xs text-muted">{riderName}</p>
          </div>
          <button aria-label={t("closeChat")} className="grid size-10 place-items-center rounded-full text-muted hover:bg-[var(--soft-surface)]" onClick={onClose} type="button"><X aria-hidden="true" className="size-5" /></button>
        </header>
        <div aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4" ref={messagesRef}>
          {thread.isPending ? <p className="text-sm text-muted">{t("loadingChat")}</p> : null}
          {thread.isError ? <p className="text-sm text-danger" role="alert">{t("chatLoadError")}</p> : null}
          {thread.isError ? <button className="text-sm font-semibold text-brand underline" onClick={() => void thread.refetch()} type="button">{t("retry")}</button> : null}
          {thread.data?.messages.length === 0 ? <p className="text-sm text-muted">{t("chatEmpty")}</p> : null}
          {thread.data?.messages.map((message) => {
            const isRider = Boolean(riderUserId && message.sender_id === riderUserId);
            return (
              <div className={`flex ${isRider ? "justify-start" : "justify-end"}`} key={message.id}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isRider ? "bg-[var(--soft-surface)] text-ink" : "bg-brand/15 text-ink"}`}>
                  <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                  <time className="mt-1 block text-[10px] text-muted" dateTime={message.createdAt}>{format.dateTime(new Date(message.createdAt), { timeStyle: "short" })}</time>
                </div>
              </div>
            );
          })}
        </div>
        <form className="border-t border-line p-4" onSubmit={(event) => void submit(event)}>
          {sendError ? <p className="mb-2 text-xs text-danger" role="alert">{t("chatSendError")}</p> : null}
          <div className="flex items-center gap-2">
            <input aria-label={t("chatMessagePlaceholder")} className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand" maxLength={4000} onChange={(event) => setDraft(event.target.value)} placeholder={t("chatMessagePlaceholder")} ref={inputRef} value={draft} />
            <button aria-label={t("sendMessage")} className="grid size-11 place-items-center rounded-xl bg-brand text-ink disabled:opacity-50" disabled={!draft.trim() || send.isPending} type="submit">{send.isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

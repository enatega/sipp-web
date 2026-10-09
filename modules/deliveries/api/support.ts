import { requestJson } from "@/services/api/client";
import type { CreatedTicket, SupportOptions, SupportThread, SupportTickets, TicketInput } from "../types/support";

export const supportApi = {
  async upload(file: File) {
    const limit = ["image/webp", "application/pdf"].includes(file.type) ? 5 : 10;
    if (file.size > limit * 1024 * 1024 || !["image/png", "image/jpeg", "image/heic", "image/heif", "image/webp", "application/pdf"].includes(file.type)) throw new Error(`Choose a supported attachment under ${limit} MB.`);
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/support/attachments", { method: "POST", body, signal: AbortSignal.timeout(30000) });
    const data: unknown = await response.json();
    if (!response.ok || !data || typeof data !== "object" || !("url" in data) || typeof data.url !== "string") throw new Error("Upload failed");
    return data.url;
  },
  tickets: (signal?: AbortSignal) => requestJson<SupportTickets>("/api/support/tickets", { signal }),
  options: (signal?: AbortSignal) => requestJson<SupportOptions>("/api/support/options", { signal }),
  thread: (id: string, signal?: AbortSignal) => requestJson<SupportThread>(`/api/support/chats/${encodeURIComponent(id)}`, { signal }),
  create: (input: TicketInput) => requestJson<CreatedTicket>("/api/support/tickets", { method: "POST", body: JSON.stringify(input) }),
  send: (id: string, text: string, attachmentUrls: string[] = []) => requestJson<{ chatBoxId: string }>(`/api/support/chats/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ text, attachmentUrls }) }),
};

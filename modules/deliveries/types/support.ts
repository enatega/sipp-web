import * as yup from "yup";

export const ticketInputSchema = yup.object({
  category: yup.string().required().max(100),
  reason: yup.string().max(100).default("other"),
  email: yup.string().trim().email().required().max(255),
  description: yup.string().trim().max(10000).default(""),
  fullName: yup.string().trim().max(255).default(""),
  countryRegion: yup.string().trim().max(120).default(""),
  mobileNumber: yup.string().trim().max(40).default(""),
  businessName: yup.string().trim().max(255).default(""),
  businessType: yup.string().max(120).default(""),
  teamSize: yup.string().max(40).default(""),
  attachmentUrls: yup.array().of(yup.string().url().required()).max(5).default([]),
  priority: yup.string().oneOf(["low", "medium", "high"]).default("low"),
});
export type TicketInput = yup.InferType<typeof ticketInputSchema>;
export interface SupportTicket {
  id: string;
  chatBoxId: string | null;
  title: string;
  subtitle: string;
  status: { key: string; label: string };
  date: { day: string; month: string };
  unreadCount: number;
}
export interface SupportMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}
export interface SupportThread {
  chatBoxId: string;
  status: string;
  originalStatus?: string;
  messages: SupportMessage[];
  ticket?: { description?: string; attachmentUrls?: string[]; category?: string; reason?: string } | null;
}
export interface SupportOptions {
  categories: { key: string; reasons: string[] }[];
  businessTypes: string[];
  teamSizes: string[];
  requiredByCategory: Record<string, string[]>;
}
export interface SupportTickets { total: number; tickets: SupportTicket[] }
export interface CreatedTicket { chatBoxId: string; ticket: { id: string } }

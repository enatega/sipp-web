export interface OrderChatMessage {
  id: string;
  sender_id: string;
  text: string | null;
  attachmentUrls?: string[];
  createdAt: string;
}

export interface OrderChatThread {
  chatBoxId: string | null;
  messages: OrderChatMessage[];
}

export interface OrderChatUnread {
  byOrderAndKind: Record<string, { customer_rider?: number }>;
}

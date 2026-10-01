export interface OrderChatMessage {
  id: string;
  sender_id: string;
  text: string | null;
  createdAt: string;
}

export interface OrderChatThread {
  chatBoxId: string | null;
  messages: OrderChatMessage[];
}

export interface OrderChatUnread {
  byOrderAndKind: Record<string, { customer_rider?: number }>;
}

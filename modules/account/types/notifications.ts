export type NotificationSettings = {
  id?: string;
  user_id?: string;
  food_delivery_email: boolean;
  food_delivery_sms: boolean;
  food_delivery_whatsapp: boolean;
  marketing_email: boolean;
  marketing_sms: boolean;
  marketing_whatsapp: boolean;
  updated_at?: string;
};

export type NotificationSettingsPayload = {
  data?: NotificationSettings;
  message?: string;
};

export type NotificationSettingsInput = Omit<
  NotificationSettings,
  "id" | "user_id" | "updated_at"
>;

export type InboxNotification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  href: string | null;
  type: string | null;
  orderId: string | null;
  /** Customer-facing order number, e.g. "#48E5D8E5", derived like the backend's orderCode. */
  orderCode: string | null;
  storeName: string | null;
  status: string | null;
};

export type NotificationInboxPage = {
  items: InboxNotification[];
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  isEnd: boolean;
};

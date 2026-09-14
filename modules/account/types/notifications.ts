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
};

export type NotificationInboxPage = {
  items: InboxNotification[];
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  isEnd: boolean;
};

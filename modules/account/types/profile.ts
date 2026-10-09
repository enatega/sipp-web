import type { SavedAddress } from "./location";

export type ProfileGender = "MALE" | "FEMALE" | "OTHER";

export type ProfileUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  email_is_verified?: boolean;
  phone_is_verified?: boolean;
  google_phone_verification_required?: boolean;
  date_of_birth?: string | null;
  gender?: ProfileGender | null;
  image?: string | null;
};

export type ProfilePayload = {
  message?: string;
  data?: {
    user?: ProfileUser;
    addresses?: SavedAddress[];
  };
};

export type ProfileUpdateInput = {
  name: string;
  dateOfBirth?: string;
  gender?: ProfileGender;
};

export type ProfileUpdatePayload = {
  message?: string;
  data?: ProfileUser;
};

export type ProfileImageUpdatePayload = {
  message?: string;
  data?: { image_url?: string };
};

export type WalletPayload = {
  data?: { wallet_balance?: number };
};

export type WalletTransactionType =
  | "Deposit"
  | "Debit"
  | "Credit"
  | "Refund"
  | "Loyalty"
  | "MigrationOpeningBalance"
  | "Withdrawal";

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType | string;
  title?: string;
  message?: string;
  amount: number | string;
  orderId?: string | null;
  entryType?: string | null;
  status?: string;
  createdAt: string;
};

export type WalletTransactionsPayload = {
  transactions: WalletTransaction[];
  total: number;
  offset: number;
  limit: number;
  isEnd: boolean;
};

export type ProfileSummaryPayload = {
  data?: {
    total_orders: number;
    current_month_orders: number;
    previous_month_orders: number;
    orders_change_percent: number;
    wallet_balance: number;
    delivered_spend?: number;
    current_month_delivered_orders?: number;
  };
};

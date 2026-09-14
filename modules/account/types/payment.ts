export type SavedCard = {
  id: string;
  name?: string | null;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type SavedCardsPayload = {
  stripeCustomerId: string;
  cards: SavedCard[];
};

export type SavedCardSetupIntent = {
  setupIntentId: string;
  clientSecret: string;
  stripeCustomerId: string;
};

export type SavedCardActionPayload = {
  message?: string;
};

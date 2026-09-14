export type Prediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

export type PlacePoint = { lat: number; lng: number };

export type ChosenPlace = {
  address: string;
  latitude: number;
  longitude: number;
  label?: string;
  savedAddressId?: string;
};

export type AddressType = "HOME" | "OFFICE" | "APARTMENT" | "OTHER";

export type SavedAddress = {
  id: string;
  address: string;
  location_name?: string | null;
  type: AddressType;
  is_selected?: boolean;
  additional_fields?: Record<string, string> | null;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type SavedAddressPage = { items: SavedAddress[]; isEnd: boolean };

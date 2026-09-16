export type PopularCity = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

/** Coastal towns SIPP serves first; surfaced as quick picks anywhere a
    visitor is asked to choose a delivery address. */
export const POPULAR_CITIES: PopularCity[] = [
  {
    name: "Santa Teresa",
    address: "Santa Teresa, Puntarenas, Costa Rica",
    latitude: 9.6459,
    longitude: -85.1638,
  },
  {
    name: "Tamarindo",
    address: "Tamarindo, Guanacaste, Costa Rica",
    latitude: 10.2993,
    longitude: -85.8371,
  },
];

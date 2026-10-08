import type { RestaurantStore } from "../types/restaurant";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function minutes(value?: string): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour < 24 && minute < 60 ? hour * 60 + minute : null;
}

function weekday(index: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" })
    .format(new Date(Date.UTC(2023, 0, 1 + index)));
}

function time(value: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" })
    .format(new Date(Date.UTC(2023, 0, 1, Math.floor(value / 60), value % 60)));
}

export function storeHours(store: RestaurantStore, locale: string, now = new Date()) {
  const schedule = store.storeTimings;
  if (!schedule) return { rows: [], nextOpening: null, zone: null };

  let timezone = store.timezone || "America/Costa_Rica";
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23", timeZoneName: "short",
    });
  } catch {
    timezone = "America/Costa_Rica";
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23", timeZoneName: "short",
    });
  }
  const parts = formatter.formatToParts(now);
  const today = DAY_INDEX[parts.find((part) => part.type === "weekday")?.value ?? ""] ?? 0;
  const currentMinutes = Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60
    + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const zone = parts.find((part) => part.type === "timeZoneName")?.value ?? timezone;
  const rows = DAYS.map((day, index) => {
    const entry = schedule[day];
    const slots = entry?.is_active ? (entry.slots ?? []).flatMap((slot) => {
      const open = minutes(slot.open);
      const close = minutes(slot.close);
      return open === null || close === null ? [] : [{ open, close }];
    }).sort((left, right) => left.open - right.open) : [];
    return { day: weekday(index, locale), slots };
  });
  let nextOpening: string | null = null;
  if (store.isAdministrativelyAvailable) {
    for (let offset = 0; offset <= 7 && !nextOpening; offset += 1) {
      const index = (today + offset) % 7;
      const slot = rows[index].slots.find((item) => offset > 0 || item.open > currentMinutes);
      if (slot) nextOpening = `${rows[index].day}, ${time(slot.open, locale)} ${zone}`;
    }
  }
  return { rows, nextOpening, zone };
}

export function storeSlotLabel(open: number, close: number, locale: string) {
  return open === close ? null : `${time(open, locale)}–${time(close, locale)}`;
}

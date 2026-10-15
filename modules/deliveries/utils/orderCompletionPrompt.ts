const STORAGE_KEY = "sipp:seen-order-completion-prompts:v1";
const MAX_REMEMBERED_ORDERS = 100;

function readSeenOrderIds(): string[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function hasSeenOrderCompletionPrompt(orderId: string) {
  return readSeenOrderIds().includes(orderId);
}

export function markOrderCompletionPromptSeen(orderId: string) {
  try {
    const orderIds = readSeenOrderIds().filter((id) => id !== orderId);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...orderIds, orderId].slice(-MAX_REMEMBERED_ORDERS)),
    );
  } catch {
    // The in-memory guard in OrderDetailExperience still prevents repeat prompts
    // when browser storage is unavailable.
  }
}

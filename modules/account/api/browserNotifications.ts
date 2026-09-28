import { requestJson } from "@/services/api/client";

type PushKeyResponse = { publicKey: string | null };
let pendingRegistration: Promise<void> | null = null;

export function browserPushAvailability(): "available" | "unsupported" | "ios-install" {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return ios && !installed ? "ios-install" : "available";
}

function decodeApplicationKey(value: string) {
  const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function matchesApplicationKey(current: BufferSource | null, expected: Uint8Array) {
  if (!current) return false;
  const bytes = current instanceof ArrayBuffer
    ? new Uint8Array(current)
    : new Uint8Array(current.buffer, current.byteOffset, current.byteLength);
  return bytes.length === expected.length && bytes.every((byte, index) => byte === expected[index]);
}

async function performBrowserRegistration(publicKey: string) {
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  const ready = await navigator.serviceWorker.ready;
  const applicationServerKey = decodeApplicationKey(publicKey);
  let subscription = await ready.pushManager.getSubscription();
  if (subscription && !matchesApplicationKey(subscription.options.applicationServerKey, applicationServerKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  const isNew = !subscription;
  subscription ??= await ready.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  try {
    await requestJson("/api/notifications/web-push/subscriptions", { method: "POST", body: JSON.stringify(subscription.toJSON()) });
  } catch (error) {
    if (isNew) await subscription.unsubscribe();
    throw error;
  }
}

function registerBrowserSubscription(publicKey: string) {
  pendingRegistration ??= performBrowserRegistration(publicKey).finally(() => {
    pendingRegistration = null;
  });
  return pendingRegistration;
}

export async function enableBrowserNotifications() {
  if (browserPushAvailability() !== "available") throw new Error("Browser push is unavailable");
  const { publicKey } = await requestJson<PushKeyResponse>("/api/notifications/web-push/key", { cache: "no-store" });
  if (!publicKey) throw new Error("Browser push is not configured");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied" as const;
  await registerBrowserSubscription(publicKey);
  return "enabled" as const;
}

export async function browserNotificationsEnabled() {
  if (browserPushAvailability() !== "available" || Notification.permission !== "granted") return false;
  const { publicKey } = await requestJson<PushKeyResponse>("/api/notifications/web-push/key", { cache: "no-store" });
  if (!publicKey) return false;
  await registerBrowserSubscription(publicKey);
  return true;
}

export async function disableBrowserNotifications() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  await pendingRegistration?.catch(() => undefined);
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  try {
    await requestJson("/api/notifications/web-push/subscriptions", { method: "DELETE", body: JSON.stringify({ endpoint: subscription.endpoint }), timeoutMs: 2000 });
  } finally {
    await subscription.unsubscribe();
  }
}

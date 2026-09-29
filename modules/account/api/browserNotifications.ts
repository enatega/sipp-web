import { requestJson } from "@/services/api/client";

type PushKeyResponse = { publicKey: string | null };
type PreparedPush = {
  registration: ServiceWorkerRegistration;
  applicationServerKey: Uint8Array;
  subscription: PushSubscription | null;
};

let preparedPush: PreparedPush | null = null;
let pendingPreparation: Promise<PreparedPush> | null = null;
let pendingRegistration: Promise<void> | null = null;

export function browserPushAvailability(): "available" | "unsupported" | "ios-install" {
  if (typeof window === "undefined") return "unsupported";
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  if (ios && !installed) return "ios-install";
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
    ? "available"
    : "unsupported";
}

function decodeApplicationKey(value: string): Uint8Array<ArrayBuffer> {
  const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isNotificationPermissionDenied() {
  return Notification.permission === "denied";
}

function matchesApplicationKey(current: BufferSource | null, expected: Uint8Array) {
  if (!current) return false;
  const bytes = current instanceof ArrayBuffer
    ? new Uint8Array(current)
    : new Uint8Array(current.buffer, current.byteOffset, current.byteLength);
  return bytes.length === expected.length && bytes.every((byte, index) => byte === expected[index]);
}

async function prepareBrowserPush(): Promise<PreparedPush> {
  if (preparedPush) return preparedPush;
  pendingPreparation ??= (async () => {
    const { publicKey } = await requestJson<PushKeyResponse>("/api/notifications/web-push/key", { cache: "no-store" });
    if (!publicKey) throw new Error("Browser push is not configured");
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = decodeApplicationKey(publicKey);
    let subscription = await registration.pushManager.getSubscription();
    if (subscription && !matchesApplicationKey(subscription.options.applicationServerKey, applicationServerKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (subscription && Notification.permission !== "granted") {
      await subscription.unsubscribe();
      subscription = null;
    }
    preparedPush = { registration, applicationServerKey, subscription };
    return preparedPush;
  })().finally(() => {
    pendingPreparation = null;
  });
  return pendingPreparation;
}

function registerServerSubscription(subscription: PushSubscription) {
  pendingRegistration ??= requestJson("/api/notifications/web-push/subscriptions", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  }).then(() => undefined).finally(() => {
    pendingRegistration = null;
  });
  return pendingRegistration;
}

export async function enableBrowserNotifications() {
  if (browserPushAvailability() !== "available") throw new Error("Browser push is unavailable");
  if (isNotificationPermissionDenied()) return "denied" as const;
  const prepared = preparedPush;
  if (!prepared) throw new Error("Browser push is not ready");

  // Start subscribe synchronously in the click handler. WebKit requires a user
  // gesture for a new push subscription; permission is requested by subscribe.
  const wasNew = !prepared.subscription;
  const subscriptionPromise = prepared.subscription
    ? Promise.resolve(prepared.subscription)
    : prepared.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: prepared.applicationServerKey,
      });

  let subscription: PushSubscription;
  try {
    subscription = await subscriptionPromise;
  } catch (error) {
    if (isNotificationPermissionDenied()) return "denied" as const;
    throw error;
  }
  prepared.subscription = subscription;
  try {
    await registerServerSubscription(subscription);
  } catch (error) {
    if (wasNew) {
      await subscription.unsubscribe();
      prepared.subscription = null;
    }
    throw error;
  }
  return "enabled" as const;
}

export async function browserNotificationsEnabled() {
  if (browserPushAvailability() !== "available") return false;
  const prepared = await prepareBrowserPush();
  if (Notification.permission !== "granted" || !prepared.subscription) return false;
  await registerServerSubscription(prepared.subscription);
  return true;
}

export async function disableBrowserNotifications() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  await pendingPreparation?.catch(() => undefined);
  await pendingRegistration?.catch(() => undefined);
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) {
    preparedPush = null;
    return;
  }
  try {
    await requestJson("/api/notifications/web-push/subscriptions", { method: "DELETE", body: JSON.stringify({ endpoint: subscription.endpoint }), timeoutMs: 2000 });
  } finally {
    await subscription.unsubscribe();
    preparedPush = null;
  }
}

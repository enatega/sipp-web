"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/shared/brand/Icon";
import type { AuthUser } from "@/modules/account/types";
import { userInitials } from "@/modules/account/utils/userInitials";
import { useUnreadNotificationsCountQuery } from "@/modules/account/queries/useNotificationInboxQueries";
import { useNotificationLiveSync } from "@/modules/account/hooks/useNotificationLiveSync";
import { browserNotificationsEnabled, browserPushAvailability, disableBrowserNotifications, enableBrowserNotifications } from "@/modules/account/api/browserNotifications";

/** The signed-in destinations, in the order the design lists them. */
const LINKS: Array<{ labelKey: "profile" | "orders" | "wallet" | "support"; href: string; icon: IconName }> = [
  { labelKey: "profile", href: "/profile", icon: "user-circle" },
  { labelKey: "orders", href: "/orders", icon: "package" },
  { labelKey: "wallet", href: "/wallet", icon: "wallet-card" },
  { labelKey: "support", href: "/help", icon: "help" },
];

const ROW =
  "flex w-full items-center gap-3 rounded-[10px] px-3 py-[9px] text-left text-sm font-semibold text-foreground transition-colors hover:bg-[var(--soft-surface)] hover:text-brand max-sm:gap-2 max-sm:px-2 max-sm:py-2 max-sm:text-[13px]";

/** A header icon with an optional unread/quantity badge. */
function IconAction({
  icon,
  label,
  href,
  count = 0,
  hideOnMobile = false,
}: {
  icon: IconName;
  label: string;
  href: string;
  count?: number;
  hideOnMobile?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={`relative grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-blush hover:text-brand sm:size-9 ${hideOnMobile ? "max-sm:hidden" : ""}`}
    >
      <Icon name={icon} className="size-5 sm:size-[22px]" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff8a1f] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-surface"
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function AccountMenu({
  user,
  onSignOut,
  cartCount = 0,
  cartAction,
}: {
  user: AuthUser;
  onSignOut: () => void;
  cartCount?: number;
  /** Replaces the plain cart icon, e.g. with a filled-cart summary. */
  cartAction?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const navigation = useTranslations("navigation");
  const common = useTranslations("common");
  const notifications = useTranslations("notificationInbox");
  const [pushState, setPushState] = useState<"unknown" | "available" | "busy" | "enabled" | "denied" | "unsupported" | "ios-install">("unknown");
  const [pushNotice, setPushNotice] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const unreadNotifications = useUnreadNotificationsCountQuery();
  useNotificationLiveSync();

  useEffect(() => {
    let active = true;
    const availability = browserPushAvailability();
    if (availability !== "available") { setPushState(availability); return; }
    if (Notification.permission === "denied") { setPushState("denied"); return; }
    void browserNotificationsEnabled()
      .then((enabled) => { if (active) setPushState(enabled ? "enabled" : "available"); })
      .catch(() => { if (active) setPushState("available"); });
    return () => { active = false; };
  }, []);

  async function enablePush() {
    setPushState("busy");
    setPushNotice("");
    try {
      const result = await enableBrowserNotifications();
      setPushState(result === "enabled" ? "enabled" : "denied");
      setPushNotice(notifications(result === "enabled" ? "browserEnabled" : "browserDenied"));
    } catch {
      setPushState("available");
      setPushNotice(notifications("browserError"));
    }
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // `profile` is only usable as an avatar when it actually carries an image URL.
  const photo =
    user.profile && /^(https?:)?\/\//.test(user.profile) ? user.profile : null;
  const visiblePhoto = photo && failedPhoto !== photo ? photo : null;

  return (
    <div className="flex items-center gap-0.5 sm:gap-1.5">
      {cartAction ?? <IconAction icon="cart" label="Cart" href="/cart" count={cartCount} />}
      <IconAction icon="bell" label={navigation("notifications")} href="/notifications" count={unreadNotifications.data?.unreadCount ?? 0} />

      <div className="relative ml-0.5 sm:ml-1" ref={wrapRef}>
        <button
          type="button"
          className="grid size-9 place-items-center overflow-hidden rounded-full bg-brand text-ink transition-colors hover:bg-brand/85 sm:size-11"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={user.name ? `Account menu for ${user.name}` : "Account menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {visiblePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={visiblePhoto}
              alt=""
              className="size-full object-cover"
              onError={() => setFailedPhoto(visiblePhoto)}
            />
          ) : (
            <span
              aria-hidden="true"
              className="text-[12px] font-bold tracking-[-0.02em] sm:text-[14px]"
            >
              {userInitials(user.name)}
            </span>
          )}
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Account"
            className="absolute -right-1.5 top-[calc(100%+12px)] z-50 w-[228px] rounded-[16px] border border-brand bg-surface p-3 shadow-pop max-sm:right-0 max-sm:w-[200px] max-sm:rounded-[14px] max-sm:p-2"
          >
            {/* Notch: sits over the card's top border, centred under the avatar. */}
            <span
              aria-hidden="true"
              className="absolute -top-[7px] right-[22px] size-3 rotate-45 border-l border-t border-brand bg-surface"
            />
            <div className="flex flex-col gap-0.5">
              {LINKS.map(({ labelKey, href, icon }) => (
                <Link
                  key={labelKey}
                  href={href}
                  role="menuitem"
                  className={ROW}
                  onClick={() => setOpen(false)}
                >
                  <Icon name={icon} className="size-5 flex-none text-brand max-sm:size-[18px]" />
                  {navigation(labelKey)}
                </Link>
              ))}
              {pushState === "available" || pushState === "busy" ? (
                <button className={ROW} disabled={pushState === "busy"} onClick={() => void enablePush()} role="menuitem" type="button">
                  <Icon name="bell" className="size-5 flex-none text-brand max-sm:size-[18px]" />
                  {notifications("enableBrowser")}
                </button>
              ) : null}
              {pushNotice ? <p className="px-3 py-2 text-xs leading-5 text-body" role="status">{pushNotice}</p> : null}
              <button
                type="button"
                role="menuitem"
                className={ROW}
                onClick={() => {
                  setOpen(false);
                  void disableBrowserNotifications().catch(() => undefined).finally(onSignOut);
                }}
              >
                <Icon name="logout" className="size-5 flex-none text-brand max-sm:size-[18px]" />
                {common("logout")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

// The rider app publishes at least every 10-20s, even while stationary, so
// 90s of silence means the app was killed, lost signal, or lost permission.
const STALE_AFTER_MS = 90_000;
const UNAVAILABLE_AFTER_MS = 5 * 60_000;
const TICK_MS = 15_000;

export type RiderLocationStaleness = {
  minutesSinceUpdate: number;
  unavailable: boolean;
};

/**
 * Returns null while live updates are flowing. Before the first live update
 * arrives, silence is measured from when tracking became active, because the
 * location from the order API has no reliable age.
 */
export function useRiderLocationStaleness(
  lastReceivedAt: number | undefined,
  active: boolean,
): RiderLocationStaleness | null {
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (!active) {
      wasActiveRef.current = false;
      setActiveSince(null);
      return undefined;
    }
    if (!wasActiveRef.current) {
      wasActiveRef.current = true;
      setActiveSince(Date.now());
    }

    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    // Browsers throttle background tabs and may drop the socket, so restart
    // the clock when the tab is visible again instead of flagging that gap.
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      setActiveSince(Date.now());
      setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  if (!active || activeSince === null) return null;

  const silentForMs = now - Math.max(lastReceivedAt ?? 0, activeSince);
  if (silentForMs < STALE_AFTER_MS) return null;

  return {
    minutesSinceUpdate: Math.max(1, Math.floor(silentForMs / 60_000)),
    unavailable: silentForMs >= UNAVAILABLE_AFTER_MS,
  };
}

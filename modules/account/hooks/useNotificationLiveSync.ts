"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { notificationInboxApi } from "@/modules/account/api/notificationInbox";
import { useSessionQuery } from "@/modules/account/queries/useAccountQueries";
import { notificationInboxKeys } from "@/modules/account/queries/useNotificationInboxQueries";

interface SocketSession { token: string; userId: string; url: string; path: string }
interface NotificationEvent { id?: unknown; title?: unknown; body?: unknown; href?: unknown }
export interface LiveNotificationAlert { id: string; title: string; body: string; href: string | null }

const SOUND_KEY = "sipp:notification-sound";

function safeHref(value: unknown): string | null {
  return typeof value === "string" && /^\/orders\/[0-9a-f-]{36}$/i.test(value) ? value : null;
}

function claimAlert(userId: string, id: string, localSeen: Set<string>): boolean {
  if (localSeen.has(id)) return false;
  localSeen.add(id);
  try {
    const key = `sipp:seen-notification-alerts:${userId}`;
    const stored: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    const seen = Array.isArray(stored) ? stored.filter((value): value is string => typeof value === "string") : [];
    if (seen.includes(id)) return false;
    localStorage.setItem(key, JSON.stringify([...seen.slice(-49), id]));
  } catch { /* In-memory deduplication remains available. */ }
  return true;
}

export function useNotificationLiveSync() {
  const queryClient = useQueryClient();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const [alert, setAlert] = useState<LiveNotificationAlert | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const seenIds = useRef(new Set<string>());
  const lastSeenAt = useRef(Date.now());
  const soundEnabled = useRef(false);

  useEffect(() => {
    try {
      const enabled = localStorage.getItem(SOUND_KEY) === "on";
      soundEnabled.current = enabled;
      setIsSoundEnabled(enabled);
    } catch { /* Storage is optional. */ }
    const unlock = () => {
      if (!soundEnabled.current) return;
      try {
        const context = audioContext.current ?? new AudioContext();
        audioContext.current = context;
        void context.resume().catch(() => undefined);
      } catch { /* Unsupported audio leaves the visual alert available. */ }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      void audioContext.current?.close();
      audioContext.current = null;
    };
  }, []);

  const playSound = useCallback(async () => {
    if (!soundEnabled.current) return;
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      await context.resume();
      const start = context.currentTime;
      for (const [index, frequency] of [784, 1046].entries()) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.12, start + index * 0.15 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + index * 0.15 + 0.13);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start + index * 0.15);
        oscillator.stop(start + index * 0.15 + 0.14);
      }
    } catch { /* Browsers can block playback until a user gesture. */ }
  }, []);

  const enableSound = useCallback(async () => {
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      await context.resume();
      soundEnabled.current = true;
      setIsSoundEnabled(true);
      try { localStorage.setItem(SOUND_KEY, "on"); } catch { /* Optional preference. */ }
      return true;
    } catch { return false; }
  }, []);

  const disableSound = useCallback(() => {
    soundEnabled.current = false;
    setIsSoundEnabled(false);
    try { localStorage.setItem(SOUND_KEY, "off"); } catch { /* Optional preference. */ }
  }, []);

  useEffect(() => {
    if (!authenticated) { setAlert(null); return; }
    const controller = new AbortController();
    let socket: ReturnType<typeof io> | null = null;
    let userId = "";
    const refresh = () => void queryClient.invalidateQueries({ queryKey: notificationInboxKeys.all });
    const present = (item: LiveNotificationAlert) => {
      if (!userId || !item.title.trim() || !item.body.trim() || !claimAlert(userId, item.id, seenIds.current)) return;
      setAlert(item);
      void playSound();
      refresh();
    };
    const reconcile = async (wantedId?: string) => {
      const startedAt = Date.now();
      try {
        const [today, past] = await Promise.all([
          notificationInboxApi.list("today", 0, controller.signal),
          notificationInboxApi.list("past", 0, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        const newest = [...today.items, ...past.items]
          .filter((item) => !item.isRead && (item.id === wantedId || new Date(item.createdAt).getTime() > lastSeenAt.current))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
        if (newest) present({ id: newest.id, title: newest.title, body: newest.description, href: newest.href });
        lastSeenAt.current = startedAt;
        refresh();
      } catch { /* The inbox and unread query recover on their next refresh. */ }
    };

    void fetch("/api/deliveries/socket-session", {
      credentials: "same-origin", cache: "no-store", signal: controller.signal,
    }).then(async (response) => response.ok ? response.json() as Promise<SocketSession> : null)
      .then((connection) => {
        if (!connection || controller.signal.aborted) return;
        userId = connection.userId;
        socket = io(connection.url, {
          auth: { token: connection.token }, autoConnect: false,
          path: connection.path, transports: ["websocket"],
        });
        socket.on("connect", () => { socket?.emit("add-user", userId); void reconcile(); });
        socket.on("notification-created", (event: NotificationEvent) => {
          refresh();
          if (typeof event?.id !== "string") return;
          if (typeof event.title !== "string" || typeof event.body !== "string") {
            void reconcile(event.id);
            return;
          }
          present({ id: event.id, title: event.title, body: event.body, href: safeHref(event.href) });
        });
        socket.connect();
      }).catch(() => { /* Polling and focus reconciliation remain available. */ });

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void reconcile();
      if (socket && !socket.connected) socket.connect();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onVisible);
      socket?.disconnect();
    };
  }, [authenticated, playSound, queryClient]);

  return { authenticated, alert, dismiss: () => setAlert(null), isSoundEnabled, enableSound, disableSound };
}

"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { deliveryQueryKeys } from "../queries/queryKeys";
import type { OrderDetail, OrderEta } from "../types/orders";

interface SocketSession {
  token: string;
  userId: string;
  url: string;
  path: string;
}

interface OrderStatusUpdatedPayload {
  orderId?: string;
  status?: string;
  riderId?: string | null;
  riderUserId?: string | null;
  updatedAt?: string;
  eta?: OrderEta | null;
}

interface RiderStatusUpdatedPayload {
  orderId?: string;
}

interface RiderLocationPayload {
  orderId?: string;
  riderUserId?: string;
  customerUserId?: string;
  latitude?: number;
  longitude?: number;
  eta?: OrderEta | null;
}

function isSocketSession(value: unknown): value is SocketSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const session = value as Partial<SocketSession>;
  return (
    typeof session.token === "string" &&
    typeof session.userId === "string" &&
    typeof session.url === "string" &&
    typeof session.path === "string"
  );
}

function hasLocation(
  payload: RiderLocationPayload,
): payload is RiderLocationPayload & { latitude: number; longitude: number } {
  return (
    typeof payload.latitude === "number" &&
    Number.isFinite(payload.latitude) &&
    typeof payload.longitude === "number" &&
    Number.isFinite(payload.longitude)
  );
}

export function useOrderTrackingSync(
  orderId: string,
  riderUserId?: string | null,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const riderUserIdRef = useRef(riderUserId ?? null);

  useEffect(() => {
    riderUserIdRef.current = riderUserId ?? null;
  }, [riderUserId]);

  useEffect(() => {
    if (!orderId || !enabled) return;

    const controller = new AbortController();
    let socket: ReturnType<typeof io> | undefined;
    let removeVisibilityListener: (() => void) | undefined;
    let removeOnlineListener: (() => void) | undefined;

    void fetch("/api/deliveries/socket-session", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to start delivery updates");
        const session: unknown = await response.json();
        if (!isSocketSession(session)) {
          throw new Error("Invalid delivery socket session");
        }
        return session;
      })
      .then((session) => {
        if (controller.signal.aborted) return;

        socket = io(session.url, {
          auth: { token: session.token },
          autoConnect: false,
          path: session.path,
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          socket?.emit("add-user", session.userId);
          void queryClient.invalidateQueries({
            queryKey: deliveryQueryKeys.order(orderId),
          });
        });

        socket.on(
          "order-status-updated",
          (payload: OrderStatusUpdatedPayload) => {
            if (payload?.orderId !== orderId) return;

            queryClient.setQueryData<OrderDetail>(
              deliveryQueryKeys.order(orderId),
              (current) => {
                if (!current) return current;

                const nextRider = payload.riderId
                  ? {
                      ...(current.rider ?? {}),
                      id: payload.riderId,
                      userId:
                        payload.riderUserId ?? current.rider?.userId ?? null,
                    }
                  : current.rider;
                const nextStatus = payload.status ?? current.status;
                const hasChangedStatus = nextStatus !== current.status;

                return {
                  ...current,
                  eta: payload.eta ?? current.eta,
                  status: nextStatus,
                  rider: nextRider,
                  orderLogs: hasChangedStatus
                    ? [
                        {
                          status: nextStatus,
                          actor: null,
                          timestamp:
                            payload.updatedAt ?? new Date().toISOString(),
                          message: null,
                        },
                        ...(current.orderLogs ?? []),
                      ]
                    : current.orderLogs,
                };
              },
            );

            void queryClient.invalidateQueries({
              queryKey: deliveryQueryKeys.order(orderId),
            });
            void queryClient.invalidateQueries({
              queryKey: deliveryQueryKeys.orders(),
            });
          },
        );

        socket.on(
          "rider-status-updated",
          (payload: RiderStatusUpdatedPayload) => {
            if (payload?.orderId !== orderId) return;
            void queryClient.invalidateQueries({
              queryKey: deliveryQueryKeys.order(orderId),
            });
          },
        );

        socket.on("get-rider-location", (payload: RiderLocationPayload) => {
          if (!payload || !hasLocation(payload)) return;
          if (payload.orderId && payload.orderId !== orderId) return;
          if (
            payload.customerUserId &&
            payload.customerUserId !== session.userId
          ) {
            return;
          }
          if (
            riderUserIdRef.current &&
            payload.riderUserId &&
            payload.riderUserId !== riderUserIdRef.current
          ) {
            return;
          }

          queryClient.setQueryData<OrderDetail>(
            deliveryQueryKeys.order(orderId),
            (current) => {
              if (!current) return current;

              return {
                ...current,
                eta:
                  payload.eta === undefined ? current.eta : payload.eta,
                rider: {
                  ...(current.rider ?? {}),
                  userId:
                    payload.riderUserId ?? current.rider?.userId ?? null,
                  currentLocation: {
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                  },
                },
              };
            },
          );
        });

        socket.on("receive-message", (payload: { orderId?: string; kind?: string }) => {
          if (payload?.orderId !== orderId || payload.kind !== "customer_rider") return;
          void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChat(orderId) });
          void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChatUnread() });
        });

        socket.on("order-chat-read", (payload: { orderId?: string; kind?: string }) => {
          if (payload?.orderId === orderId && payload.kind === "customer_rider") {
            void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChatUnread() });
          }
        });

        const handleVisibility = () => {
          if (!socket) return;
          if (document.visibilityState === "hidden") {
            socket.disconnect();
          } else if (!socket.connected) {
            socket.connect();
          }
        };
        const handleOnline = () => {
          if (socket && !socket.connected) socket.connect();
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("online", handleOnline);
        removeVisibilityListener = () =>
          document.removeEventListener("visibilitychange", handleVisibility);
        removeOnlineListener = () =>
          window.removeEventListener("online", handleOnline);

        if (document.visibilityState !== "hidden") socket.connect();
      })
      .catch(() => {
        // The order query remains a bounded polling fallback if live updates fail.
      });

    return () => {
      controller.abort();
      removeVisibilityListener?.();
      removeOnlineListener?.();
      socket?.disconnect();
    };
  }, [enabled, orderId, queryClient]);
}

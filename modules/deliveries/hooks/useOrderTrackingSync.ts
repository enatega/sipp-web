"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerOrderSocket } from "../components/order-tracking/CustomerOrderLiveConnection";
import { deliveryQueryKeys } from "../queries/queryKeys";
import type { OrderDetail, OrderEta } from "../types/orders";

interface OrderStatusUpdatedPayload {
  orderId?: string; status?: string; riderId?: string | null;
  riderUserId?: string | null; updatedAt?: string; eta?: OrderEta | null;
}
interface RiderLocationPayload {
  orderId?: string; riderUserId?: string; customerUserId?: string;
  latitude?: number; longitude?: number; eta?: OrderEta | null;
}

export function useOrderTrackingSync(orderId: string, riderUserId?: string | null, enabled = true) {
  const queryClient = useQueryClient();
  const connection = useCustomerOrderSocket();
  const riderUserIdRef = useRef(riderUserId ?? null);
  useEffect(() => { riderUserIdRef.current = riderUserId ?? null; }, [riderUserId]);

  useEffect(() => {
    if (!connection || !orderId || !enabled) return;
    const { socket, userId } = connection;
    const onConnect = () => {
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.order(orderId) });
    };
    const onStatus = (payload: OrderStatusUpdatedPayload) => {
      if (payload?.orderId !== orderId) return;
      queryClient.setQueryData<OrderDetail>(deliveryQueryKeys.order(orderId), (current) => {
        if (!current) return current;
        const nextStatus = payload.status ?? current.status;
        return {
          ...current,
          status: nextStatus,
          eta: payload.eta ?? current.eta,
          rider: payload.riderId ? {
            ...(current.rider ?? {}), id: payload.riderId,
            userId: payload.riderUserId ?? current.rider?.userId ?? null,
          } : current.rider,
          orderLogs: nextStatus !== current.status ? [{
            status: nextStatus, actor: null,
            timestamp: payload.updatedAt ?? new Date().toISOString(), message: null,
          }, ...(current.orderLogs ?? [])] : current.orderLogs,
        };
      });
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.order(orderId) });
    };
    const onRiderStatus = (payload: { orderId?: string }) => {
      if (payload?.orderId === orderId) void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.order(orderId) });
    };
    const onLocation = (payload: RiderLocationPayload) => {
      const latitude = payload?.latitude;
      const longitude = payload?.longitude;
      if (!payload || (payload.orderId && payload.orderId !== orderId) ||
          (payload.customerUserId && payload.customerUserId !== userId) ||
          (riderUserIdRef.current && payload.riderUserId && payload.riderUserId !== riderUserIdRef.current) ||
          typeof latitude !== "number" || !Number.isFinite(latitude) ||
          typeof longitude !== "number" || !Number.isFinite(longitude)) return;
      queryClient.setQueryData<OrderDetail>(deliveryQueryKeys.order(orderId), (current) => {
        if (!current) return current;
        return {
          ...current,
          eta: payload.eta === undefined ? current.eta : payload.eta,
          rider: {
            ...(current.rider ?? {}),
            userId: payload.riderUserId ?? current.rider?.userId ?? null,
            currentLocation: { latitude, longitude },
          },
        };
      });
    };
    const onMessage = (payload: { orderId?: string; kind?: string }) => {
      if (payload?.orderId !== orderId || payload.kind !== "customer_rider") return;
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChat(orderId) });
      void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChatUnread() });
    };
    const onRead = (payload: { orderId?: string; kind?: string }) => {
      if (payload?.orderId === orderId && payload.kind === "customer_rider")
        void queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.orderChatUnread() });
    };
    socket.on("connect", onConnect);
    socket.on("order-status-updated", onStatus);
    socket.on("rider-status-updated", onRiderStatus);
    socket.on("get-rider-location", onLocation);
    socket.on("receive-message", onMessage);
    socket.on("order-chat-read", onRead);
    return () => {
      socket.off("connect", onConnect);
      socket.off("order-status-updated", onStatus);
      socket.off("rider-status-updated", onRiderStatus);
      socket.off("get-rider-location", onLocation);
      socket.off("receive-message", onMessage);
      socket.off("order-chat-read", onRead);
    };
  }, [connection, enabled, orderId, queryClient]);
}

"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../auth/AuthContext";
import {
  fetchNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "../../services/notificationService";
import { getCarsByUserId } from "../../services/carService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type NotificationsContextType = {
  notifications: NotificationItem[];
  unreadCount: number;
  add: (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAll: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, getToken, userId } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const prevCarsRef = useRef<Record<string, any>>({});

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const refresh = useCallback(async () => {
    const list = await fetchNotifications();
    // sort desc by createdAt
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(sorted);
  }, []);

  const add = useCallback(async (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
    const saved = await createNotification(n);
    setNotifications((prev) => [saved, ...prev]);
  }, []);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAll = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen to custom DOM events from other parts of the app
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const detail = ce.detail || {};
      if (detail && detail.title && detail.type) {
        add({ type: detail.type, title: detail.title, body: detail.body, meta: detail.meta });
      }
    };
    window.addEventListener("ojest:notify", handler as EventListener);
    return () => window.removeEventListener("ojest:notify", handler as EventListener);
  }, [add]);

  // Optional: Socket listeners for backend events
  useEffect(() => {
    if (!user) return;
    const socket = io(API_BASE || undefined, { autoConnect: true });

    socket.on("connect", () => {
      socket.emit("auth", { userId: user.id || user._id });
    });

    socket.on("chat:message:received", (payload: any) => {
      add({ type: "message", title: "Nowa wiadomość", body: payload?.text || payload?.content, meta: payload });
    });

    socket.on("car:created", (car: any) => {
      add({ type: "car", title: "Dodano ogłoszenie", body: `${car?.make || "Samochód"} ${car?.model || ""}`.trim(), meta: { carId: car?._id } });
    });

    socket.on("car:status", (data: any) => {
      add({ type: "status", title: "Status ogłoszenia", body: `${data?.status || "Zaktualizowano"}`, meta: data });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, add]);

  // Fallback: poll user's cars and detect new cars or status changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const cars = await getCarsByUserId(String(userId), getToken);
        if (cancelled || !Array.isArray(cars)) return;
        const map: Record<string, any> = {};
        cars.forEach((c: any) => {
          map[c._id] = { status: c.status, title: c.title, make: c.make, model: c.model };
        });

        // Detect creations
        Object.keys(map).forEach((id) => {
          if (!prevCarsRef.current[id]) {
            add({
              type: "car",
              title: "Car created",
              body: `${map[id].make || "Car"} ${map[id].model || ""}`.trim() || map[id].title,
              meta: { carId: id },
            });
          }
        });

        // Detect status changes
        Object.keys(map).forEach((id) => {
          const prev = prevCarsRef.current[id];
          if (prev && prev.status !== map[id].status) {
            add({
              type: "status",
              title: "Listing status updated",
              body: `${map[id].status}`,
              meta: { carId: id, status: map[id].status },
            });
          }
        });

        prevCarsRef.current = map;
      } catch (e) {
        // silent
      }
    };

    // initial and interval
    poll();
    const t = setInterval(poll, 45000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [userId, getToken, add]);

  const value: NotificationsContextType = { notifications, unreadCount, add, markRead, markAll, refresh };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

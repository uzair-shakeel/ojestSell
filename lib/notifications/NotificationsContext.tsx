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
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io/";

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
  const recentNotificationsRef = useRef<Set<string>>(new Set());

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const refresh = useCallback(async () => {
    const list = await fetchNotifications();
    // sort desc by createdAt  
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(sorted);
  }, []);

  const add = useCallback(async (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
    // Build a stable dedupe key prioritizing IDs over localized titles/bodies
    let key = n.type;
    const meta: Record<string, any> = n.meta || {};
    if (n.type === "message") {
      const mid = meta.messageId || meta.msgId || meta.id;
      const cid = meta.chatId || meta.chat || meta.threadId;
      if (mid || cid) key += `-m:${mid || ''}-c:${cid || ''}`;
      else key += `-${n.title || ''}-${n.body || ''}`;
    } else if (n.type === "car" || n.type === "status") {
      const car = meta.carId || meta.id;
      const st = meta.status || '';
      if (car) key += `-car:${car}-st:${st}`;
      else key += `-${n.title || ''}-${n.body || ''}`;
    } else {
      key += `-${n.title || ''}-${n.body || ''}`;
    }

    // Skip if we just added this notification recently (within 5 seconds)
    if (recentNotificationsRef.current.has(key)) {
      console.log('[Notifications] Skipping duplicate notification:', key);
      return;
    }

    // Mark as recent
    recentNotificationsRef.current.add(key);
    setTimeout(() => recentNotificationsRef.current.delete(key), 5000);

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
    if (!user || typeof window === 'undefined') return;
    const token = getToken();
    console.log('[Notifications] Connecting to socket:', SOCKET_BASE, 'with path:', SOCKET_PATH);
    const socket = io(SOCKET_BASE, { 
      path: SOCKET_PATH,
      autoConnect: true,
      withCredentials: true,
      auth: { 
        token,
        userId: user.id || user._id 
      }
    });

    socket.on("connect", () => {
      console.log("[Notifications] Socket connected, joining room:", user.id || user._id);
      socket.emit("auth", { userId: user.id || user._id, token });
      socket.emit("join", user.id || user._id);
    });

    socket.on("connect_error", (err: any) => {
      console.error("[Notifications] Socket connection error:", err?.message || err);
      console.error("[Notifications] Attempted connection to:", SOCKET_BASE);
      console.error("[Notifications] With path:", SOCKET_PATH);
      console.error("[Notifications] Full error:", err);
    });

    socket.on("disconnect", (reason: string) => {
      console.warn("[Notifications] Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        console.log("[Notifications] Attempting to reconnect...");
        socket.connect();
      }
    });

    socket.on("chat:message:received", (payload: any) => {
      const senderName = payload?.senderName || payload?.sender?.name || payload?.sender?.firstName || "Ktoś";
      add({ 
        type: "message", 
        title: "Nowa wiadomość", 
        body: `Otrzymałeś wiadomość od ${senderName}`, 
        meta: payload 
      });
    });

    socket.on("car:created", (car: any) => {
      add({ type: "car", title: "Dodano ogłoszenie", body: `${car?.make || "Samochód"} ${car?.model || ""}`.trim(), meta: { carId: car?._id } });
    });

    socket.on("car:status", (data: any) => {
      let title = "Aktualizacja statusu";
      let body = "Status zaktualizowany";
      
      if (data?.status === "Approved") {
        title = "Samochód zatwierdzony";
        body = "Twój samochód został zatwierdzony";
      } else if (data?.status === "Rejected") {
        title = "Samochód odrzucony";
        body = "Twój samochód został odrzucony, spróbuj ponownie";
      } else if (data?.status === "Pending") {
        title = "Status samochodu";
        body = "Twój samochód oczekuje na zatwierdzenie";
      }
      
      add({ type: "status", title, body, meta: data });
    });

    // Global message listener - works on ALL pages
    socket.on("newMessage", (payload: any) => {
      if (!payload || !payload.message) return;
      const { chatId, message } = payload;
      const myUserId = user?.id || user?._id;
      
      // Only notify if message is from someone else
      if (String(message.sender) !== String(myUserId)) {
        console.log("[Notifications] New message received:", { chatId, sender: message.sender, content: message.content });
        add({ 
          type: "message", 
          title: "Nowa wiadomość", 
          body: message.content || "Masz nową wiadomość", 
          meta: { chatId, messageId: message.id } 
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, add]);

  // Fallback: poll user's cars and detect new cars or status changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let isFirstRun = true;

    const poll = async () => {
      try {
        const cars = await getCarsByUserId(String(userId), getToken);
        if (cancelled || !Array.isArray(cars)) return;

        const map: Record<string, any> = {};
        cars.forEach((c: any) => {
          map[c._id] = { status: c.status, title: c.title, make: c.make, model: c.model };
        });

        // Skip creation/status detection on first run (just set baseline)
        if (!isFirstRun) {
          // Skip car creation notifications - they're handled elsewhere
          // Just update the ref without creating notifications

          // Detect status changes
          Object.keys(map).forEach((id) => {
            const prev = prevCarsRef.current[id];
            if (prev && prev.status !== map[id].status) {
              console.log("[Notifications] Status changed:", id, prev.status, "->", map[id].status);
              
              let title = "Aktualizacja statusu";
              let body = "Status zaktualizowany";
              
              if (map[id].status === "Approved") {
                title = "Samochód zatwierdzony";
                body = "Twój samochód został zatwierdzony";
              } else if (map[id].status === "Rejected") {
                title = "Samochód odrzucony";
                body = "Twój samochód został odrzucony, spróbuj ponownie";
              } else if (map[id].status === "Pending") {
                title = "Status samochodu";
                body = "Twój samochód oczekuje na zatwierdzenie";
              }
              
              add({
                type: "status",
                title,
                body,
                meta: { carId: id, status: map[id].status },
              });
            }
          });
        } else {
          console.log("[Notifications] First run - setting baseline with", Object.keys(map).length, "cars");
          isFirstRun = false;
        }

        prevCarsRef.current = map;
      } catch (e) {
        console.error("[Notifications] Poll error:", e);
      }
    };

    // initial and interval
    poll();
    const t = setInterval(poll, 30000); // Check every 30 seconds
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

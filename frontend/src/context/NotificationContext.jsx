import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [silenced,      setSilenced]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("fz_notif_silenced") || "false"); }
    catch { return false; }
  });

  const esRef  = useRef(null); // EventSource ref
  const token  = localStorage.getItem("accessToken") ||
                 sessionStorage.getItem("accessToken");

  const applyNotifications = (list) => {
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  };

  // ── Initial fetch from DB ──────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      applyNotifications(data.notifications || []);
    } catch {}
  }, []);

  // ── SSE connection ─────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (esRef.current) return; // already connected

    // Pass token as query param since EventSource doesn't support headers
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/notifications/stream?token=${token}`;
    const es  = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const notification = JSON.parse(e.data);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch {}
    };

    es.onerror = () => {
      // Auto-reconnect: browser retries EventSource automatically
      // but close and null so we can re-init cleanly
      es.close();
      esRef.current = null;
      // Retry after 5s
      setTimeout(() => { if (user) connectSSE(); }, 5000);
    };

    esRef.current = es;
  }, [token, user]);

  const disconnectSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  // ── Start/stop based on auth ───────────────────────────────
  useEffect(() => {
    if (user) {
      fetchNotifications(); // load history
      connectSSE();         // open live stream
    } else {
      disconnectSSE();
      setNotifications([]);
      setUnreadCount(0);
    }
    return () => disconnectSSE();
  }, [user]);

  // ── Actions ────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const toggleSilence = useCallback(() => {
    setSilenced((prev) => {
      const next = !prev;
      localStorage.setItem("fz_notif_silenced", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, silenced,
      fetchNotifications, markRead, markAllRead, toggleSilence,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
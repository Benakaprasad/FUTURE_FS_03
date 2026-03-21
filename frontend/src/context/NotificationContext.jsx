import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [silenced,      setSilenced]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("fz_notif_silenced") || "false"); }
    catch { return false; }
  });

  const esRef      = useRef(null);
  const retryTimer = useRef(null);

  const applyNotifications = (list) => {
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  };

  // ── Fetch notifications from DB ─────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      applyNotifications(data.notifications || []);
    } catch {
      // Silently fail — SSE will keep it live
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (esRef.current) return; 

    const token = getAccessToken(); 
    if (!token) return;           

    const url = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/notifications/stream?token=${token}`;
    const es  = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const notification = JSON.parse(e.data);
        if (notification.type === "ping") return;
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      retryTimer.current = setTimeout(() => {
        if (user) connectSSE();
      }, 5000);
    };

    esRef.current = es;
  }, [user]); 

  const disconnectSSE = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  // ── Start/stop based on auth state ──────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const t = setTimeout(connectSSE, 100);
      return () => {
        clearTimeout(t);
        disconnectSSE();
      };
    } else {
      disconnectSSE();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
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
      notifications,
      unreadCount,
      silenced,
      fetchNotifications,
      markRead,
      markAllRead,
      toggleSilence,
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
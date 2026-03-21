import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";
import api from "../api/axios";
import { useAuth, getAccessToken } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [silenced,      setSilenced]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("fz_notif_silenced") || "false"); }
    catch { return false; }
  });

  const esRef       = useRef(null);
  const retryTimer  = useRef(null);
  const retryCount  = useRef(0);
  const [sseDown, setSseDown] = useState(false);
  const MAX_RETRIES = 5;

  const applyNotifications = (list) => {
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      applyNotifications(data.notifications || []);
    } catch {
      // Silently fail — SSE keeps it live
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (esRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    const base = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const url  = `${base}/notifications/stream?token=${token}`;
    const es   = new EventSource(url);

    es.onopen = () => {
    retryCount.current = 0;
    setSseDown(false); // ← clear if it was set
  };

    es.onmessage = (e) => {
      try {
        const notification = JSON.parse(e.data);
        // Server sends `: ping\n\n` as a comment — EventSource never fires
        // onmessage for comments, so no ping check needed here
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      if (retryCount.current >= MAX_RETRIES) {
        console.warn('[SSE] Max retries reached.');
        setSseDown(true); 
        return;
      }

      const delay = Math.min(2000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current += 1;

      retryTimer.current = setTimeout(() => {
        if (user) connectSSE();
      }, delay);
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
    retryCount.current = 0;
  }, []);

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

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
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
    notifications,
    unreadCount,
    silenced,
    sseDown,        
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
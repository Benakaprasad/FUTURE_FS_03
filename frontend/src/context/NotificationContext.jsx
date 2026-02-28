import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const POLL_INTERVAL = 30_000; // 30 seconds

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [silenced,      setSilenced]      = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fz_notif_silenced") || "false");
    } catch {
      return false;
    }
  });

  const intervalRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────
  const applyNotifications = (list) => {
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  };

  const reset = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      applyNotifications(data.notifications || []);
    } catch {
      // silently fail
    }
  }, []);

  // ── Start / stop polling based on auth state ───────────────
  const startPolling = useCallback(() => {
    // Don't double-start
    if (intervalRef.current) return;
    fetchNotifications(); // immediate first fetch
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
  }, [fetchNotifications]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      startPolling();
    } else {
      stopPolling();
      reset(); // clear stale data when logged out
    }

    return () => stopPolling(); // cleanup on unmount
  }, [user, startPolling, stopPolling]);

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

  // ── Expose a manual refresh so any page can trigger a fetch ─
  const refresh = fetchNotifications;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        silenced,
        fetchNotifications: refresh,
        markRead,
        markAllRead,
        toggleSilence,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
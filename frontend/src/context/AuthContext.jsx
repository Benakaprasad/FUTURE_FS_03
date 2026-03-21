import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";
import api from "../api/axios";

// ── In-memory token store (XSS-proof) ────────────────────────────────────────
let _accessToken = null;
export const getAccessToken   = ()      => _accessToken;
export const setAccessToken   = (token) => { _accessToken = token; };
export const clearAccessToken = ()      => { _accessToken = null; };

// ── BroadcastChannel for cross-tab sync ──────────────────────────────────────
const authChannel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("fz_auth")
  : null;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [restoring, setRestoring] = useState(false);

  const userRef = useRef(null);
  useEffect(() => { userRef.current = user; }, [user]);

  // ── BroadcastChannel listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!authChannel) return;

    authChannel.onmessage = (event) => {
      const { type, token, userData } = event.data;
      const currentUser = userRef.current;

      switch (type) {

        case "LOGIN":
          if (currentUser) break;
          setAccessToken(token);
          setUser(userData);
          break;

        case "LOGOUT":
          if (!currentUser) break;
          if (userData?.id && currentUser.id !== userData.id) break;
          clearAccessToken();
          setUser(null);
          window.location.href = "/login";
          break;

        case "TOKEN_REFRESH":
          if (!currentUser) break;
          if (userData?.id && currentUser.id !== userData.id) break;
          setAccessToken(token);
          break;

        default:
          break;
      }
    };

    return () => { authChannel.onmessage = null; };
  }, []);

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    const hasSession = localStorage.getItem("fz_has_session");

    if (!hasSession) {
      setLoading(false);
      return;
    }

    setRestoring(true);

    api.post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("fz_has_session");
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        setRestoring(false);
        setLoading(false);
      });
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem("fz_has_session", "true");

    authChannel?.postMessage({
      type:     "LOGIN",
      token:    data.accessToken,
      userData: data.user,
    });

    return data.user;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);

    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem("fz_has_session", "true");

    authChannel?.postMessage({
      type:     "LOGIN",
      token:    data.accessToken,
      userData: data.user,
    });

    return data.user;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const currentUser = userRef.current;

    try {
      await api.post("/auth/logout");
    } catch (_) {}

    clearAccessToken();
    setUser(null);
    localStorage.removeItem("fz_has_session");

    authChannel?.postMessage({
      type:     "LOGOUT",
      userData: { id: currentUser?.id },
    });

    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      restoring,
      login,
      register,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount / page refresh ───────────────
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken"); // ✅ was localStorage

    if (token) {
      // Token exists in this tab — validate it
      api.get("/auth/me")
        .then(({ data }) => setUser(data.user))
        .catch(() => {
          sessionStorage.removeItem("accessToken");      // ✅ was localStorage
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // No token in this tab — try to restore from httpOnly cookie
      api.post("/auth/refresh")
        .then(({ data }) => {
          sessionStorage.setItem("accessToken", data.accessToken); // ✅
          setUser(data.user);
        })
        .catch(() => setUser(null)) // no cookie = not logged in
        .finally(() => setLoading(false));
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    sessionStorage.setItem("accessToken", data.accessToken); // ✅ was localStorage
    setUser(data.user);
    return data.user;
  }, []);

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    sessionStorage.setItem("accessToken", data.accessToken); // ✅ was localStorage
    setUser(data.user);
    return data.user;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch (_) {} // clears httpOnly cookie
    sessionStorage.removeItem("accessToken");            // ✅ was localStorage
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
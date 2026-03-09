import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const authChannel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("fz_auth")
  : null;

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
});

// ── Attach in-memory access token to every request ───────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Refresh queue ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let queue        = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => error ? p.reject(error) : p.resolve(token));
  queue = [];
};

// ── Decode JWT payload (no verification — just to read userId for broadcast) ──
const decodeTokenPayload = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const original  = err.config;

    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    const errorCode = err.response?.data?.code;

    // ── Token expired — attempt silent refresh ────────────────────────────────
    if (errorCode === "TOKEN_EXPIRED") {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Decode to get userId — so other tabs can check if this refresh
        // applies to their user before adopting the token
        const payload = decodeTokenPayload(newToken);
        authChannel?.postMessage({
          type:     "TOKEN_REFRESH",
          token:    newToken,
          userData: { id: payload?.id }, // ← scoped: other tabs check this
        });

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAccessToken();
        localStorage.removeItem("fz_has_session");

        // Broadcast logout — include userId so other tabs can scope it
        const currentPayload = decodeTokenPayload(getAccessToken() || "");
        authChannel?.postMessage({
          type:     "LOGOUT",
          userData: { id: currentPayload?.id },
        });

        window.location.href = "/login";
        return Promise.reject(refreshErr);

      } finally {
        isRefreshing = false;
      }
    }

    // Other 401 — let component handle it
    return Promise.reject(err);
  }
);

export default api;
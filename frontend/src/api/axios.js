import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // send httpOnly refresh token cookie
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      if (err.response?.data?.code === "TOKEN_EXPIRED") {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push({ resolve, reject });
          })
            .then((token) => {
              original.headers.Authorization = `Bearer ${token}`;
              return api(original);
            })
            .catch((e) => Promise.reject(e));
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newToken = data.accessToken;
          localStorage.setItem("accessToken", newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // Other 401 — not expired, just unauthorized
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
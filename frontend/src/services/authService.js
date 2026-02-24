
import { api } from "./api";

const TOKEN_KEY = "tcs_token";

// Attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registerUser({ name, email, password }) {
  const { data } = await api.post("/auth/register", { name, email, password });
  if (data.success && data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data.user;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.success && data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return { user: data.user, session: { token: data.token } };
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  api.post("/auth/logout").catch(() => { });
}

export async function getSessionUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const { data } = await api.get("/auth/me");
    return data.success ? data.user : null;
  } catch (err) {
    // Only clear token if we get a definitive 401 Unauthorized
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return null;
  }
}

export function refreshSession() {
  // JWT tokens are stateless — session is valid as long as token is valid
  return !!localStorage.getItem(TOKEN_KEY);
}

export function isSessionValid() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getSessionTimeRemaining() {
  // With JWT, we can't easily check from client side
  return localStorage.getItem(TOKEN_KEY) ? 30 : 0;
}

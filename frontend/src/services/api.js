
import axios from "axios";

/**
 * Real backend later:
 * - set VITE_API_URL in .env
 * - replace localStorage mocks in services with real API calls here
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 30000,
});

// Global Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, force logout globally
      localStorage.removeItem("tcs_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

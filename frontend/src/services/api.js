
import axios from "axios";

/**
 * Real backend later:
 * - set VITE_API_URL in .env
 * - replace localStorage mocks in services with real API calls here
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    if (envUrl.includes("localhost") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return envUrl.replace("localhost", window.location.hostname);
    }
    return envUrl;
  }
  return `http://${window.location.hostname}:5000/api`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
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

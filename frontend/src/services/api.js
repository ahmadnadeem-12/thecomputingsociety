
import axios from "axios";

/**
 * Real backend later:
 * - set VITE_API_URL in .env
 * - replace localStorage mocks in services with real API calls here
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

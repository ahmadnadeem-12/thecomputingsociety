
import { DEFAULT_ADMIN } from "./constants";

export function safeJsonParse(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

export function getLS(key, fallback) {
  return safeJsonParse(localStorage.getItem(key), fallback);
}

export function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// No-op: Seed data now comes from backend MongoDB
export function ensureSeedData() {
  // Data is seeded via backend seed.js script
  // This function is kept for backward compatibility
}

export function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

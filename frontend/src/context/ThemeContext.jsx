import React, { createContext, useEffect, useMemo, useState } from "react";
import { LS_KEYS } from "../utils/constants";
import { getLS, setLS } from "../utils/helpers";
import { api } from "../services/api";

export const ThemeContext = createContext(null);

// All theme variables with proper naming - MUST MATCH CSS VARIABLES IN global.css
const DEFAULT_THEME = {
  // === Background Colors ===
  "Main Page": "#0a0a0f",
  "Deep Area": "#050508",
  "App Base": "#1a0a25",
  "Card Box": "#120c1c",

  // === Accent Colors ===
  "Primary Accent": "#dc2743",
  "Secondary Accent": "#c234a5",
  "Tertiary Accent": "#9b59b6",
  "Info Accent": "#00d9ff",
  "Warning Accent": "#ffd700",

  // === Text Colors ===
  "Main Text": "#ffffff",
  "Sub Text": "#e8e0ed",
  "Muted Text": "#9a8fa6",
  "Dim Text": "#6b5f78",

  // === Border Colors ===
  "Soft Line": "#292133",
  "Glow Line": "#dc2743",

  // === Title Colors ===
  "Title THE": "#ff4d6d",
  "Title COMPUTING": "#c77dff",
  "Title SOCIETY": "#00d9ff",

  // === Glass Effect ===
  "Glass Box": "#140c1e",
  "Glass Line": "#3a2050",

  // === Sidebar ===
  "Menu Box": "#0f0812",
  "Menu Line": "#3a2050",
  "Menu Text": "#9a8fa6",

  // === TCS Logo Gradient ===
  "Logo Start": "#ff4d6d",
  "Logo Middle": "#c234a5",
  "Logo End": "#9b59b6",

  // === Modal/Dialog ===
  "Popup Box": "#120c1c",
  "Popup Line": "#3a2050",
  "Popup Head": "#ff4d6d",

  // === Links & Buttons ===
  "Hyperlink Text": "#00d9ff",
  "Main Button": "#dc2743",
  "Hover Button": "#c234a5",
};

// Map friendly names to ACTUAL CSS variable names from global.css
const THEME_VAR_MAP = {
  "Main Page": "--bg-dark",
  "Deep Area": "--bg-darker",
  "App Base": "--bg-purple",
  "Card Box": "--bg-card",

  "Primary Accent": "--accent-red",
  "Secondary Accent": "--accent-pink",
  "Tertiary Accent": "--accent-purple",
  "Info Accent": "--accent-cyan",
  "Warning Accent": "--accent-gold",

  "Main Text": "--text-main",
  "Sub Text": "--text-secondary",
  "Muted Text": "--text-muted",
  "Dim Text": "--text-dim",

  "Soft Line": "--border-soft",
  "Glow Line": "--border-glow",

  "Title THE": "--title-the",
  "Title COMPUTING": "--title-computing",
  "Title SOCIETY": "--title-society",

  "Glass Box": "--glass-bg",
  "Glass Line": "--glass-border",

  "Menu Box": "--sidebar-bg",
  "Menu Line": "--sidebar-border",
  "Menu Text": "--sidebar-text",

  "Logo Start": "--tcs-logo-start",
  "Logo Middle": "--tcs-logo-middle",
  "Logo End": "--tcs-logo-end",

  "Popup Box": "--modal-bg",
  "Popup Line": "--modal-border",
  "Popup Head": "--modal-header",

  "Hyperlink Text": "--link-color",
  "Main Button": "--btn-primary",
  "Hover Button": "--btn-hover",
};

// Apply theme to CSS variables - LIVE PREVIEW
function applyThemeToDOM(theme) {
  if (!theme) return;
  const root = document.documentElement;

  Object.entries(theme).forEach(([friendlyName, value]) => {
    const cssVar = THEME_VAR_MAP[friendlyName];
    if (cssVar && value) {
      root.style.setProperty(cssVar, value);
    }
  });
}


export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    async function syncTheme() {
      // 1. Check local storage for quick load
      const saved = getLS(LS_KEYS.THEME, null);
      if (saved) {
        const merged = { ...DEFAULT_THEME, ...saved };
        setTheme(merged);
        applyThemeToDOM(merged);
      }

      // 2. Fetch from backend for global sync
      try {
        const res = await api.get("/theme");
        if (res.data?.success && res.data?.data && Object.keys(res.data.data).length > 0) {
          const remoteTheme = { ...DEFAULT_THEME, ...res.data.data };
          setTheme(remoteTheme);
          applyThemeToDOM(remoteTheme);
          // Update local cache
          setLS(LS_KEYS.THEME, remoteTheme);
        }
      } catch (err) {
        console.error("Failed to sync theme with backend:", err);
      }
    }
    syncTheme();
  }, []);

  const value = useMemo(() => ({
    theme,
    defaultTheme: DEFAULT_THEME,
    setTheme: async (t) => {
      const merged = { ...DEFAULT_THEME, ...t };
      setTheme(merged);
      applyThemeToDOM(merged);
      
      // Save locally
      setLS(LS_KEYS.THEME, merged);

      // Save to backend (only if admin, check handled by backend middleware)
      try {
        await api.post("/theme", { colors: merged });
      } catch (err) {
        console.error("Theme persistent save failed:", err);
      }
    },
    applyLive: (t) => {
      applyThemeToDOM(t);
    },
    reset: async () => {
      localStorage.removeItem(LS_KEYS.THEME);
      setTheme(DEFAULT_THEME);
      applyThemeToDOM(DEFAULT_THEME);
      try {
        await api.delete("/theme");
      } catch (e) {
        console.error("Theme remote reset failed:", e);
      }
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

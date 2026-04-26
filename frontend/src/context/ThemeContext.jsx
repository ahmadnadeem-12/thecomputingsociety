import React, { createContext, useEffect, useMemo, useState } from "react";
import { LS_KEYS } from "../utils/constants";
import { getLS, setLS } from "../utils/helpers";
import { api } from "../services/api";

export const ThemeContext = createContext(null);

// All theme variables with proper naming - MUST MATCH CSS VARIABLES IN global.css
const DEFAULT_THEME = {
  // === Background Colors ===
  "Background Dark": "#0a0a0f",
  "Background Darker": "#050508",
  "Background Purple": "#1a0a25",
  "Background Card": "#120c1c",

  // === Accent Colors ===
  "Accent Red": "#dc2743",
  "Accent Pink": "#c234a5",
  "Accent Purple": "#9b59b6",
  "Accent Cyan": "#00d9ff",
  "Accent Gold": "#ffd700",

  // === Text Colors ===
  "Text Primary": "#ffffff",
  "Text Secondary": "#e8e0ed",
  "Text Muted": "#9a8fa6",
  "Text Dim": "#6b5f78",

  // === Border Colors ===
  "Border Soft": "#292133",
  "Border Glow": "#dc2743",

  // === Title Colors ===
  "Title THE": "#ff4d6d",
  "Title COMPUTING": "#c77dff",
  "Title SOCIETY": "#00d9ff",

  // === Glass Effect ===
  "Glass Background": "#140c1e",
  "Glass Border": "#3a2050",

  // === Sidebar ===
  "Sidebar Background": "#0f0812",
  "Sidebar Border": "#3a2050",
  "Sidebar Text": "#9a8fa6",

  // === TCS Logo Gradient ===
  "TCS Logo Start": "#ff4d6d",
  "TCS Logo Middle": "#c234a5",
  "TCS Logo End": "#9b59b6",

  // === Modal/Dialog ===
  "Modal Background": "#120c1c",
  "Modal Border": "#3a2050",
  "Modal Header": "#ff4d6d",

  // === Links & Buttons ===
  "Link Color": "#00d9ff",
  "Button Primary": "#dc2743",
  "Button Hover": "#c234a5",
};

// Map friendly names to ACTUAL CSS variable names from global.css
const THEME_VAR_MAP = {
  "Background Dark": "--bg-dark",
  "Background Darker": "--bg-darker",
  "Background Purple": "--bg-purple",
  "Background Card": "--bg-card",

  "Accent Red": "--accent-red",
  "Accent Pink": "--accent-pink",
  "Accent Purple": "--accent-purple",
  "Accent Cyan": "--accent-cyan",
  "Accent Gold": "--accent-gold",

  "Text Primary": "--text-main",
  "Text Secondary": "--text-secondary",
  "Text Muted": "--text-muted",
  "Text Dim": "--text-dim",

  "Border Soft": "--border-soft",
  "Border Glow": "--border-glow",

  "Title THE": "--title-the",
  "Title COMPUTING": "--title-computing",
  "Title SOCIETY": "--title-society",

  "Glass Background": "--glass-bg",
  "Glass Border": "--glass-border",

  "Sidebar Background": "--sidebar-bg",
  "Sidebar Border": "--sidebar-border",
  "Sidebar Text": "--sidebar-text",

  "TCS Logo Start": "--tcs-logo-start",
  "TCS Logo Middle": "--tcs-logo-middle",
  "TCS Logo End": "--tcs-logo-end",

  "Modal Background": "--modal-bg",
  "Modal Border": "--modal-border",
  "Modal Header": "--modal-header",

  "Link Color": "--link-color",
  "Button Primary": "--btn-primary",
  "Button Hover": "--btn-hover",
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

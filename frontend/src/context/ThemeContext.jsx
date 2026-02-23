
import React, { createContext, useEffect, useMemo, useState } from "react";
import { LS_KEYS } from "../utils/constants";
import { getLS, setLS } from "../utils/helpers";

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
    // Normal flow: check saved theme
    const saved = getLS(LS_KEYS.THEME, null);
    // Merge saved with default so new keys are always present
    const merged = saved ? { ...DEFAULT_THEME, ...saved } : DEFAULT_THEME;
    setTheme(merged);
    // Force apply all theme values
    applyThemeToDOM(merged);
  }, []);

  const value = useMemo(() => ({
    theme,
    defaultTheme: DEFAULT_THEME,
    setTheme: (t) => {
      setTheme(t);
      setLS(LS_KEYS.THEME, t);
      applyThemeToDOM(t);
    },
    applyLive: (t) => {
      // Apply without saving - for live preview
      applyThemeToDOM(t);
    },
    reset: () => {
      // Clear saved theme and apply defaults
      localStorage.removeItem(LS_KEYS.THEME);
      setTheme(DEFAULT_THEME);
      applyThemeToDOM(DEFAULT_THEME);
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

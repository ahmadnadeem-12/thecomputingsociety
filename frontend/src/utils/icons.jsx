import React from "react";

/**
 * Centralized SVG icon components used across Home page sections.
 * Replaces inline SVG definitions that were duplicated in desktop/mobile sections.
 */

/**
 * Returns a stat icon SVG based on the label text.
 * @param {string} label - Stat label (e.g. "Events Held", "Active Members")
 * @param {string} color - Icon color
 * @returns {JSX.Element}
 */
export function StatIcon({ label, color }) {
  const l = (label || "").toLowerCase();

  if (l.includes("event")) return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (l.includes("active") || l.includes("member")) return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
  );

  if (l.includes("faculty") || l.includes("mentor")) return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10L12 5L2 10L12 15L22 10Z" />
      <path d="M6 12V17C6 17 8 20 12 20C16 20 18 17 18 17V12" />
    </svg>
  );

  return <span style={{ fontSize: "1.2rem" }}>🔥</span>;
}

/**
 * Quick access icon SVGs for the mobile quick-links section.
 */
export function QuickAccessIcon({ label }) {
  const l = (label || "").toLowerCase();

  if (l.includes("cabinet")) return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
      <defs>
        <linearGradient id="gradCabinet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c234a5" />
          <stop offset="100%" stopColor="#9b59b6" />
        </linearGradient>
      </defs>
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2522 22.1614 16.5523C21.6184 15.8524 20.8581 15.3516 20 15.13" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (l.includes("faculty")) return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
      <defs>
        <linearGradient id="gradFaculty" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff3366" />
          <stop offset="100%" stopColor="#dc2743" />
        </linearGradient>
      </defs>
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="url(#gradFaculty)" opacity="0.15" />
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="url(#gradFaculty)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M10 10H14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  if (l.includes("gallery")) return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
      <defs>
        <linearGradient id="gradGallery" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ebff" />
          <stop offset="100%" stopColor="#c234a5" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#gradGallery)" strokeWidth="2.5" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="url(#gradGallery)" />
      <path d="M21 15L16 10L5 21" stroke="url(#gradGallery)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (l.includes("admin")) return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
      <defs>
        <linearGradient id="gradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ff3366" />
        </linearGradient>
      </defs>
      <rect x="3" y="11" width="18" height="11" rx="3" stroke="url(#gradAdmin)" strokeWidth="2.5" />
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="url(#gradAdmin)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16.5" r="1.5" fill="url(#gradAdmin)" />
    </svg>
  );

  if (l.includes("logout")) return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17L21 12L16 7" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return <span>{label?.icon || "🔗"}</span>;
}

/**
 * Notice action icon based on title.
 */
export function NoticeActionIcon({ title }) {
  const t = (title || "").toLowerCase();

  if (t.includes("announcement")) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );

  if (t.includes("event")) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="20" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" />
    </svg>
  );
}

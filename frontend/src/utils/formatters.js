/**
 * Centralized formatting utilities
 * Replaces all duplicate getTimeAgo, getDotColor, getFeatureStyle functions
 * scattered across Home.jsx and other components.
 */

/**
 * Converts a timestamp into a human-readable relative time string.
 * @param {string|Date} timestamp - ISO date string or Date object
 * @param {string} fallback - Fallback string if timestamp is falsy
 * @returns {string} e.g. "just now", "5m ago", "2h ago", "3d ago"
 */
export function getTimeAgo(timestamp, fallback = "2h ago") {
  if (!timestamp) return fallback;
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Returns accent color based on index position (for notice cards, etc.)
 * @param {number} idx - Item index
 * @returns {string} Hex color string
 */
export function getDotColor(idx) {
  if (idx === 0) return "#ff3366";
  if (idx === 1) return "#00ebff";
  return "#00f5d4";
}

/**
 * Returns a gradient and icon for feature/offering cards based on title.
 * @param {string} title - Feature title
 * @returns {{ icon: string, grad: string }}
 */
export function getFeatureStyle(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("workshop")) return { icon: "🚀", grad: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)" };
  if (t.includes("competition")) return { icon: "🏆", grad: "linear-gradient(135deg, #667eea, #764ba2)" };
  if (t.includes("hackathon")) return { icon: "💡", grad: "linear-gradient(135deg, #a18cd1, #fbc2eb)" };
  if (t.includes("bootcamp")) return { icon: "🎯", grad: "linear-gradient(135deg, #21d4fd, #b721ff)" };
  return { icon: "✨", grad: "linear-gradient(135deg, #8BC6EC, #9599E2)" };
}

/**
 * Returns the navigation path for a notice card based on its title.
 * @param {{ title?: string, link?: string }} notice - Notice object
 * @returns {string} Route path
 */
export function getNoticePath(notice) {
  const title = (notice?.title || "").toLowerCase();
  if (title.includes("announcement")) return "/announcements";
  if (title.includes("event")) return "/events";
  if (title.includes("ticket")) return "/tickets";
  return notice?.link || "/";
}

/**
 * Returns an emoji icon for a notice based on its title.
 * @param {string} title - Notice title
 * @param {string} fallbackIcon - Fallback icon if no match
 * @returns {string} Emoji string
 */
export function getNoticeIcon(title, fallbackIcon = "🔔") {
  const t = (title || "").toLowerCase();
  if (t.includes("announcement")) return "📢";
  if (t.includes("event")) return "🎤";
  if (t.includes("ticket")) return "🎟️";
  return fallbackIcon;
}

/**
 * Returns icon color based on stat label.
 * @param {string} label - Stat label
 * @returns {string} Hex color
 */
export function getStatColor(label) {
  const l = (label || "").toLowerCase();
  if (l.includes("event")) return "#ff3366";
  if (l.includes("active") || l.includes("member")) return "#00ebff";
  return "#c234a5";
}

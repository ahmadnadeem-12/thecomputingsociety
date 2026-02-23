
export const APP_NAME = "TCS – The Computing Society";

export const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/" },
  { key: "cabinet", label: "Cabinet", path: "/cabinet" },
  { key: "faculty", label: "Faculty", path: "/faculty" },
  { key: "events", label: "Events", path: "/events" },
  { key: "announcements", label: "Announcements", path: "/announcements" },
  { key: "programs", label: "Programs", path: "/programs" },
  { key: "gallery", label: "Gallery", path: "/gallery" },
  { key: "tickets", label: "Tickets", path: "/tickets" },
  { key: "admin", label: "Admin", path: "/admin/login" },
];

export const LS_KEYS = {
  USERS: "tcs_users",
  SESSION: "tcs_session",
  EVENTS: "tcs_events",
  TICKETS: "tcs_tickets",
  CABINET: "tcs_cabinet",
  FACULTY: "tcs_faculty",
  THEME: "tcs_theme",
};

export const DEFAULT_ADMIN = {
  email: "admin@tcs.uaf",
  password: "admin123",
  role: "admin",
  name: "TCS Admin",
};

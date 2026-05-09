import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/", icon: "🏠" },
  { key: "cabinet", label: "Cabinet", path: "/cabinet", icon: "👥" },
  { key: "faculty", label: "Faculty", path: "/faculty", icon: "👨‍🏫" },
  { key: "events", label: "Events", path: "/events", icon: "📅" },
  { key: "announcements", label: "Announcements", path: "/announcements", icon: "📢" },
  { key: "programs", label: "Programs", path: "/programs", icon: "🎯" },
  { key: "gallery", label: "Gallery", path: "/gallery", icon: "📸" },
  { key: "tickets", label: "Tickets", path: "/tickets", icon: "🎟️" },
  { key: "admin", label: "Admin", path: "/admin/login", icon: "🔐" },
];

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function Navbar() {
  const { isAuthed, isAdmin, loading, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) return null;

  // Dynamic nav items based on auth
  const baseNavItems = NAV_ITEMS.filter(item => {
    // If logged in as regular user, hide Admin
    if (item.key === "admin" && isAuthed && !isAdmin) return false;
    return true;
  }).map(item => {
    // If admin, update label
    if (item.key === "admin" && isAuthed && isAdmin) {
      return { ...item, label: "Admin Panel", path: "/admin/dashboard", icon: "🛠️" };
    }
    return item;
  });

  const isVerified = user?.isVerified || isAdmin;
  
  // Build the final nav list
  const filteredNavItems = [...baseNavItems];

  if (isAuthed && isVerified) {
    const ticketsIdx = filteredNavItems.findIndex(i => i.key === "tickets");
    if (ticketsIdx !== -1) {
      filteredNavItems.splice(ticketsIdx + 1, 0, { key: "profile", label: "My Profile", path: "/profile", icon: "👤" });
    }
  }

  // Add Logout at the end if authed
  if (isAuthed) {
    filteredNavItems.push({ key: "logout", label: "Logout", path: "#", icon: "🚪", isLogout: true });
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobileMenuOpen');
    } else {
      document.body.classList.remove('mobileMenuOpen');
    }
    return () => {
      document.body.classList.remove('mobileMenuOpen');
    };
  }, [mobileMenuOpen]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {!mobileMenuOpen && (
        <button
          className="hamburgerBtn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <div className="hamLine line-1"></div>
          <div className="hamLine line-2"></div>
          <div className="hamLine line-3"></div>
        </button>
      )}

      {/* MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark overlay - click to close */}
            <motion.div
              className="mobileMenuOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobileMenu"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header with Close Button and Centered Logo */}
              <div className="mobileMenuHeader">
                <button 
                  className="mobileMenuClose" 
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>

                <div className="mobileMenuLogo">
                  <div className="logoCircle" style={{ width: 68, height: 68 }}>
                    <span className="logoText" style={{ fontSize: "1.1rem" }}>TCS</span>
                  </div>
                  <div className="mobileMenuBranding">
                    <div className="brandingWord wordThe">THE</div>
                    <div className="brandingWord wordComputing">COMPUTING</div>
                    <div className="brandingWord wordSociety">SOCIETY</div>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="mobileMenuNav">
                {filteredNavItems.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    variants={itemVariants}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.isLogout ? (
                      <button 
                        type="button"
                        className="logoutBtn" 
                        onClick={() => {
                          logout();
                          navigate("/");
                        }}
                      >
                        <span className="mobileNavIcon">🚪</span>
                        Logout
                      </button>
                    ) : (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `mobileNavLink ${isActive ? "active" : ""}`}
                        end={item.path === "/"}
                        onClick={handleNavClick}
                      >
                        <span className="mobileNavIcon">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <div className="mobileMenuFooter">
                © TCS • UAF • 2025–26
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - Hidden on mobile via CSS */}
      <motion.aside
        className="sidebar desktopSidebar"
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
      >
        {/* Header */}
        <motion.div className="sidebarHeader" variants={itemVariants}>
          <motion.div
            className="logoCircle"
            whileHover={{ scale: 1.05, rotate: 3 }}
          >
            <span className="logoText">TCS</span>
            <div className="logoShine" />
          </motion.div>
          <div className="sidebarBranding">
            <div className="brandingTitle" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div className="brandThe" style={{ color: "#ff3366", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "0.18em", lineHeight: "1" }}>THE</div>
              <div className="brandComputing" style={{ 
                fontSize: "1.6rem", 
                fontWeight: 900,
                color: "#c234a5",
                letterSpacing: "0.12em",
                lineHeight: "1"
              }}>COMPUTING</div>
              <div className="brandSociety" style={{ 
                fontSize: "1.6rem", 
                fontWeight: 900,
                color: "#00d9ff",
                letterSpacing: "0.12em",
                lineHeight: "1"
              }}>SOCIETY</div>
            </div>
            <div className="brandingSubtitle" style={{ fontSize: "0.85rem", marginTop: "8px", fontWeight: "600", color: "rgba(255,255,255,0.7)" }}>DEPT. OF COMPUTER SCIENCE</div>
          </div>
          <div className="headerGlow" />
        </motion.div>

        {/* Navigation Links */}
        <nav className="nav">
          {filteredNavItems.map((item) => (
            <motion.div
              key={item.key}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {item.isLogout ? (
                <button
                  type="button"
                  className="navLink logoutBtnSidebar"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none", background: "none" }}
                >
                  <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                  <span className="navLabel">{item.label}</span>
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
                  end={item.path === "/"}
                >
                  <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                  <span className="navLabel">{item.label}</span>
                </NavLink>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: "auto",
            padding: "1rem 0.5rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{
            color: "var(--text-dim)",
            fontSize: "1.2rem",
            textAlign: "center",
            opacity: 1,
          }}>
            <div style={{ marginBottom: "0.25rem" }}>© TCS • UAF</div>
            <div style={{
              background: "linear-gradient(90deg, #dc2743, #c234a5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}>
              2025–26 Cabinet
            </div>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}

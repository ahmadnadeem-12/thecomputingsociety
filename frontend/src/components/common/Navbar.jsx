import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
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
  const { isAuthed, isAdmin, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic nav items based on auth
  const navItems = NAV_ITEMS.map(item => {
    if (item.key === "admin" && isAuthed && isAdmin) {
      return { ...item, label: "Admin Panel", path: "/admin/dashboard", icon: "🛠️" };
    }
    return item;
  });

  // Insert Profile link ONLY if authed AND verified
  const { user } = useAuth();
  const isVerified = user?.isVerified || isAdmin;

  if (isAuthed && isVerified) {
    const ticketsIdx = navItems.findIndex(i => i.key === "tickets");
    navItems.splice(ticketsIdx + 1, 0, { key: "profile", label: "My Profile", path: "/profile", icon: "👤" });
  }

  const filteredNavItems = navItems;

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
              <button 
                className="mobileMenuClose" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>

              {/* Logo */}
              <div className="mobileMenuLogo">
                <div className="logoCircle" style={{ width: 80, height: 80 }}>
                  <span className="logoText" style={{ fontSize: "1.4rem" }}>TCS</span>
                </div>
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 950, color: "#ff3366", letterSpacing: "0.18em", lineHeight: 1.1 }}>THE</div>
                  <div style={{ 
                    fontSize: "1.4rem", 
                    fontWeight: 950, 
                    color: "#c234a5",
                    letterSpacing: "0.08em",
                    lineHeight: 1.1,
                    margin: "2px 0"
                  }}>COMPUTING</div>
                  <div style={{ 
                    fontSize: "1.4rem", 
                    fontWeight: 950, 
                    color: "#00d9ff",
                    letterSpacing: "0.08em",
                    lineHeight: 1.1
                  }}>SOCIETY</div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="mobileMenuNav">
                {filteredNavItems.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `mobileNavLink ${isActive ? "active" : ""}`}
                      end={item.path === "/"}
                      onClick={handleNavClick}
                    >
                      <span className="mobileNavIcon">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <div className="mobileMenuFooter">
                © TCS • UAF • 2024–25
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
            <div className="brandingTitle" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div className="brandThe" style={{ color: "#ff3366", fontSize: "1.3rem", fontWeight: 900, letterSpacing: "0.18em", lineHeight: "1" }}>THE</div>
              <div className="brandComputing" style={{ 
                fontSize: "1.3rem", 
                fontWeight: 900,
                color: "#c234a5",
                letterSpacing: "0.12em",
                lineHeight: "1"
              }}>COMPUTING</div>
              <div className="brandSociety" style={{ 
                fontSize: "1.3rem", 
                fontWeight: 900,
                color: "#00d9ff",
                letterSpacing: "0.12em",
                lineHeight: "1"
              }}>SOCIETY</div>
            </div>
            <div className="brandingSubtitle" style={{ fontSize: "0.65rem", marginTop: "4px" }}>DEPT. OF COMPUTER SCIENCE</div>
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
              <NavLink
                to={item.path}
                className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
                end={item.path === "/"}
              >
                <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                <span className="navLabel">{item.label}</span>
              </NavLink>
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
            fontSize: "0.72rem",
            textAlign: "center",
            opacity: 0.75,
          }}>
            <div style={{ marginBottom: "0.25rem" }}>© TCS • UAF</div>
            <div style={{
              background: "linear-gradient(90deg, #dc2743, #c234a5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}>
              2024–25 Cabinet
            </div>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}

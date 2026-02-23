import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* HAMBURGER BUTTON - Mobile only */}
      <button
        className="hamburgerBtn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobileMenu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* Logo */}
            <div className="mobileMenuLogo">
              <div className="logoCircle" style={{ width: 60, height: 60 }}>
                <span className="logoText" style={{ fontSize: "1.2rem" }}>TCS</span>
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--title-the)" }}>THE</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--title-computing)" }}>COMPUTING</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--title-society)" }}>SOCIETY</div>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="mobileMenuNav">
              {NAV_ITEMS.map((item, idx) => (
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
            <div className="brandingTitle">
              <div className="brandWord brandThe">THE</div>
              <div className="brandWord brandComputing">COMPUTING</div>
              <div className="brandWord brandSociety">SOCIETY</div>
            </div>
            <div className="brandingSubtitle">DEPT. OF COMPUTER SCIENCE</div>
          </div>
          <div className="headerGlow" />
        </motion.div>

        {/* Navigation Links */}
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
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
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
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

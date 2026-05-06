
import React from "react";
import { motion } from "framer-motion";

export default function Sidebar({ tabs, activeTab, setTab, logout, nav }) {
  return (
    <aside className="adminSidebar">
      <div className="sidebarBrand" onClick={() => nav("/")}>
        <div className="brandLogo">TCS</div>
        <div className="brandName">Admin Panel</div>
      </div>

      <nav className="sidebarNav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`navItem ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setTab(tab.key)}
          >
            <span className="navIcon">{tab.icon}</span>
            <span className="navLabel">{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="activeIndicator"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebarFooter">
        <button className="btn btnGhost logoutBtn" onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}


import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "1.25rem",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <div style={{
          background: "linear-gradient(90deg, #dc2743, #c234a5, #9b59b6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
        }}>
          THE COMPUTING SOCIETY
        </div>
        <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          Built with ❤️ for UAF • Final Year Project
        </div>
        <div style={{
          display: "flex",
          gap: "1.5rem",
          marginTop: "0.5rem",
          fontSize: "0.72rem",
          opacity: 0.5,
        }}>
          <span>© 2024-25 Cabinet</span>
          <span>•</span>
          <span>Dept. of Computer Science</span>
        </div>
      </div>
    </motion.footer>
  );
}


import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEOHead from "../components/common/SEOHead";

export default function NotFound() {
  return (
    <section className="section" style={{
      textAlign: "center",
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." />

      {/* Background Effects */}
      <div className="floatingOrb orb1" style={{ opacity: 0.3 }} />
      <div className="floatingOrb orb2" style={{ opacity: 0.2 }} />

      {/* 404 Number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{
          fontSize: "8rem",
          fontWeight: 900,
          fontFamily: "Outfit, sans-serif",
          background: "linear-gradient(135deg, #dc2743 0%, #c234a5 50%, #9b59b6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "none",
          filter: "drop-shadow(0 0 30px rgba(220, 39, 67, 0.5))",
          lineHeight: 1
        }}
      >
        404
      </motion.div>

      {/* Glitch Effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text-main)",
          marginTop: "0.5rem",
          marginBottom: "1rem"
        }}
      >
        Oops! Page Not Found
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          color: "var(--text-muted)",
          fontSize: "1rem",
          maxWidth: "400px",
          lineHeight: 1.6,
          marginBottom: "2rem"
        }}
      >
        The page you're looking for doesn't exist or has been moved.
        Don't worry, let's get you back on track!
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}
      >
        <Link to="/">
          <motion.button
            className="btn btnPrimary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Go Home
          </motion.button>
        </Link>
        <Link to="/events">
          <motion.button
            className="btn btnGhost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📅 View Events
          </motion.button>
        </Link>
        <motion.button
          className="btn btnGhost"
          onClick={() => window.history.back()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Go Back
        </motion.button>
      </motion.div>

      {/* Fun Animation */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          marginTop: "3rem",
          fontSize: "4rem"
        }}
      >
        🔍
      </motion.div>

      {/* Decorative Elements */}
      <div style={{
        position: "absolute",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "0.5rem"
      }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--gradient-main)"
            }}
          />
        ))}
      </div>
    </section>
  );
}

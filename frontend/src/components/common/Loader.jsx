
import React from "react";
import { motion } from "framer-motion";

export default function Loader({ subtitle = "Dept. of Computer Science • UAF" }) {
  return (
    <div className="loaderWrap">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 10 + Math.random() * 20,
            height: 10 + Math.random() * 20,
            borderRadius: "50%",
            background: `rgba(${194 + Math.random() * 40}, ${52 + Math.random() * 40}, ${165 + Math.random() * 40}, 0.3)`,
            filter: "blur(2px)",
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Animated Logo with Glow */}
        <motion.div
          style={{
            position: "relative",
            display: "inline-block",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.2, 1.2, 0.3, 1]
          }}
        >
          {/* Outer glow ring */}
          <motion.div
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: 32,
              background: "conic-gradient(from 0deg, #dc2743, #c234a5, #9b59b6, #00d9ff, #dc2743)",
              opacity: 0.6,
              filter: "blur(15px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Animated border */}
          <motion.div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 28,
              background: "conic-gradient(from 0deg, #dc2743, #c234a5, #9b59b6, #00d9ff, #dc2743)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo */}
          <motion.div
            className="loaderLogo"
            style={{
              position: "relative",
              width: 110,
              height: 110,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "2.5rem",
              letterSpacing: "0.12em",
              color: "#fff",
              background: "linear-gradient(135deg, #dc2743, #c234a5)",
              boxShadow: "0 20px 60px rgba(220,39,67,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            TCS
          </motion.div>
        </motion.div>

        {/* Text with stagger animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginTop: "1.5rem" }}
        >
          <motion.div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "#ff4d6d" }}>THE</span>{" "}
            <span style={{ color: "#c77dff" }}>COMPUTING</span>{" "}
            <span style={{ color: "#00d9ff" }}>SOCIETY</span>
          </motion.div>

          <motion.div
            className="loaderText"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {subtitle}
          </motion.div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1.25rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dc2743, #c234a5)",
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

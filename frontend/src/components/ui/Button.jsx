
import React from "react";
import { motion } from "framer-motion";

export function Button({ variant = "primary", className = "", children, ...props }) {
  const baseClass = variant === "ghost" ? "btn btnGhost" : "btn btnPrimary";

  return (
    <motion.button
      className={`${baseClass} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

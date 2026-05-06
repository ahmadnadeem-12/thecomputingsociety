
import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon, color }) {
  return (
    <motion.div 
      className="statsCard"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="statsIcon" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      <div className="statsInfo">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
      <div className="statsGlow" style={{ background: `radial-gradient(circle at center, ${color}10 0%, transparent 70%)` }} />
    </motion.div>
  );
}

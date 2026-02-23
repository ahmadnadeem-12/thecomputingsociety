
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { listAnnouncements } from "../services/announcementService";
import "../assets/styles/pages/announcements.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

export default function Announcements() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listAnnouncements().then(data => setItems(data || [])).catch(() => setItems([]));
  }, []);

  return (
    <section className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sectionHeader">
          <div>
            <div className="sectionTitle">Announcements</div>
            <div className="sectionSubtitle">
              Stay updated with latest news and notices
            </div>
          </div>
          <div className="pill pillRed">📢 News</div>
        </div>
      </motion.div>

      <motion.div
        className="announcementsGrid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((a) => (
          <motion.div
            key={a._id || a.id}
            className={`announcementCard ${a.priority}`}
            variants={cardVariants}
            whileHover={{ x: 8 }}
          >
            <div className="announcementHeader">
              <div className="announcementTitle">{a.title}</div>
              <div className="announcementDate">{a.date}</div>
            </div>

            <div className="announcementBody">{a.body}</div>

            {(a.tags || []).length > 0 && (
              <div className="announcementTags">
                {a.tags.map(t => (
                  <span key={t} className="announcementTag">{t}</span>
                ))}
                <span className={`announcementTag ${a.priority === "urgent" ? "pill pillRed" : ""}`} style={{ marginLeft: "auto" }}>
                  {a.priority}
                </span>
              </div>
            )}

            {a.link && (
              <div style={{ marginTop: "1rem" }}>
                <Link to={a.link} className="btn btnPrimary" style={{ padding: ".5rem 1rem", fontSize: ".8rem" }}>
                  {a.linkText || "Learn More"}
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {items.length === 0 && (
        <motion.div
          className="emptyState"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="emptyIcon">📢</div>
          <div className="emptyTitle">No Announcements</div>
          <div className="emptyText">Check back later for updates</div>
        </motion.div>
      )}
    </section>
  );
}

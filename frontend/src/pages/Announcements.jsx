
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton, SkeletonTitle, SkeletonText, SkeletonPill } from "../components/ui/Skeleton";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAnnouncements()
      .then(data => {
        const sorted = (data || []).sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(a.createdAt || 0);
          const dateB = b.date ? new Date(b.date) : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setItems(sorted);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
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

      {loading ? (
        <div className="announcementsGrid">
          {[1, 2, 3].map(i => (
            <div key={i} className="announcementCard">
              <div className="announcementHeader">
                <SkeletonTitle style={{ height: "1.2rem", width: "60%" }} />
                <Skeleton style={{ height: "0.8rem", width: "80px" }} />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <SkeletonText lines={3} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                <SkeletonPill />
                <SkeletonPill />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
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

                {(a.attachment || a.link) && (
                  <div style={{ marginTop: "1.2rem", display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                    {a.attachment && (
                      <a 
                        href={a.attachment} 
                        download={a.attachmentLabel || "Download"}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btnPrimary" 
                        style={{ 
                          padding: ".6rem 1.2rem", 
                          fontSize: ".85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".5rem",
                          background: "linear-gradient(135deg, #00d9ff, #0077ff)",
                          color: "#fff",
                          fontWeight: 800,
                          border: "none",
                          boxShadow: "0 4px 15px rgba(0, 217, 255, 0.3)",
                          borderRadius: "10px",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase"
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>{a.attachment.toLowerCase().includes('pdf') ? '📄' : '📊'}</span>
                        {a.attachmentLabel || "Download File"}
                      </a>
                    )}
                    
                    {a.link && (
                      <a 
                        href={a.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn" 
                        style={{ 
                          padding: ".6rem 1.2rem", 
                          fontSize: ".85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".5rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "var(--text-muted)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "10px",
                          fontWeight: 600,
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.borderColor = "var(--accent-pink)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>{a.link.includes('drive.google.com') || a.link.includes('onedrive') ? '☁️' : '🔗'}</span>
                        {a.linkText || "View Link"}
                      </a>
                    )}
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
        </>
      )}
    </section>
  );
}

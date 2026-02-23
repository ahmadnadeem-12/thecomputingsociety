
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listPrograms } from "../services/programService";
import { listDegrees } from "../services/degreeService";
import { Modal } from "../components/ui/Modal";
import "../assets/styles/pages/programs.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

export default function Programs() {
  const [items, setItems] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [degreeModalOpen, setDegreeModalOpen] = useState(false);

  useEffect(() => {
    listPrograms().then(data => setItems(data || [])).catch(() => setItems([]));
    listDegrees().then(data => setDegrees(data || [])).catch(() => setDegrees([]));
  }, []);

  // Filter items based on selected filter
  const filtered = filter === "all" ? items :
    filter === "academic" ? [] :
      items.filter(p => p.type === filter);

  const types = [
    { key: "all", label: "All Programs", icon: "📚" },
    { key: "workshop", label: "Workshops", icon: "🛠️" },
    { key: "bootcamp", label: "Bootcamps", icon: "🚀" },
    { key: "competition", label: "Competitions", icon: "🏆" },
    { key: "talk", label: "Talks", icon: "🎤" },
    { key: "academic", label: "Academic Programs", icon: "🎓" },
  ];

  const openDegreeModal = (degree) => {
    setSelectedDegree(degree);
    setDegreeModalOpen(true);
  };

  return (
    <section className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sectionHeader">
          <div>
            <div className="sectionTitle">Programs</div>
            <div className="sectionSubtitle">
              Explore our workshops, bootcamps, competitions, and academic programs
            </div>
          </div>
          <div className="pill pillRed">🎯 Learning</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {types.map(t => (
          <motion.button
            key={t.key}
            className={`pill ${filter === t.key ? "pillRed" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setFilter(t.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.icon} {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* ==================== ACADEMIC PROGRAMS (Degrees) ==================== */}
      {filter === "academic" && (
        <>
          <motion.div
            className="degreesGrid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {degrees.map((deg) => (
              <motion.div
                key={deg.id}
                className="degreeCard"
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -6 }}
                onClick={() => openDegreeModal(deg)}
              >
                <div className="degreeIcon">{deg.icon}</div>
                <div className="degreeCode">{deg.code}</div>
                <div className="degreeName">{deg.name}</div>
                <div className="degreeMeta">
                  <span>📅 {deg.duration}</span>
                  <span>📖 {deg.semesters} Semesters</span>
                </div>
                {/* Info Button - Stylish */}
                <button
                  className="degreeInfoBtn"
                  onClick={(e) => { e.stopPropagation(); openDegreeModal(deg); }}
                  title="View Details & Download PDF"
                >
                  <span className="infoIcon">ℹ</span>
                </button>
              </motion.div>
            ))}
          </motion.div>

          {degrees.length === 0 && (
            <motion.div
              style={{ textAlign: "center", padding: "3rem 1rem" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.4 }}>🎓</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>No Academic Programs</div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Check back later</div>
            </motion.div>
          )}
        </>
      )}

      {/* ==================== OTHER PROGRAMS ==================== */}
      {filter !== "academic" && (
        <motion.div
          className="programsGrid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              className="programCard"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              {/* Type Badge */}
              <div className={`programType ${p.type}`}>{p.type}</div>

              <div className="programInner">
                <div className="programIcon">{p.icon}</div>
                <div className="programTitle">{p.title}</div>
                <div className="programDesc">{p.description}</div>

                {/* Tags */}
                {(p.tags || []).length > 0 && (
                  <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    {p.tags.slice(0, 3).map(t => (
                      <span key={t} className="pill" style={{ fontSize: ".65rem" }}>{t}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="programStats">
                  <div className="programStat">
                    <div className="programStatValue">{p.duration}</div>
                    <div className="programStatLabel">Duration</div>
                  </div>
                  <div className="programStat">
                    <div className="programStatValue">{p.participants}</div>
                    <div className="programStatLabel">Participants</div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ marginTop: "1rem", fontSize: ".82rem", color: "var(--text-muted)" }}>
                  <div>📅 {p.startDate || "TBA"}</div>
                  <div>👨‍🏫 {p.instructor || "TBA"}</div>
                </div>

                {/* Status & Action */}
                <div className="programActions">
                  <span className={`pill ${p.status === "open" || p.status === "ongoing" ? "pillRed" : ""}`}>
                    {p.status}
                  </span>
                  <button className="btn btnPrimary" style={{ padding: ".45rem .9rem", fontSize: ".78rem" }}>
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {filter !== "academic" && filtered.length === 0 && (
        <motion.div
          style={{ textAlign: "center", padding: "3rem 1rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.4 }}>🎯</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>No Programs Found</div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Try a different category</div>
        </motion.div>
      )}

      {/* ==================== DEGREE DETAIL MODAL ==================== */}
      <Modal
        open={degreeModalOpen}
        title={selectedDegree?.fullName || "Academic Program"}
        onClose={() => setDegreeModalOpen(false)}
        maxWidth="580px"
      >
        <AnimatePresence>
          {selectedDegree && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center" }}
            >
              {/* Header */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>{selectedDegree.icon}</div>
                <div style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  background: "var(--gradient-main)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  {selectedDegree.code}
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: "0.25rem", fontSize: "1rem" }}>
                  {selectedDegree.name}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div className="detailItem">
                  <div className="detailLabel">📅 Duration</div>
                  <div className="detailValue">{selectedDegree.duration}</div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">📖 Semesters</div>
                  <div className="detailValue">{selectedDegree.semesters} Semesters</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.25rem", textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  About this Program
                </div>
                <div style={{ lineHeight: 1.7, color: "var(--text-secondary)" }}>
                  {selectedDegree.description}
                </div>
              </div>

              {/* Courses */}
              <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  📚 Key Courses
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(selectedDegree.courses || []).map((course, idx) => (
                    <span key={idx} className="pill" style={{ fontSize: "0.75rem" }}>
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              {/* PDF Download Button */}
              <div style={{
                background: "linear-gradient(135deg, rgba(220, 39, 67, 0.1), rgba(194, 52, 165, 0.1))",
                padding: "1.25rem",
                borderRadius: "16px",
                border: "1px solid rgba(220, 39, 67, 0.3)"
              }}>
                {selectedDegree.pdfUrl ? (
                  <a
                    href={selectedDegree.pdfUrl}
                    download={selectedDegree.pdfName || `${selectedDegree.code}_course_outline.pdf`}
                    className="btn btnPrimary"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.75rem 1.5rem",
                      fontSize: "0.95rem"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>📥</span>
                    Download Course Outline (PDF)
                  </a>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "2rem", opacity: 0.5 }}>📄</span>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      Course outline PDF coming soon
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </section>
  );
}

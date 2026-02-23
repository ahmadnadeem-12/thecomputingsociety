
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../components/ui/Modal";
import { listCabinet } from "../services/cabinetService";
import "../assets/styles/pages/cabinet.css";

const socials = [
  { key: "linkedin", label: "in", color: "#0077b5" },
  { key: "instagram", label: "ig", color: "#e4405f" },
  { key: "facebook", label: "fb", color: "#1877f2" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

export default function Cabinet() {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listCabinet().then(data => setMembers(data || [])).catch(() => setMembers([]));
  }, []);

  const onOpen = (m) => {
    setSelected(m);
    setOpen(true);
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
            <div className="sectionTitle">Cabinet 2024-25</div>
            <div className="sectionSubtitle">
              Meet our leadership team • Click on any card for full profile
            </div>
          </div>
          <div className="pill pillRed">TCS Leadership</div>
        </div>
      </motion.div>

      <motion.div
        className="cabinetGrid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {members.map((m, index) => (
          <motion.button
            key={m._id || m.id}
            className="profileCard"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(m)}
          >
            {/* Hover Glow Overlay */}
            <div className="glowOverlay" />

            {/* Profile Photo */}
            <div className="dpWrap">
              <div className="dpInner">
                <img src={m.avatar} alt={m.name} />
              </div>
            </div>

            {/* Name & Role */}
            <div className="cardName">{m.name}</div>
            <div className="cardRole">{m.role}</div>

            {/* Degree Badge */}
            {m.degree && (
              <div className="pill" style={{ marginTop: "0.75rem", fontSize: "0.7rem" }}>
                {m.degree}
              </div>
            )}

            {/* Social Icons */}
            <div className="socialRow">
              {socials.map((s) =>
                m.socials?.[s.key] ? (
                  <motion.a
                    key={s.key}
                    className="socialIcon"
                    href={m.socials[s.key]}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{
                      scale: 1.15,
                      backgroundColor: s.color,
                      borderColor: s.color,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span style={{ fontWeight: 900 }}>{s.label}</span>
                  </motion.a>
                ) : (
                  <span
                    key={s.key}
                    className="socialIcon"
                    style={{ opacity: 0.3, cursor: "default" }}
                  >
                    <span style={{ fontWeight: 900 }}>{s.label}</span>
                  </span>
                )
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Detail Modal */}
      <Modal
        open={open}
        title="Cabinet Member"
        onClose={() => setOpen(false)}
        maxWidth="680px"
      >
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="modalCenter"
            >
              {/* Header with Photo */}
              <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                <motion.div
                  className="dpWrap"
                  style={{ width: 100, height: 100 }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="dpInner">
                    <img src={selected.avatar} alt={selected.name} />
                  </div>
                </motion.div>
                <div style={{ textAlign: "left" }}>
                  <div className="cardName" style={{ textAlign: "left", fontSize: "1.3rem" }}>
                    {selected.name}
                  </div>
                  <div className="cardRole" style={{ textAlign: "left" }}>
                    {selected.role} • {selected.degree}
                  </div>
                  <div className="sectionSubtitle" style={{ marginTop: "0.4rem" }}>
                    AG No: <b style={{ color: "var(--text-main)" }}>{selected.agNo}</b>
                  </div>
                </div>
              </div>

              <div className="hr" />

              {/* Summary */}
              {selected.summary && (
                <motion.div
                  className="sectionSubtitle"
                  style={{ lineHeight: 1.8, textAlign: "left" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {selected.summary}
                </motion.div>
              )}

              {/* Detail Grid */}
              <motion.div
                className="detailGrid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="detailItem">
                  <div className="detailLabel">📧 Email</div>
                  <div className="detailValue">{selected.email || "—"}</div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">📱 Phone</div>
                  <div className="detailValue">{selected.phone || "—"}</div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">💡 Interests</div>
                  <div className="detailValue">
                    {(selected.interests || []).join(", ") || "—"}
                  </div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">🔗 Social</div>
                  <div className="detailValue" style={{ display: "flex", gap: "0.5rem" }}>
                    {socials.map((s) =>
                      selected.socials?.[s.key] ? (
                        <a
                          key={s.key}
                          href={selected.socials[s.key]}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: s.color,
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {s.label}
                        </a>
                      ) : null
                    )}
                    {!socials.some(s => selected.socials?.[s.key]) && "—"}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </section>
  );
}

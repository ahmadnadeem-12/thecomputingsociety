import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238c7f9c'><path fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd' /></svg>";
import { Modal } from "../components/ui/Modal";
import { Skeleton, SkeletonCircle, SkeletonTitle, SkeletonText } from "../components/ui/Skeleton";
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

const getRoleBadgeClass = (role) => {
  const r = (role || "").toLowerCase();
  if (r.includes("president") && !r.includes("vice")) return "roleBadge president";
  if (r.includes("vice president") || r.includes("vp")) return "roleBadge vp";
  return "roleBadge exec";
};

export default function Cabinet() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    listCabinet()
      .then(data => {
        setMembers(data || []);
        setLoading(false);
      })
      .catch(() => {
        setMembers([]);
        setLoading(false);
      });
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
            <div className="sectionTitle">Cabinet 2025-26</div>
            <div className="sectionSubtitle">
              Meet our leadership team • Click on any card for full profile
            </div>
          </div>
          <div className="pill pillRed">TCS Leadership</div>
        </div>
      </motion.div>

      {loading ? (
        <div className="cabinetGrid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="profileCard" style={{ cursor: "default" }}>
              <div className="dpWrap">
                <SkeletonCircle size="100%" />
              </div>
              <SkeletonTitle style={{ height: "1rem", width: "70%", margin: "1rem auto 0.5rem" }} />
              <Skeleton style={{ height: "0.8rem", width: "50%", margin: "0 auto 1rem" }} />
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <SkeletonCircle size="30px" />
                <SkeletonCircle size="30px" />
                <SkeletonCircle size="30px" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="cabinetGrid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {members.map((m, index) => (
            <motion.div
              key={m._id || m.id}
              className="profileCard"
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpen(m)}
              style={{ cursor: "pointer" }}
            >
              {/* Hover Glow Overlay */}
              <div className="glowOverlay" />

              {/* Profile Photo */}
              <div className="dpWrap">
                <div className="dpInner">
                  <img 
                    src={m.avatar || DEFAULT_AVATAR} 
                    alt={m.name} 
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  />
                </div>
              </div>

              {/* Name & Role */}
              <div className="cardName">{m.name}</div>
              <div style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                <span className={getRoleBadgeClass(m.role)}>
                  {m.role}
                </span>
              </div>

              {/* Degree Badge */}
              {m.degree && (
                <div className="pill" style={{ marginTop: "0.5rem", fontSize: "0.7rem" }}>
                  {m.degree}
                </div>
              )}

              {/* Social Icons */}
              <div className="socialRow" onClick={(e) => e.stopPropagation()}>
                {socials.map((s) =>
                  m.socials?.[s.key] ? (
                    <motion.a
                      key={s.key}
                      className="socialIcon"
                      href={m.socials[s.key]}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: s.color,
                        borderColor: s.color,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${s.color}44`,
                      }}
                      whileHover={{
                        scale: 1.15,
                        boxShadow: `0 6px 18px ${s.color}77`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span style={{ fontWeight: 900 }}>{s.label}</span>
                    </motion.a>
                  ) : (
                    <span
                      key={s.key}
                      className="socialIcon"
                      style={{ opacity: 0.35, cursor: "default" }}
                    >
                      <span style={{ fontWeight: 900 }}>{s.label}</span>
                    </span>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
                  style={{ width: 100, height: 100, background: "var(--gradient-border)" }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="dpInner">
                    <img 
                      src={selected.avatar || DEFAULT_AVATAR} 
                      alt={selected.name} 
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                  </div>
                </motion.div>
                <div style={{ textAlign: "left" }}>
                  <div className="cardName" style={{ textAlign: "left", fontSize: "1.3rem" }}>
                    {selected.name}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.35rem", flexWrap: "wrap" }}>
                    <span className={getRoleBadgeClass(selected.role)}>
                      {selected.role}
                    </span>
                    {selected.degree && (
                      <span className="pill" style={{ fontSize: "0.7rem", padding: "0.25rem 0.65rem", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        {selected.degree}
                      </span>
                    )}
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

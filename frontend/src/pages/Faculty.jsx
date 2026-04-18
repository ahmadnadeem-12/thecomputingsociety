
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../components/ui/Modal";
import { Skeleton, SkeletonCircle, SkeletonTitle, SkeletonText, SkeletonPill } from "../components/ui/Skeleton";
import { listFaculty } from "../services/facultyService";
import "../assets/styles/pages/faculty.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

function getRoleBadge(role) {
  const r = (role || "").toLowerCase();
  if (r.includes("chairman")) return "chairman";
  if (r.includes("professor")) return "professor";
  if (r.includes("supervisor")) return "supervisor";
  return "lecturer";
}

export default function Faculty() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    listFaculty()
      .then(data => {
        setItems(data || []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  // Sort: Chairman first
  const sortedItems = [...items].sort((a, b) => {
    const aChair = (a.departmentRole || "").toLowerCase().includes("chairman");
    const bChair = (b.departmentRole || "").toLowerCase().includes("chairman");
    if (aChair && !bChair) return -1;
    if (!aChair && bChair) return 1;
    return 0;
  });

  return (
    <section className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sectionHeader">
          <div>
            <div className="sectionTitle">Faculty</div>
            <div className="sectionSubtitle">
              Our distinguished academic mentors • Click for full profiles
            </div>
          </div>
          <div className="pill pillRed">Department of CS</div>
        </div>
      </motion.div>

      {loading ? (
        <div className="facultyGrid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="facultyCard" style={{ cursor: "default" }}>
              <div className="facultyHeader">
                <div className="facultyPhoto">
                  <div className="dpWrap">
                    <SkeletonCircle size="100%" />
                  </div>
                  <Skeleton style={{ height: "18px", width: "80px", position: "absolute", bottom: "-5px", left: "50%", transform: "translateX(-50%)", borderRadius: "10px" }} />
                </div>
                <div className="facultyInfo" style={{ width: "100%" }}>
                  <SkeletonTitle style={{ height: "1rem", width: "80%", marginBottom: "0.5rem" }} />
                  <Skeleton style={{ height: "0.8rem", width: "60%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                <SkeletonPill />
                <SkeletonPill />
              </div>
              <div className="facultyStats" style={{ marginTop: "1rem" }}>
                <div className="facultyStat"><Skeleton style={{ height: "1.5rem", width: "2rem" }} /></div>
                <div className="facultyStat"><Skeleton style={{ height: "1.5rem", width: "2rem" }} /></div>
                <div className="facultyStat"><Skeleton style={{ height: "1.5rem", width: "2rem" }} /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="facultyGrid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedItems.map((f, index) => {
            const roleType = getRoleBadge(f.departmentRole);
            const isChairman = roleType === "chairman";

            return (
              <motion.div
                key={f._id || f.id}
                className={`facultyCard ${isChairman ? "chairman" : ""}`}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -8 }}
                onClick={() => { setSelected(f); setOpen(true); }}
                style={{ cursor: "pointer" }}
              >
                <div className="facultyHeader">
                  <div className="facultyPhoto">
                    <motion.div
                      className="dpWrap"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="dpInner">
                        <img src={f.avatar} alt={f.name} />
                      </div>
                    </motion.div>
                    <div className={`facultyRoleBadge ${roleType}`}>
                      {f.departmentRole}
                    </div>
                  </div>

                  <div className="facultyInfo">
                    <div className="facultyName">{f.name}</div>
                    {f.education && (
                      <div className="facultyEducation">{f.education}</div>
                    )}
                  </div>
                </div>

                {/* Expertise Tags */}
                {(f.expertise || []).length > 0 && (
                  <div className="expertiseTags">
                    {(f.expertise || []).slice(0, 3).map((exp) => (
                      <span key={exp} className="expertiseTag">{exp}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="facultyStats">
                  <div className="facultyStat">
                    <div className="facultyStatNumber">{f.experienceYears || 0}+</div>
                    <div className="facultyStatLabel">Years Exp.</div>
                  </div>
                  <div className="facultyStat">
                    <div className="facultyStatNumber">{(f.courses || []).length}</div>
                    <div className="facultyStatLabel">Courses</div>
                  </div>
                  <div className="facultyStat">
                    <div className="facultyStatNumber">{(f.expertise || []).length}</div>
                    <div className="facultyStatLabel">Specializations</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Detail Modal */}
      <Modal
        open={open}
        title="Faculty Member"
        onClose={() => setOpen(false)}
        maxWidth="740px"
      >
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center" }}
            >
              {/* Centered Profile Image */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                style={{
                  width: 120,
                  height: 120,
                  margin: "0 auto 1.25rem",
                  borderRadius: "50%",
                  padding: "4px",
                  background: "var(--gradient-main)",
                }}
              >
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--bg-darker)",
                }}>
                  <img
                    src={selected.avatar}
                    alt={selected.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                  />
                </div>
              </motion.div>

              {/* Name & Role - Centered */}
              <div className="cardName" style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
                {selected.name}
              </div>
              <div className={`facultyRoleBadge ${getRoleBadge(selected.departmentRole)}`} style={{
                position: "relative",
                display: "inline-block",
                marginBottom: "0.5rem"
              }}>
                {selected.departmentRole}
              </div>
              <div className="sectionSubtitle" style={{ marginBottom: "1rem" }}>
                {selected.education} • <b style={{ color: "var(--text-main)" }}>{selected.experienceYears}+ years</b> experience
              </div>

              <div className="hr" />

              {selected.summary && (
                <motion.div
                  className="sectionSubtitle"
                  style={{ lineHeight: 1.8, textAlign: "left", marginTop: "1rem" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {selected.summary}
                </motion.div>
              )}

              <motion.div
                className="detailGrid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="detailItem">
                  <div className="detailLabel">📚 Courses</div>
                  <div className="detailValue">
                    {(selected.courses || []).join(", ") || "—"}
                  </div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">🎯 Expertise</div>
                  <div className="detailValue">
                    {(selected.expertise || []).join(", ") || "—"}
                  </div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">🎓 Universities</div>
                  <div className="detailValue">
                    {(selected.universities || []).join(", ") || "—"}
                  </div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">📧 Contact</div>
                  <div className="detailValue">
                    {selected.email || "—"}
                    {selected.phone && ` • ${selected.phone}`}
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              {(selected.socials?.linkedin || selected.socials?.website) && (
                <motion.div
                  style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {selected.socials?.linkedin && (
                    <a
                      href={selected.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="socialIcon"
                    >
                      in
                    </a>
                  )}
                  {selected.socials?.website && (
                    <a
                      href={selected.socials.website}
                      target="_blank"
                      rel="noreferrer"
                      className="socialIcon"
                    >
                      🌐
                    </a>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </section>
  );
}

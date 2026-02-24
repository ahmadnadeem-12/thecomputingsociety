
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listGalleryAlbums } from "../services/galleryService";
import "../assets/styles/pages/gallery.css";

function CircleSlider({ images }) {
  return (
    <div className="circleWrap">
      <div className="circleBg" />
      {images.slice(0, 10).map((src, idx) => (
        <motion.div
          key={src + idx}
          className="circleThumb"
          style={{
            transform: `translate(-50%, -50%) rotate(${idx * (360 / 10)}deg) translate(62px) rotate(-${idx * (360 / 10)}deg)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05, type: "spring" }}
        >
          <img src={src} alt="thumb" />
        </motion.div>
      ))}
      <motion.div
        className="circleRing"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

function AlbumModal({ open, onClose, album }) {
  if (!open || !album) return null;

  return (
    <motion.div
      className="galModalOverlay lightbox"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="galModal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="galModalHeader">
          <div>
            <div className="galModalTitle">{album.title}</div>
            <div className="galModalMeta">{album.images.length} photos</div>
          </div>
          <motion.button
            className="btn btnGhost"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✕ Close
          </motion.button>
        </div>

        <motion.div
          className="galGrid galleryGrid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {album.images.map((src, idx) => (
            <motion.div
              key={src + idx}
              className="galImgCard galleryItem"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
            >
              <img src={src} alt="img" />
              <div className="galleryOverlay" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery() {
  const [catalogues, setCatalogues] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    listGalleryAlbums().then(data => setCatalogues(data || [])).catch(() => setCatalogues([]));
  }, []);

  useEffect(() => {
    if (!activeId && catalogues.length > 0) {
      setActiveId(catalogues[0]._id || catalogues[0].id);
    }
  }, [catalogues, activeId]);

  const active = useMemo(
    () => catalogues.find((c) => (c._id || c.id) === activeId) || catalogues[0],
    [activeId, catalogues]
  );

  if (catalogues.length === 0) {
    return (
      <section className="section">
        <div className="sectionTitle">Gallery</div>
        <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
          No albums yet. Admin can add albums from the dashboard.
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sectionHeader">
          <div>
            <div className="sectionTitle">Gallery</div>
            <div className="sectionSubtitle">
              Explore moments from our events • {catalogues.length} albums
            </div>
          </div>
          <div className="pill pillRed">📸 Albums</div>
        </div>
      </motion.div>

      {/* Album Tabs */}
      <motion.div
        className="galTabs galleryCategories"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: "1.5rem" }}
      >
        {catalogues.map((c) => (
          <motion.button
            key={c.id}
            className={`galTab categoryPill ${activeId === c.id ? "active" : ""}`}
            onClick={() => { setActiveId(c.id); setCurrentIndex(0); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {c.title}
          </motion.button>
        ))}
      </motion.div>

      {/* Hero Image Section */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={activeId}
            className="galAlbum"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="galHero"
              style={{
                position: "relative",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                minHeight: "400px",
                maxHeight: "80vh",
                cursor: "pointer",
                background: "linear-gradient(145deg, rgba(25,15,40,0.9), rgba(12,8,20,0.95))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => setOpen(true)}
              whileHover={{ scale: 1.01 }}
            >
              {active.images.length > 0 ? (
                <motion.img
                  key={active.images[currentIndex]}
                  src={active.images[currentIndex]}
                  alt="hero"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                  No images in this album
                </div>
              )}

              {/* Gradient Overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)",
              }} />

              {/* Navigation */}
              {active.images.length > 1 && (
                <>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i - 1 + active.images.length) % active.images.length); }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(220,39,67,0.8)" }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                      width: 50, height: 50, borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff", fontSize: "1.5rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(10px)",
                    }}
                  >‹</motion.button>

                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i + 1) % active.images.length); }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(220,39,67,0.8)" }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                      width: 50, height: 50, borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff", fontSize: "1.5rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(10px)",
                    }}
                  >›</motion.button>
                </>
              )}

              {/* Hero Text */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem",
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
              }}>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.35rem" }}>
                    {active.title}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                    {active.images.length} photos • Tap to explore album
                  </div>
                </div>

                {active.images.length > 0 && (
                  <div style={{
                    padding: "0.5rem 1rem", borderRadius: "var(--radius-full)",
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.85rem", fontWeight: 600, color: "#fff",
                  }}>
                    {currentIndex + 1} / {active.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Preview */}
              {active.images.length > 0 && (
                <div style={{
                  position: "absolute", bottom: "1rem", right: "1rem",
                  transform: "scale(0.6)", transformOrigin: "bottom right",
                }}>
                  <CircleSlider images={active.images} />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Album Modal */}
      <AnimatePresence>
        {open && <AlbumModal open={open} album={active} onClose={() => setOpen(false)} />}
      </AnimatePresence>

      <motion.div
        className="sectionSubtitle"
        style={{ marginTop: "1.5rem", textAlign: "center" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
      >
        💡 Albums are managed from the Admin Dashboard
      </motion.div>
    </section>
  );
}

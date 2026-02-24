
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listGalleryAlbums } from "../services/galleryService";
import "../assets/styles/pages/gallery.css";

/* ---- Collage Layout for Album Card ---- */
function AlbumCollage({ images }) {
  const imgs = images.slice(0, 5);
  const count = Math.min(imgs.length, 5);
  const layoutClass = `layout-${count}`;

  return (
    <div className={`albumCollage ${layoutClass}`}>
      {imgs.map((src, i) => (
        <img key={src + i} className="collageImg" src={src} alt="" loading="lazy" />
      ))}
    </div>
  );
}

/* ---- Full Image Lightbox ---- */
function ImageLightbox({ images, index, onClose, onPrev, onNext }) {
  // keyboard nav
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="fullImageOverlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        key={images[index]}
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />

      {images.length > 1 && (
        <>
          <button
            className="fullImageNav prev"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
          >‹</button>
          <button
            className="fullImageNav next"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
          >›</button>
        </>
      )}

      <button className="fullImageClose" onClick={onClose}>✕</button>

      <div className="fullImageCounter">
        {index + 1} / {images.length}
      </div>
    </motion.div>
  );
}

/* ---- Album Detail Modal ---- */
function AlbumModal({ open, onClose, album }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!open || !album) return null;

  return (
    <>
      <motion.div
        className="galModalOverlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="galModal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 30 }}
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

          <div className="masonryGrid">
            {album.images.map((src, idx) => (
              <motion.div
                key={src + idx}
                className="masonryItem"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setLightboxIdx(idx)}
              >
                <img src={src} alt="" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Full screen image viewer */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <ImageLightbox
            images={album.images}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx((i) => (i - 1 + album.images.length) % album.images.length)}
            onNext={() => setLightboxIdx((i) => (i + 1) % album.images.length)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---- Main Gallery Page ---- */
export default function Gallery() {
  const [catalogues, setCatalogues] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    listGalleryAlbums().then(data => setCatalogues(data || [])).catch(() => setCatalogues([]));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return catalogues;
    return catalogues.filter(c => (c._id || c.id) === filter);
  }, [catalogues, filter]);

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
      {/* Header */}
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

      {/* Filter Tabs */}
      {catalogues.length > 1 && (
        <motion.div
          className="galleryCategories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className={`categoryPill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Albums
          </button>
          {catalogues.map((c) => (
            <button
              key={c._id || c.id}
              className={`categoryPill ${filter === (c._id || c.id) ? "active" : ""}`}
              onClick={() => setFilter(c._id || c.id)}
            >
              {c.title}
            </button>
          ))}
        </motion.div>
      )}

      {/* Album Cards Grid */}
      <motion.div
        className="albumCardsGrid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {filtered.map((album) => (
          <motion.div
            key={album._id || album.id}
            className="albumCard"
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedAlbum(album)}
          >
            {/* Collage Thumbnail */}
            {album.images.length > 0 ? (
              <AlbumCollage images={album.images} />
            ) : (
              <div style={{
                height: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem"
              }}>
                No photos yet
              </div>
            )}

            {/* Info Bar */}
            <div className="albumInfoBar">
              <div>
                <div className="albumInfoTitle">{album.title}</div>
                <div className="albumInfoCount">{album.images.length} photos</div>
              </div>
              <div className="albumViewBtn">View →</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Album Detail Modal */}
      <AnimatePresence>
        {selectedAlbum && (
          <AlbumModal
            open={!!selectedAlbum}
            album={selectedAlbum}
            onClose={() => setSelectedAlbum(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

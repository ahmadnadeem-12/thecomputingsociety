import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";

export default function EventSpotlight() {
  const [featuredList, setFeaturedList] = useState([]);
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const nav = useNavigate();

  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/events/spotlight");
        const list = res.data.data;
        if (list.length > 0) {
          setFeaturedList(list);
          // Show after 2 seconds delay
          setTimeout(() => setIsVisible(true), 2000);
        }
      } catch (err) {
        console.error("Spotlight Fetch Error:", err);
      }
    };
    fetchFeatured();
  }, []);

  // Auto-slide logic with auto-minimize after one cycle
  useEffect(() => {
    if (featuredList.length > 0 && isVisible && !isMinimized && !hasCompletedCycle) {
      const timer = setInterval(() => {
        setIndex(prev => {
          const next = prev + 1;
          // If we reached the end of the list
          if (next >= featuredList.length) {
            setIsMinimized(true);
            setHasCompletedCycle(true);
            return 0; // Reset for next time if they reopen
          }
          return next;
        });
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [featuredList, isVisible, isMinimized, hasCompletedCycle]);

  if (featuredList.length === 0) return null;
  const currentEvent = featuredList[index];

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex(prev => (prev + 1) % featuredList.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex(prev => (prev - 1 + featuredList.length) % featuredList.length);
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={isMinimized ? "minimized" : "maximized"}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="spotlight-container"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
          }}
        >
          {isMinimized ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMinimized(false)}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))",
                border: "none",
                color: "#fff",
                fontSize: "1.5rem",
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(220, 39, 67, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              🚀
              {featuredList.length > 1 && (
                <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ff4d6d", color: "#fff", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "10px", fontWeight: 900 }}>
                  {featuredList.length}
                </span>
              )}
            </motion.button>
          ) : (
            <div 
              style={{
                background: "rgba(12, 8, 24, 0.75)",
                backdropFilter: "blur(40px)",
                // Ultra thin gradient border look
                padding: "1px",
                backgroundImage: "linear-gradient(135deg, rgba(220, 39, 67, 0.4), rgba(34, 211, 238, 0.4))",
                borderRadius: "28px",
                boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 20px rgba(220, 39, 67, 0.1)",
                width: "320px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Internal Content Wrapper to respect border padding */}
              <div style={{ background: "rgba(12, 8, 24, 0.9)", borderRadius: "27px", overflow: "hidden" }}>
                
                {/* Controls */}
                <div style={{ position: "absolute", top: "15px", right: "15px", zIndex: 100, display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => setIsMinimized(true)}
                    style={{ 
                      background: "rgba(0,0,0,0.6)", 
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)", 
                      color: "#fff", 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      cursor: "pointer", 
                      fontSize: "16px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      transition: "all 0.3s",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
                    }}
                    onMouseOver={e => e.target.style.background = "var(--accent-pink)"}
                    onMouseOut={e => e.target.style.background = "rgba(0,0,0,0.6)"}
                    title="Minimize"
                  >
                    —
                  </button>
                  <button 
                    onClick={() => setIsVisible(false)}
                    style={{ 
                      background: "var(--accent-red)", 
                      border: "1px solid rgba(255,255,255,0.2)", 
                      color: "#fff", 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      cursor: "pointer", 
                      fontSize: "14px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      transition: "all 0.3s",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
                    }}
                    onMouseOver={e => e.target.style.transform = "scale(1.1)"}
                    onMouseOut={e => e.target.style.transform = "scale(1)"}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Carousel Arrows */}
                {featuredList.length > 1 && (
                  <>
                    <button onClick={handlePrev} style={{ position: "absolute", left: "12px", top: "45%", zIndex: 10, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(5px)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                    <button onClick={handleNext} style={{ position: "absolute", right: "12px", top: "45%", zIndex: 10, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(5px)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                  </>
                )}

                {/* Poster Image - Strict Contain Mode */}
                <div 
                  style={{ 
                    width: "100%", 
                    height: "380px", 
                    background: "rgba(0,0,0,0.6)",
                    overflow: "hidden", 
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onClick={() => setShowPreview(true)}
                  title="Click to zoom"
                >
                  {/* Background Blur Fill */}
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${currentEvent.adPoster})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px) saturate(1.8)", opacity: 0.6 }} />
                  
                  <img 
                    key={currentEvent._id}
                    src={currentEvent.adPoster} 
                    alt={currentEvent.title} 
                    style={{ 
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", 
                      display: "block",
                      position: "relative", 
                      zIndex: 1,
                      imageRendering: "auto",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.8)" 
                    }}
                  />
                  
                  {/* Subtle edge highlight */}
                  <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,0.05)", zIndex: 2, pointerEvents: "none" }} />
                </div>

                {/* Text Info */}
                <div style={{ padding: "1.4rem 1.5rem 1.8rem", textAlign: "center", position: "relative", background: "rgba(12, 8, 24, 0.98)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "8px" }}>
                    🔥 Featured Event {featuredList.length > 1 && `${index + 1}/${featuredList.length}`}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 950, color: "#fff", marginBottom: "1.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.5px" }}>
                    {currentEvent.title.toUpperCase()}
                  </h3>
                  
                  <button 
                    className="btn" 
                    style={{ 
                      width: "100%", 
                      borderRadius: "50px", 
                      padding: "0.9rem", 
                      fontSize: "0.85rem",
                      fontWeight: 950,
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      background: "linear-gradient(135deg, var(--accent-pink), #8b5cf6)",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(194, 52, 165, 0.3)",
                      cursor: "pointer"
                    }}
                    onClick={() => nav(`/tickets?eventId=${currentEvent._id}`)}
                  >
                    🚀 Instant Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              background: "rgba(5, 5, 10, 0.95)",
              backdropFilter: "blur(15px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              cursor: "zoom-out"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                maxWidth: "95vw",
                maxHeight: "90vh",
                position: "relative",
                boxShadow: "0 50px 100px rgba(0,0,0,0.9)",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
              onClick={(e) => e.stopPropagation()} 
            >
              <img 
                src={currentEvent.adPoster} 
                alt="Event Poster Full View" 
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto"
                }}
              />
              <button 
                onClick={() => setShowPreview(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 100
                }}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MajesticModal - A premium, glassy modal for alerts and confirmations.
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {string} title - Modal title.
 * @param {string|React.ReactNode} message - Modal message.
 * @param {string} type - 'info', 'success', 'warning', 'error'.
 * @param {boolean} isConfirm - Whether to show Cancel button.
 * @param {string} confirmText - Label for confirm button.
 * @param {string} cancelText - Label for cancel button.
 * @param {function} onConfirm - Callback for confirm button.
 * @param {function} onClose - Callback for closing the modal (cancel or close).
 */
export default function MajesticModal({ 
  isOpen, 
  title, 
  message, 
  type = "info", 
  isConfirm = false, 
  confirmText = "OK", 
  cancelText = "CANCEL", 
  onConfirm, 
  onClose,
  children
}) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const colors = {
    info: "var(--accent-cyan)",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#ff4d4d"
  };

  const accent = colors[type] || colors.info;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          zIndex: 10000, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "20px"
        }}>
          {/* OVERLAY */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%", 
              background: "rgba(0, 0, 0, 0.75)", 
              backdropFilter: "blur(12px)" 
            }} 
          />

          {/* MODAL BOX */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ 
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              background: "rgba(15, 23, 42, 0.8)",
              border: `1px solid ${accent}`,
              borderRadius: "32px",
              padding: "3rem",
              boxShadow: `0 0 50px ${accent}22`,
              textAlign: "center",
              overflow: "hidden"
            }}
          >
            {/* ACCENT GLOW */}
            <div style={{ 
              position: "absolute", 
              top: "-50px", 
              left: "50%", 
              transform: "translateX(-50%)", 
              width: "200px", 
              height: "100px", 
              background: accent, 
              filter: "blur(80px)", 
              opacity: 0.15 
            }} />

            {/* ICON */}
            <div style={{ 
              fontSize: "4rem", 
              marginBottom: "1.5rem",
              filter: `drop-shadow(0 0 15px ${accent}44)`
            }}>
              {type === "success" ? "✅" : type === "warning" ? "⚠" : type === "error" ? "🛑" : "💡"}
            </div>

            <h2 style={{ 
              fontSize: "2rem", 
              color: "#fff", 
              fontWeight: 900, 
              marginBottom: "1rem",
              letterSpacing: "0.5px"
            }}>
              {title.toUpperCase()}
            </h2>

            <div style={{ 
              fontSize: "1.1rem", 
              color: "rgba(255, 255, 255, 0.7)", 
              lineHeight: 1.6, 
              marginBottom: children ? "1.5rem" : "2.5rem",
              fontWeight: 500
            }}>
              {message}
            </div>

            {children && (
              <div style={{ marginBottom: "2.5rem" }}>
                {children}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              {isConfirm && (
                <button 
                  onClick={onClose}
                  style={{ 
                    padding: "0.8rem 2rem", 
                    borderRadius: "15px", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    background: "rgba(255,255,255,0.05)", 
                    color: "#fff", 
                    fontWeight: 800, 
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.3s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  {cancelText}
                </button>
              )}
              <button 
                onClick={onConfirm || onClose}
                style={{ 
                  padding: "0.8rem 2.5rem", 
                  borderRadius: "15px", 
                  border: "none", 
                  background: accent, 
                  color: "#fff", 
                  fontWeight: 900, 
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: `0 0 20px ${accent}44`,
                  transition: "all 0.3s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

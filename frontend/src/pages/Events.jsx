
import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EventContext } from "../context/EventContext";
import { formatDate } from "../utils/helpers";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import "../assets/styles/pages/events.css";

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
  },
  exit: { opacity: 0, y: -20, scale: 0.95 }
};

export default function Events() {
  const eventsCtx = useContext(EventContext);
  const [filter, setFilter] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const events = useMemo(() => eventsCtx.events || [], [eventsCtx.events, eventsCtx.version]);

  const filtered = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);

    const isPast = (dateStr) => {
      const d = new Date(dateStr).setHours(0, 0, 0, 0);
      return d < today;
    };

    if (filter === "featured") return events.filter(e => e.featured);
    if (filter === "past") return events.filter(e => isPast(e.date));

    // For "upcoming" (default), show anything NOT past
    return events.filter(e => !isPast(e.date));
  }, [events, filter]);

  const filters = [
    { key: "upcoming", label: "Upcoming", icon: "📅" },
    { key: "featured", label: "Featured", icon: "⭐" },
    { key: "past", label: "Past", icon: "📜" },
  ];

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
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
            <div className="sectionTitle">Events & Activities</div>
            <div className="sectionSubtitle">
              Discover workshops, hackathons, and networking events
            </div>
          </div>
          <div className="pill pillRed">Smart Event Module</div>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        className="filterPills"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filters.map((f) => (
          <motion.button
            key={f.key}
            className={`filterPill ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span style={{ marginRight: "0.35rem" }}>{f.icon}</span>
            {f.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Events Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          className="eventsGrid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
        >
          {filtered.map((e, index) => (
            <motion.div
              key={e.id}
              className="eventCard"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Status Badge */}
              <div className={`eventStatus ${new Date(e.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'past' : e.status}`}>
                {new Date(e.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? "Past" :
                  e.status === "open" ? "Open" : e.status === "closed" ? "Closed" : "Upcoming"}
              </div>

              <div className="eventInner">
                <div style={{ fontWeight: 900, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                  {e.title}
                </div>

                <div className="eventMeta">
                  <span>📅 {formatDate(e.date)}</span>
                  <span className="separator" />
                  <span>🕐 {e.time}</span>
                  <span className="separator" />
                  <span>📍 {e.venue}</span>
                </div>

                {/* Description Preview */}
                {e.description && (
                  <div style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginTop: "0.75rem",
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {e.description}
                  </div>
                )}

                {/* Tags */}
                <div className="eventTags">
                  {(e.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="eventTag">{t}</span>
                  ))}
                  {e.featured && <span className="eventTag featured">⭐ Featured</span>}
                </div>

                {/* Capacity Bar */}
                {e.capacity && e.seatsRemaining !== undefined && (
                  <div className="capacityBar">
                    <div className="capacityLabel">
                      <span>Capacity</span>
                      <span>{e.capacity - e.seatsRemaining}/{e.capacity} registered</span>
                    </div>
                    <div className="capacityTrack">
                      <motion.div
                        className="capacityFill"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((e.capacity - e.seatsRemaining) / e.capacity) * 100}%`
                        }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="eventActions">
                  <motion.button
                    className="btn btnGhost"
                    onClick={() => openEventDetails(e)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    View Details
                  </motion.button>
                  {e.status === "open" && (
                    <Link to="/tickets">
                      <Button>Get Ticket</Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="emptyState"
          style={{ textAlign: "center", padding: "3rem 1rem" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.4 }}>
            {filter === "featured" ? "⭐" : filter === "past" ? "📜" : "📅"}
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
            No {filter} events
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            Check back later for updates
          </div>
        </motion.div>
      )}

      {/* Event Detail Modal */}
      <Modal
        open={modalOpen}
        title="Event Details"
        onClose={() => setModalOpen(false)}
        maxWidth="600px"
      >
        {selectedEvent && (
          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Title & Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>
                {selectedEvent.title}
              </div>
              <span className={`eventStatus ${new Date(selectedEvent.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'past' : selectedEvent.status}`} style={{ position: "relative", top: 0, right: 0 }}>
                {new Date(selectedEvent.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? "Past" :
                  selectedEvent.status === "open" ? "Open" : selectedEvent.status === "closed" ? "Closed" : "Upcoming"}
              </span>
            </div>

            {/* Meta Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: ".75rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: ".75rem", color: "var(--accent-pink)", marginBottom: ".25rem" }}>📅 DATE</div>
                <div style={{ fontWeight: 600 }}>{formatDate(selectedEvent.date)}</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: ".75rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: ".75rem", color: "var(--accent-cyan)", marginBottom: ".25rem" }}>🕐 TIME</div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.time}</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: ".75rem 1rem", borderRadius: "10px", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: ".75rem", color: "var(--accent-gold)", marginBottom: ".25rem" }}>📍 VENUE</div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.venue}</div>
              </div>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div>
                <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: ".5rem" }}>DESCRIPTION</div>
                <div style={{ lineHeight: 1.7, color: "var(--text-secondary)" }}>
                  {selectedEvent.description}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedEvent.tags?.length > 0 && (
              <div className="eventTags">
                {selectedEvent.tags.map((t) => (
                  <span key={t} className="eventTag">{t}</span>
                ))}
                {selectedEvent.featured && <span className="eventTag featured">⭐ Featured</span>}
              </div>
            )}

            {/* Capacity */}
            {selectedEvent.capacity && (
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                  <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>CAPACITY</span>
                  <span style={{ fontWeight: 600 }}>
                    {selectedEvent.capacity - (selectedEvent.seatsRemaining || 0)}/{selectedEvent.capacity} registered
                  </span>
                </div>
                <div className="capacityTrack">
                  <div className="capacityFill" style={{
                    width: `${((selectedEvent.capacity - (selectedEvent.seatsRemaining || 0)) / selectedEvent.capacity) * 100}%`
                  }} />
                </div>
                <div style={{ marginTop: ".5rem", fontSize: ".85rem", color: "var(--accent-cyan)" }}>
                  {selectedEvent.seatsRemaining || 0} seats remaining
                </div>
              </div>
            )}

            {/* Action Button */}
            {selectedEvent.status === "open" && (
              <Link to="/tickets" style={{ display: "block" }}>
                <Button style={{ width: "100%" }}>🎟️ Get Ticket for this Event</Button>
              </Link>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}


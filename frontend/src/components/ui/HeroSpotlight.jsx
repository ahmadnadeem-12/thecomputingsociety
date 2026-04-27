import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";

export default function HeroSpotlight() {
    const [event, setEvent] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const fetchHeroEvent = async () => {
            try {
                const res = await api.get("/events");
                // Get events marked as isHero and status not 'past'
                const heroEvents = res.data.data.filter(e => e.isHero && e.status !== "past");
                
                if (heroEvents.length > 0) {
                    // Sort by nearest date
                    heroEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                    setEvent(heroEvents[0]);
                }
            } catch (err) {
                console.error("Hero Spotlight Error:", err);
            }
        };
        fetchHeroEvent();
    }, []);

    useEffect(() => {
        if (!event) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(`${event.date}T${event.time || "00:00"}`).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((diff % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [event]);

    if (!event) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                borderRadius: "32px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "2rem",
                width: "100%",
                maxWidth: "420px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                position: "relative",
                overflow: "hidden",
                marginTop: "-20px" // Shifting it slightly up as requested
            }}
        >
            {/* Background Glow */}
            <div style={{ position: "absolute", top: "-20%", right: "-20%", width: "200px", height: "200px", background: "var(--accent-pink)", filter: "blur(80px)", opacity: 0.15, borderRadius: "50%" }} />

            <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>🔥</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "var(--accent-gold)", letterSpacing: "2px", textTransform: "uppercase" }}>Happening Soon</span>
                </div>
                
                <h2 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#fff", marginBottom: "1rem", lineHeight: 1.2 }}>
                    {event.title.toUpperCase()}
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem", marginBottom: "1.5rem" }}>
                   {[
                       { label: "DAYS", val: timeLeft.days },
                       { label: "HRS", val: timeLeft.hours },
                       { label: "MINS", val: timeLeft.mins },
                       { label: "SECS", val: timeLeft.secs }
                   ].map((t, i) => (
                       <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", padding: "0.8rem 0.4rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                           <div style={{ fontSize: "1.4rem", fontWeight: 950, color: i % 2 === 0 ? "var(--accent-cyan)" : "var(--accent-pink)" }}>{t.val.toString().padStart(2, "0")}</div>
                           <div style={{ fontSize: "0.6rem", fontWeight: 900, opacity: 0.6, marginTop: "2px" }}>{t.label}</div>
                       </div>
                   ))}
                </div>

                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>📍 {event.venue || "Society Hall"}</span>
                    <span style={{ opacity: 0.3 }}>|</span>
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                </div>

                <motion.div
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ position: "relative", zIndex: 5 }}
                >
                    <Link 
                        to={`/tickets?eventId=${event._id}`}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "1rem",
                            textAlign: "center",
                            background: "linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))",
                            borderRadius: "20px",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 950,
                            fontSize: "0.95rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            boxShadow: "0 10px 30px rgba(0, 217, 255, 0.3)",
                            transition: "all 0.3s ease",
                            border: "1px solid rgba(255, 255, 255, 0.2)"
                        }}
                        className="spotlightBtn"
                    >
                        Reserve Your Spot 🚀
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}


import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { QRCodeCanvas } from "qrcode.react";
import { downloadTicketPDF, downloadAllTicketsPDF, downloadCertificatePDF } from "../services/pdfService";

export default function Tickets() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetEventId = queryParams.get("eventId");

  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [form, setForm] = useState({ selectionType: "event", selectionId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const lastResend = localStorage.getItem("verification_resend_cooldown");
    if (lastResend) {
      const remaining = Math.ceil((parseInt(lastResend) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResendMail = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    setResendMessage("");
    try {
      await api.post(`/auth/users/${user._id || user.id}/resend-verify`);
      setResendMessage("✉️ Verification email resent successfully!");
      const targetTime = Date.now() + 120 * 1000;
      localStorage.setItem("verification_resend_cooldown", targetTime);
      setCooldown(120);
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Failed to resend email.");
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchData();
      fetchMyTickets();
    }
  }, [isAuthed, targetEventId]); // Re-fetch or re-selection if target changes

  // Auto-dismiss success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3500); // 3.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const fetchData = async () => {
    try {
      const [evRes, prRes] = await Promise.all([
        api.get("/events"),
        api.get("/programs")
      ]);
      const evData = evRes.data.data || [];
      const prData = prRes.data.data || [];
      setEvents(evData);
      setPrograms(prData);

      // Select logic
      if (targetEventId) {
        setForm({ selectionType: "event", selectionId: targetEventId });
      } else if (evData.length > 0) {
        setForm(f => ({ ...f, selectionType: "event", selectionId: evData[0]._id }));
      } else if (prData.length > 0) {
        setForm(f => ({ ...f, selectionType: "program", selectionId: prData[0]._id }));
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    }
  };

  const fetchMyTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setMyTickets(res.data.data || []);
    } catch (err) {
      console.error("Fetch Tickets Error:", err);
    }
  };

  const onGenerate = async () => {
    setErr("");
    setIsLoading(true);
    try {
      const payload = {
        name: user.name,
        email: user.email,
        agNo: user.agNo,
        department: user.department,
        semester: user.semester,
        [form.selectionType === "event" ? "eventId" : "programId"]: form.selectionId
      };
      await api.post("/tickets", payload);
      setShowSuccess(true);
      fetchMyTickets();
    } catch (err) {
      setErr(err.response?.data?.message || "Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const capitalizeTitle = (s) => s ? s.split(" ").map(w => w[0].toUpperCase() + w.substring(1)).join(" ") : "";

  const handleDownloadAll = () => {
    const qrs = Array.from(document.querySelectorAll(".expandableTicket canvas")).map(c => c.toDataURL());
    const ticketsForPDF = myTickets.map(t => {
      const ev = t.eventId || t.programId;
      return {
        ...t,
        eventTitle: ev?.title || "OFFICIAL PASS",
        eventDate: ev?.date ? formatDate(ev.date) : (ev?.startDate || "TBA"),
        eventTime: ev?.time || ev?.duration || "TBA",
        id: t.publicTicketId || t._id
      };
    });
    downloadAllTicketsPDF(ticketsForPDF, qrs);
  };

  if (!isAuthed) {
    return (
      <section className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card shadow-glass" style={{ maxWidth: '500px', textAlign: 'center', padding: '4rem 2rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🎫</div>
          <h2 className="sectionTitle" style={{ fontSize: '2rem' }}>Ready to Register?</h2>
          <p className="sectionSubtitle" style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>
            Please login or create an account to generate your event tickets and access your certificates.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btnPrimary" style={{ padding: '0.8rem 2rem' }}>🔓 Login Now</Link>
            <Link to="/register" className="btn btnGhost" style={{ padding: '0.8rem 2rem', borderColor: 'rgba(255,255,255,0.2)' }}>✨ Create Account</Link>
          </div>
        </div>
      </section>
    );
  }

  const isLocked = user.role === "student" && !user.isVerified;

  return (
    <section className="section">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="successModal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="successModalContent"
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
            >
              <div className="successIcon">✓</div>
              <h2 style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "0.5rem" }}>SUCCESS!</h2>
              <p style={{ fontSize: "1.1rem", opacity: 0.8, margin: 0 }}>Successfully Registered! 🎉</p>
              <div style={{ marginTop: "2rem", height: "4px", width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  style={{ height: "100%", background: "var(--accent-cyan)", boxShadow: "0 0 15px var(--accent-cyan)" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sectionHeader" style={{ marginBottom: "2.5rem" }}>
        <div>
          <h1 className="sectionTitle" style={{ fontSize: "2.5rem", letterSpacing: "-1px" }}>TICKETS & REGISTRATION</h1>
          <p className="sectionSubtitle">Verify your profile details and register for society events.</p>
        </div>
        <button className="btn btnGhost" style={{ padding: "0.6rem 1.5rem", borderRadius: "12px" }} onClick={() => { logout(); nav("/login"); }}>🚪 LOGOUT</button>
      </div>

      {isLocked ? (
        <div className="card shadow-glass" style={{ textAlign: "center", padding: "6rem 2rem", marginTop: "2rem", borderRadius: "40px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "6rem", marginBottom: "1.5rem" }}>🛡️</div>
          <h2 className="sectionTitle" style={{ fontSize: "2.2rem" }}>Verification Required</h2>
          <p className="sectionSubtitle" style={{ maxWidth: "500px", margin: "0 auto 2.5rem" }}>
            Please check your email and verify your account to access the official ticketing platform.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <button className="btn btnPrimary" style={{ padding: "1rem 3rem", borderRadius: "15px" }} onClick={() => window.location.reload()}>🔄 I'VE VERIFIED</button>
            <button
              className="btn btnGhost"
              style={{ padding: "0.8rem 2.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", fontSize: "0.9rem", cursor: cooldown > 0 ? "not-allowed" : "pointer" }}
              onClick={handleResendMail}
              disabled={resendLoading || cooldown > 0}
            >
              {resendLoading ? "⏳ SENDING..." : cooldown > 0 ? `📧 RESEND IN ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}` : "📧 RESEND EMAIL"}
            </button>
            {resendMessage && (
              <p style={{ fontSize: "0.9rem", color: "var(--accent-cyan)", fontWeight: 700, margin: "0.5rem 0 0 0" }}>
                {resendMessage}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card shadow-glass regCard" style={{
            padding: "3.5rem",
            borderRadius: "45px",
            position: "relative",
            overflow: "hidden",
            maxWidth: "1000px",
            margin: "0 auto",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.4)"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "6px", background: "linear-gradient(90deg, var(--accent-pink), var(--accent-cyan), var(--accent-pink))" }} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "3.5rem", textAlign: "center" }}>
              <div style={{ background: "rgba(34, 211, 238, 0.12)", padding: "1.5rem", borderRadius: "28px", border: "1px solid rgba(34, 211, 238, 0.3)", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.8rem" }}>🎫</span>
              </div>
              <h1 className="regTitle" style={{ margin: 0, fontSize: "2rem", fontWeight: 950, color: "#fff", letterSpacing: "1px" }}>SECURE REGISTRATION PORTAL</h1>
              <p className="regSubtitle" style={{ color: "var(--accent-pink)", fontSize: "0.9rem", fontWeight: 700, marginTop: "0.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>GENERATE YOUR VERIFIED DELEGATE PASS INSTANTLY</p>
            </div>

            <div className="regGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
              <div className="formGroup">
                <label className="formLabel" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", fontWeight: 900, marginBottom: "0.8rem", display: "block" }}>STUDENT FULL NAME</label>
                <input type="text" className="sexyInput" value={capitalizeTitle(user.name)} disabled />
              </div>
              <div className="formGroup">
                <label className="formLabel" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", fontWeight: 900, marginBottom: "0.8rem", display: "block" }}>UNIVERSITY AG IDENTIFIER</label>
                <input type="text" className="sexyInput" value={user.agNo} disabled />
              </div>
              <div className="formGroup">
                <label className="formLabel" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", fontWeight: 900, marginBottom: "0.8rem", display: "block" }}>VERIFIED STUDENT EMAIL</label>
                <input type="text" className="sexyInput" value={user.email} disabled />
              </div>
              <div className="formGroup">
                <label className="formLabel" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", fontWeight: 900, marginBottom: "0.8rem", display: "block" }}>VERIFIED DEPARTMENT</label>
                <input type="text" className="sexyInput" value={user.department} disabled style={{ border: user.isVerified ? "1px solid rgba(74, 222, 128, 0.3)" : "" }} />
              </div>
              <div className="formGroup">
                <label className="formLabel" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", fontWeight: 900, marginBottom: "0.8rem", display: "block" }}>CURRENT SEMESTER</label>
                <input type="text" className="sexyInput" value={user.semester} disabled />
              </div>

              <div className="formGroup" style={{ position: "relative" }}>
                <label className="formLabel" style={{ color: "var(--accent-pink)", fontSize: "0.9rem", fontWeight: 900, marginBottom: "0.8rem", display: "block" }}>SELECT ACTIVE EVENT <span style={{ color: "#fff" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select
                    className="sexyInput"
                    style={{ appearance: "none", cursor: "pointer", border: "1px solid rgba(255, 45, 149, 0.4)", paddingRight: "45px", background: "rgba(255, 45, 149, 0.08)", height: "55px" }}
                    value={`${form.selectionType}:${form.selectionId}`}
                    onChange={(e) => {
                      const [t, id] = e.target.value.split(":");
                      setForm({ ...form, selectionType: t, selectionId: id });
                    }}
                  >
                    {!events.length && !programs.length && <option value="">NO ACTIVE EVENTS AT THE MOMENT</option>}
                    <optgroup label="✨ MAJOR EVENTS" style={{ background: "#0a0f23", color: "var(--accent-cyan)", padding: "10px" }}>
                      {events.filter(e => !e.registrationDeadline || new Date(e.registrationDeadline).setHours(23, 59, 59, 999) >= new Date()).length > 0 ? (
                        events
                          .filter(e => !e.registrationDeadline || new Date(e.registrationDeadline).setHours(23, 59, 59, 999) >= new Date())
                          .map(e => <option key={e._id} value={`event:${e._id}`} style={{ background: "#0a0f23", color: "#fff" }}>{e.title}</option>)
                      ) : <option disabled>No active events</option>}
                    </optgroup>
                    <optgroup label="📚 TRAINING PROGRAMS" style={{ background: "#0a0f23", color: "var(--accent-cyan)", padding: "10px" }}>
                      {programs.length > 0 ? (
                        programs.map(p => <option key={p._id} value={`program:${p._id}`} style={{ background: "#0a0f23", color: "#fff" }}>{p.title}</option>)
                      ) : <option disabled>No active programs</option>}
                    </optgroup>
                  </select>
                  <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--accent-pink)", fontSize: "1.2rem" }}>▼</div>
                </div>
              </div>
            </div>

            {/* Deadline Display */}
            {form.selectionType === "event" && events.find(e => e._id === form.selectionId)?.registrationDeadline && (
              <div style={{
                marginTop: "2.5rem",
                padding: "1.2rem",
                borderRadius: "20px",
                background: "rgba(220, 39, 67, 0.05)",
                border: "1px solid rgba(220, 39, 67, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.8rem",
                animation: "pulse 2s infinite"
              }}>
                <span style={{ fontSize: "1.2rem" }}>⌛</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--accent-red)", letterSpacing: "1px" }}>
                  REGISTRATION DEADLINE: {formatDate(events.find(e => e._id === form.selectionId).registrationDeadline)}
                </span>
              </div>
            )}

            {(() => {
              const selectedItem = form.selectionType === 'event' ? events.find(e => e._id === form.selectionId) : null;
              const isDeadlinePassed = selectedItem?.registrationDeadline && new Date(selectedItem.registrationDeadline).setHours(23, 59, 59, 999) < new Date();

              if (isDeadlinePassed) {
                return (
                  <button
                    className="btn btnGhost"
                    style={{ width: "100%", marginTop: "2.5rem", padding: "1.2rem", borderRadius: "20px", fontSize: "1rem", fontWeight: 900, color: "var(--accent-red)", border: "2px dashed var(--accent-red)", cursor: "not-allowed" }}
                    disabled
                  >
                    🚫 REGISTRATION CLOSED (DEADLINE EXPIRED)
                  </button>
                );
              }

              return (
                <button
                  className="btn btnPrimary"
                  style={{ width: "100%", marginTop: "3.5rem", padding: "1.2rem", borderRadius: "20px", fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px" }}
                  onClick={onGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? "⏳ SYNCING DEPLOYMENT..." : "🚀 GENERATE VERIFIED PASS"}
                </button>
              );
            })()}
            {err && <div style={{ color: "#ff4d4d", marginTop: "1.5rem", textAlign: "center", fontWeight: 700, padding: "0.8rem", borderRadius: "12px", background: "rgba(255,77,77,0.15)" }}>{err}</div>}
          </div>

          <div style={{ marginTop: "5rem" }}>
            <div className="sectionHeader" style={{ border: "none", padding: 0, marginBottom: "3rem", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <h2 className="sectionTitle" style={{ fontSize: "2.5rem" }}>YOUR VERIFIED PASSES</h2>
              <div style={{ width: "60px", height: "4px", background: "var(--accent-cyan)", marginTop: "1rem" }} />
              {Array.isArray(myTickets) && myTickets.length > 0 && (
                <button className="btn btnPrimary" onClick={handleDownloadAll} style={{ marginTop: "2rem", fontSize: "0.85rem", padding: "0.7rem 2.2rem", borderRadius: "15px" }}>
                  📥 BATCH DOWNLOAD ALL
                </button>
              )}
            </div>

            <div style={{ display: "grid", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
              {Array.isArray(myTickets) && myTickets.map(t => {
                const ev = t.eventId || t.programId;
                const publicId = t.publicTicketId || t._id;
                return (
                  <div key={t._id} className="expandableTicket expanded group" style={{ 
                    border: "1.5px solid rgba(255, 45, 149, 0.5)", 
                    borderRadius: "24px", 
                    overflow: "hidden", 
                    background: "linear-gradient(145deg, rgba(20, 22, 35, 0.8) 0%, rgba(10, 12, 20, 0.95) 100%)", 
                    backdropFilter: "blur(20px)",
                    marginBottom: "2rem", 
                    position: "relative", 
                    boxShadow: "0 0 15px rgba(255, 45, 149, 0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease"
                  }}>
                    {/* Soft Glowing Background Orbs */}
                    <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "var(--accent-pink)", filter: "blur(100px)", opacity: 0.15, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "var(--accent-cyan)", filter: "blur(100px)", opacity: 0.15, pointerEvents: "none" }} />

                    <div className="horizontalTicket expandedHorizontal horizontalTicketMobile" style={{ background: "transparent", margin: 0, width: "100%", padding: 0, display: "flex", alignItems: "stretch" }}>

                      {/* QR SECTION (Tear-away stub) */}
                      <div className="ticketQrSection" style={{ 
                        width: "220px", 
                        padding: "1.5rem", 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        borderRight: "2px dashed rgba(255,255,255,0.25)", 
                        background: "rgba(0,0,0,0.2)",
                        position: "relative"
                      }}>
                        {/* Notch Top */}
                        <div style={{ position: "absolute", top: "-16px", right: "-16px", width: "30px", height: "30px", background: "var(--bg-main, #090e1e)", borderRadius: "50%", borderBottom: "1.5px solid rgba(255, 45, 149, 0.5)" }} />
                        {/* Notch Bottom */}
                        <div style={{ position: "absolute", bottom: "-16px", right: "-16px", width: "30px", height: "30px", background: "var(--bg-main, #090e1e)", borderRadius: "50%", borderTop: "1.5px solid rgba(255, 45, 149, 0.5)" }} />

                        <div style={{ background: "#fff", padding: "12px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                          <QRCodeCanvas value={publicId} size={130} level="H" />
                        </div>
                        <div style={{ marginTop: "1rem", letterSpacing: "3px", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>SCAN TO VERIFY</div>
                      </div>

                      {/* INFO SECTION */}
                      <div className="ticketInfoCol" style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 1 }}>
                        
                        {/* Top Area: Title & ID */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(34, 211, 238, 0.08)", border: "1px solid rgba(34, 211, 238, 0.2)", borderRadius: "100px", color: "var(--accent-cyan)", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "0.8rem" }}>
                              Official Delegate Pass
                            </div>
                            <h3 className="ticketTitle" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{ev?.title || "VERIFIED EVENT PASS"}</h3>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>TICKET ID</span>
                            <div style={{ fontFamily: "monospace", fontSize: "1.05rem", color: "#fff", fontWeight: 800, letterSpacing: "1.5px", background: "linear-gradient(90deg, #ff2d95, #a855f7)", padding: "6px 16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.2)", boxShadow: "0 0 15px rgba(255, 45, 149, 0.3)", textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>
                              {publicId}
                            </div>
                          </div>
                        </div>

                        {/* Middle Area: Grid Data */}
                        <div className="ticketContentGrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1.5rem", marginBottom: "1rem", padding: "1.2rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>DATE</span>
                            <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>{ev?.date ? formatDate(ev.date) : (ev?.startDate || "TBA")}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>TIME / DURATION</span>
                            <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>{ev?.time || ev?.duration || "TBA"}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>DEPARTMENT</span>
                            <span style={{ color: "var(--accent-cyan)", fontSize: "1rem", fontWeight: 700 }}>{t.department}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>SEMESTER</span>
                            <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>{t.semester}</span>
                          </div>
                        </div>

                        {/* Bottom Area: User Info & Actions */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "1.2rem" }}>
                          
                          {/* User Details */}
                          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: "#fff", boxShadow: "0 8px 16px rgba(0,0,0,0.3)" }}>
                              {t.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>ISSUED TO</span>
                              <strong style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{capitalizeTitle(t.name)}</strong>
                              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 500, marginTop: "2px" }}>{t.agNo} • {t.email}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              style={{
                                borderRadius: "12px",
                                padding: "10px 20px",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "#fff",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                backdropFilter: "blur(10px)"
                              }}
                              onClick={(e) => {
                                const canvas = e.currentTarget.closest(".expandableTicket").querySelector("canvas");
                                const data = {
                                  ...t,
                                  eventTitle: ev?.title,
                                  eventDate: ev?.date ? formatDate(ev.date) : (ev?.startDate || "TBA"),
                                  eventTime: ev?.time || ev?.duration || "TBA",
                                  id: t.publicTicketId || t._id
                                };
                                downloadTicketPDF(data, canvas?.toDataURL());
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <span style={{ fontSize: "1.1rem" }}>📥</span> DOWNLOAD PDF
                            </button>

                            {t.checkedIn && (
                              <button
                                style={{
                                  borderRadius: "12px",
                                  padding: "10px 20px",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "#10b981",
                                  background: "rgba(16, 185, 129, 0.08)",
                                  border: "1px solid rgba(16, 185, 129, 0.2)",
                                  display: "flex",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  gap: "8px",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.1)"
                                }}
                                onClick={() => {
                                  const certData = {
                                    ...t,
                                    eventTitle: ev?.title,
                                    eventDate: ev?.date ? formatDate(ev.date) : (ev?.startDate || "TBA")
                                  };
                                  downloadCertificatePDF(certData);
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
                                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.2)";
                                  e.currentTarget.style.transform = "translateY(0)";
                                }}
                              >
                                <span style={{ fontSize: "1.1rem" }}>📜</span> CERTIFICATE
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
      <style>{`
        .sexyInput {
          width: 100%;
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px;
          padding: 1rem 1.4rem;
          color: #fff !important;
          font-size: 1rem;
          transition: all 0.3s;
          outline: none;
        }
        .sexyInput:focus { border-color: var(--accent-cyan) !important; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }
        .successModal { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); 
            display: flex; align-items: center; justify-content: center; 
            z-index: 9999; backdrop-filter: blur(12px); 
        }
        .successModalContent { 
            background: rgba(10, 15, 35, 0.8); 
            padding: 4rem 5rem; 
            border-radius: 35px; 
            text-align: center; 
            border: 1px solid rgba(34, 211, 238, 0.4); 
            box-shadow: 0 0 80px rgba(34, 211, 238, 0.2), inset 0 0 20px rgba(255,255,255,0.05);
            color: #fff;
            max-width: 500px;
            width: 90%;
        }
        .successIcon { 
            font-size: 5rem; 
            color: var(--accent-cyan); 
            margin-bottom: 1.5rem;
            text-shadow: 0 0 30px rgba(34, 211, 238, 0.5);
        }

        /* Mobile specific overrides */
        @media (max-width: 992px) {
          .regGrid { grid-template-columns: 1fr !important; }
          .ticketContentGrid { grid-template-columns: 1fr 1fr 1fr !important; }
          .horizontalTicketMobile { flex-direction: column !important; padding: 2rem !important; }
          .ticketQrSection { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0 0 2rem 0 !important; }
          .ticketInfoCol { padding: 2rem 0 !important; width: 100% !important; }
          .ticketActionCol { width: 100% !important; padding: 1.5rem 0 0 0 !important; align-items: stretch !important; }
        }

        @media (max-width: 768px) {
          .regCard { padding: 1.5rem !important; border-radius: 25px !important; }
          .regTitle { font-size: 1.4rem !important; }
          .regSubtitle { font-size: 0.75rem !important; }
          .ticketTitle { font-size: 1.4rem !important; }
          .ticketContentGrid { grid-template-columns: 1fr 1fr !important; gap: 1rem !important; }
          .successModalContent { padding: 2rem 1.5rem; border-radius: 25px; }
          .successIcon { font-size: 3.5rem; }
          
          /* Realme 5i / Small Mobile Buttons */
          .regCard .btnPrimary { 
            font-size: 0.85rem !important; 
            padding: 1rem !important; 
            letter-spacing: 1px !important; 
            border-radius: 15px !important; 
          }
          .btnPrimary[style*="DOWNLOAD ALL"] {
             font-size: 0.75rem !important;
             padding: 0.6rem 1.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .ticketContentGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

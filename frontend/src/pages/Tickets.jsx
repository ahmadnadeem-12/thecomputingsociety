
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { QRCodeCanvas } from "qrcode.react";
import { downloadTicketPDF, downloadAllTicketsPDF } from "../services/pdfService";

export default function Tickets() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [form, setForm] = useState({ selectionType: "event", selectionId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isAuthed) {
      fetchData();
      fetchMyTickets();
    }
  }, [isAuthed]);

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
      
      if (evData.length > 0) {
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
          <button className="btn btnPrimary" style={{ padding: "1rem 3rem", borderRadius: "15px" }} onClick={() => window.location.reload()}>🔄 I'VE VERIFIED</button>
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
                      setForm({...form, selectionType: t, selectionId: id});
                    }}
                  >
                    {!events.length && !programs.length && <option value="">NO ACTIVE EVENTS AT THE MOMENT</option>}
                    <optgroup label="✨ MAJOR EVENTS" style={{ background: "#0a0f23", color: "var(--accent-cyan)", padding: "10px" }}>
                      {events.length > 0 ? (
                        events.map(e => <option key={e._id} value={`event:${e._id}`} style={{ background: "#0a0f23", color: "#fff" }}>{e.title}</option>)
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

            <button 
              className="btn btnPrimary" 
              style={{ width: "100%", marginTop: "3.5rem", padding: "1.2rem", borderRadius: "20px", fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px" }} 
              onClick={onGenerate} 
              disabled={isLoading}
            >
              {isLoading ? "⏳ SYNCING DEPLOYMENT..." : "🚀 GENERATE VERIFIED PASS"}
            </button>
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
                    <div key={t._id} className="expandableTicket expanded" style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", overflow: "hidden", background: "rgba(10,15,35,0.5)", marginBottom: "1.5rem", position: "relative", boxShadow: "0 15px 35px rgba(0,0,0,0.4)" }}>
                      <div className="horizontalTicket expandedHorizontal horizontalTicketMobile" style={{ background: "transparent", margin: 0, width: "100%", padding: "1.5rem 2rem", display: "flex", alignItems: "center" }}>
                        
                        {/* QR SECTION */}
                        <div className="ticketQrSection" style={{ width: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "2rem" }}>
                           <div style={{ background: "#fff", padding: "12px", borderRadius: "20px", boxShadow: "0 8px 25px rgba(0,0,0,0.3)" }}>
                             <QRCodeCanvas value={publicId} size={130} level="H" />
                           </div>
                           <div style={{ marginTop: "12px", letterSpacing: "2px", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>SCAN AT ENTRY</div>
                        </div>

                        {/* INFO SECTION */}
                        <div className="ticketInfoCol" style={{ flex: 1, padding: "0 2.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                           <h3 className="ticketTitle" style={{ fontSize: "1.8rem", fontWeight: 950, color: "var(--accent-pink)", margin: 0, letterSpacing: "0.5px", textShadow: "0 0 20px rgba(255, 45, 149, 0.2)" }}>{ev?.title || "VERIFIED PASS"}</h3>
                           
                           <div className="ticketContentGrid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>DATE</span>
                                <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>{ev?.date ? formatDate(ev.date) : (ev?.startDate || "TBA")}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>TIME/DURATION</span>
                                <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>{ev?.time || ev?.duration || "TBA"}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>DEPARTMENT</span>
                                <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>{t.department}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>SEMESTER</span>
                                <span style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>{t.semester}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>AG NO</span>
                                <span style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>{t.agNo}</span>
                              </div>
                           </div>

                           <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                              <div>
                                 <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", marginBottom: "4px", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>EMAIL</span>
                                 <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", fontWeight: 600 }}>{t.email}</span>
                              </div>
                              <div style={{ fontSize: "1.1rem" }}>
                                 <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Issued to: </span>
                                 <strong style={{ color: "#fff", fontWeight: 900 }}>{capitalizeTitle(t.name)}</strong>
                              </div>
                           </div>

                           <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "0.5rem" }}>
                              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", fontWeight: 600 }}>Ticket ID:</span>
                              <div style={{ background: "rgba(34, 211, 238, 0.05)", border: "1px solid rgba(34, 211, 238, 0.2)", padding: "6px 18px", borderRadius: "100px", color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px" }}>
                                {publicId}
                              </div>
                           </div>
                        </div>

                        {/* ACTION SECTION */}
                        <div className="ticketActionCol" style={{ width: "260px", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center", alignItems: "flex-end", paddingLeft: "1rem" }}>
                           <button 
                             className="btn btnPrimary" 
                             style={{ 
                               borderRadius: "50px", 
                               height: "60px",
                               padding: "0 2rem", 
                               fontSize: "1rem", 
                               fontWeight: 900, 
                               width: "100%", 
                               display: "flex", 
                               alignItems: "center", 
                               justifyContent: "center", 
                               gap: "10px",
                               background: "linear-gradient(90deg, #ff2d95, #a855f7)",
                               border: "none",
                               boxShadow: "0 0 35px rgba(168, 85, 247, 0.3)",
                               transition: "all 0.3s ease"
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
                             onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                             onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                            >
                             <span style={{ fontSize: "1.4rem" }}>📥</span> DOWNLOAD PDF
                           </button>


                           {t.checkedIn && (
                             <button 
                               className="btn" 
                               style={{ 
                                 width: "100%", 
                                 borderRadius: "50px", 
                                 padding: "10px 20px", 
                                 fontSize: "0.85rem", 
                                 fontWeight: 900, 
                                 color: "#ffd700", 
                                 background: "rgba(255, 215, 0, 0.1)", 
                                 border: "1px solid rgba(255, 215, 0, 0.3)",
                                 boxShadow: "0 0 15px rgba(255, 215, 0, 0.1)"
                               }} 
                               onClick={() => nav("/certificate-preview", { 
                                 state: { 
                                   ...t, 
                                   eventTitle: ev?.title,
                                   eventDate: ev?.date ? formatDate(ev.date) : (ev?.startDate || "TBA")
                                 } 
                               })}
                             >
                               📜 CLAIM CERTIFICATE
                             </button>
                           )}
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
        }

        @media (max-width: 480px) {
          .ticketContentGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

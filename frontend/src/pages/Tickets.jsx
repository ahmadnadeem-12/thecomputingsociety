
import React, { useContext, useMemo, useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { EventContext } from "../context/EventContext";
import { listPrograms } from "../services/programService";
import { createTicket, listTickets } from "../services/ticketService";
import { downloadTicketPDF, downloadAllTicketsPDF, downloadCertificatePDF } from "../services/pdfService";
import { sendTicketEmail } from "../services/emailService";
import { formatDate } from "../utils/helpers";
import { Skeleton, SkeletonTitle, SkeletonText, SkeletonPill } from "../components/ui/Skeleton";
import "../assets/styles/pages/tickets.css";


const DEPARTMENTS = ["CS", "SE", "Data Science", "AI", "IT", "Bioinformatics"];
const AG_REGEX = /^\d{4}-AG-\d{4,5}$/;

function slug(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Tickets() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();
  const eventsCtx = useContext(EventContext);
  const location = useLocation();
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const qrRef = useRef(null);

  const events = useMemo(
    () => (eventsCtx.events || []).filter((e) => e.status !== "past"),
    [eventsCtx.events, eventsCtx.version]
  );

  const [form, setForm] = useState({
    fullName: user?.name || "",
    agNo: "",
    email: user?.email || "",
    selectionId: "", // Combined ID for event or program
    selectionType: "event", // "event" or "program"
    department: "CS",
    semester: "1",
  });

  // Fetch programs
  useEffect(() => {
    setLoadingPrograms(true);
    listPrograms()
      .then(data => setPrograms((data || []).filter(p => p.status !== "upcoming")))
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));
  }, []);

  // Handle Query Parameters & Default Selections
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pId = params.get("programId");
    const eId = params.get("eventId");

    if (pId) {
      setForm(prev => ({ ...prev, selectionId: pId, selectionType: "program" }));
    } else if (eId) {
      setForm(prev => ({ ...prev, selectionId: eId, selectionType: "event" }));
    } else {
        // Defaults
        if (events.length > 0) {
            setForm(prev => ({ ...prev, selectionId: events[0].id || events[0]._id, selectionType: "event" }));
        } else if (programs.length > 0) {
            setForm(prev => ({ ...prev, selectionId: programs[0].id || programs[0]._id, selectionType: "program" }));
        }
    }
  }, [location.search, events.length, programs.length]);


  const [ticket, setTicket] = useState(null);
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showSuccess) {
      document.body.classList.add('modalOpen');
    } else {
      document.body.classList.remove('modalOpen');
    }
    return () => {
      document.body.classList.remove('modalOpen');
    };
  }, [showSuccess]);

  const selectedEvent = events.find((e) => (e.id || e._id) === form.selectionId);
  const selectedProgram = programs.find((p) => (p.id || p._id) === form.selectionId);
  const activeTarget = form.selectionType === "event" ? selectedEvent : selectedProgram;

  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (!user) { setMyTickets([]); return; }
    setLoadingTickets(true);
    listTickets()
      .then(data => {
        setMyTickets((data || []).filter(t => t.userId === (user?.id || user?._id)));
      })
      .catch(() => setMyTickets([]))
      .finally(() => setLoadingTickets(false));
  }, [user, ticket]);

  // Get QR code as data URL
  const getQRCodeDataUrl = () => {
    // Generate high-resolution QR for PDF (uses the hidden high-res canvas)
    const highResRef = document.getElementById('high-res-qr-hidden');
    if (highResRef) {
      const canvas = highResRef.querySelector('canvas');
      if (canvas) {
        return canvas.toDataURL('image/png', 1.0);
      }
    }
    // Fallback
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        return canvas.toDataURL('image/png', 1.0);
      }
    }
    return null;
  };

  // Handle PDF Download
  const handleDownloadPDF = () => {
    if (!ticket) return;

    const qrDataUrl = getQRCodeDataUrl();
    const ticketData = {
      ...ticket,
      eventTitle: activeTarget?.title || 'TCS Ticket',
      eventDate: activeTarget ? (activeTarget.date || activeTarget.startDate) : 'TBA',
      eventTime: activeTarget?.time || activeTarget?.duration || 'TBA',
    };

    downloadTicketPDF(ticketData, qrDataUrl);
  };

  // Handle Download All
  const handleDownloadAll = () => {
    if (myTickets.length === 0) {
      alert("No tickets to download.");
      return;
    }

    // Capture all canvases from the "My Tickets" section
    const canvasContainers = document.querySelectorAll('.expandableTicket .ticketQrSection canvas');
    
    if (canvasContainers.length === 0) {
      alert("QR codes are still loading. Please wait a moment.");
      return;
    }

    const qrUrls = Array.from(canvasContainers).map(c => c.toDataURL('image/png'));
    
    // Prepare data
    const formattedTickets = myTickets.map(t => {
      const eventId = t.eventId?._id || t.eventId;
      const programId = t.programId?._id || t.programId;
      const ev = (eventsCtx.events || []).find(e => (e._id || e.id) === eventId);
      const pr = (programs || []).find(p => (p._id || p.id) === programId);

      return {
        ...t,
        eventTitle: ev?.title || pr?.title || t.eventId?.title || t.programId?.title || "TCS Ticket",
        eventDate: ev ? formatDate(ev.date) : (pr ? pr.startDate : (t.eventId?.date ? formatDate(t.eventId.date) : (t.programId?.startDate || "TBA"))),
        eventTime: ev?.time || pr?.duration || t.eventId?.time || t.programId?.duration || "TBA"
      };
    });

    downloadAllTicketsPDF(formattedTickets, qrUrls);
  };

  // Handle Email Sending
  const handleSendEmail = async () => {
    if (!ticket) return false;

    const qrDataUrl = getQRCodeDataUrl();
    const ticketData = {
      ...ticket,
      eventTitle: activeTarget?.title || 'TCS Ticket',
      eventDate: activeTarget ? (activeTarget.date || activeTarget.startDate) : 'TBA',
      eventTime: activeTarget?.time || activeTarget?.duration || 'TBA',
    };

    try {
      const success = await sendTicketEmail(ticketData, qrDataUrl);
      return success;
    } catch (error) {
      console.error('Email error:', error);
      return false;
    }
  };

  if (!isAuthed) {
    return (
      <section className="section">
        <div className="sectionTitle">Tickets & Registration</div>
        <div className="sectionSubtitle" style={{ marginTop: ".35rem" }}>
          Student must login first to register & generate QR ticket.
        </div>
        <div style={{ marginTop: ".9rem", display: "flex", gap: ".6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btnPrimary" onClick={() => nav("/login")}>Login</button>
          <button className="btn btnGhost" onClick={() => nav("/register")}>Register</button>
        </div>
      </section>
    );
  }

  const onGenerate = async () => {
    setErr("");
    setIsLoading(true);
    setEmailSent(false);

    try {
      if (!form.fullName.trim()) throw new Error("Full Name is required.");
      if (!form.email.trim()) throw new Error("Email is required.");
      if (!form.agNo.trim()) throw new Error("AG No is required.");
      if (!AG_REGEX.test(form.agNo.trim().toUpperCase()))
        throw new Error("AG No format must be YYYY-AG-XXXX or YYYY-AG-XXXXX (digits).");
      
      if (!form.selectionId) throw new Error("Please select an event or program.");
      
      // Capacity check on frontend for extra UX
      if (activeTarget && activeTarget.capacity > 0 && activeTarget.seatsRemaining <= 0) {
        throw new Error(`This ${form.selectionType} is sold out! Please select another one.`);
      }

      // Server handles duplicate checks
      const ag = form.agNo.trim().toUpperCase();

      const t = await createTicket({
        userId: user.id || user._id,
        eventId: form.selectionType === "event" ? form.selectionId : undefined,
        programId: form.selectionType === "program" ? form.selectionId : undefined,
        name: form.fullName.trim(),
        agNo: ag,
        email: form.email.trim(),
        department: form.department,
        semester: form.semester,
      });

      setTicket(t);

      // Refresh events context to update capacity on all pages
      eventsCtx.refresh?.();

      // Show success popup
      setShowSuccess(true);

      // Try to send email (don't block on failure)
      setTimeout(async () => {
        const emailSuccess = await handleSendEmail();
        setEmailSent(emailSuccess);
      }, 500);

    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to create ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  // Super Short QR Payload (only the 24-char unique ID to keep QR clean and not messy)
  const qrPayload = ticket ? (ticket._id || ticket.id) : "";

  // Helper function to get the shortest QR payload for any ticket
  const getQrPayload = (t) => (t._id || t.id);

  return (
    <section className="section">
      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="successModal">
          <div className="successModalContent">
            <div className="successIcon">✓</div>
            <h2>Registered Successfully! 🎉</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Your ticket has been generated for:
            </p>
            <p style={{ color: "var(--accent-cyan)", fontWeight: 700, marginTop: "0.25rem" }}>
              {activeTarget?.title || "Ticket"}
            </p>

            {/* Email Status */}
            <div className="emailStatus">
              {emailSent ? (
                <span style={{ color: "#4ade80" }}>✓ Email sent successfully to {ticket?.email}</span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>📧 Sending email to {ticket?.email}...</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="successActions">
              <button className="btn btnPrimary" onClick={() => { handleDownloadPDF(); setShowSuccess(false); }}>
                📥 Download PDF Ticket
              </button>
              <button className="btn btnGhost" onClick={() => setShowSuccess(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">Tickets & Registration</div>
          <div className="sectionSubtitle">
            Required fields shown with <b className="reqStar">*</b> • 1 ticket = 1 registration
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <div className="pill pillRed">QR Ticket</div>
          <button
            className="btn btnGhost"
            onClick={() => { logout(); nav("/login"); }}
            aria-label="Logout"
            style={{ fontSize: ".82rem", padding: ".45rem .9rem" }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="ticketsGrid">
        <div className="card">
          <div style={{ fontWeight: 900, marginBottom: ".2rem" }}>Registration Form</div>
          <div className="sectionSubtitle">
            Enter your AG Number (e.g., <b>2022-AG-9800</b>)
          </div>

          <div className="hr" />

          <div className="formRow">
            <div>
              <div className="label">Full Name<span className="reqStar">*</span></div>
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <div className="label">AG No<span className="reqStar">*</span></div>
              <input
                className="input"
                value={form.agNo}
                onChange={(e) => setForm({ ...form, agNo: e.target.value })}
                placeholder="e.g. 2022-AG-9800"
                maxLength={15}
              />
            </div>
          </div>

          <div className="formRow" style={{ marginTop: ".7rem" }}>
            <div>
              <div className="label">Email<span className="reqStar">*</span></div>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com"
              />
            </div>
            <div>
              <div className="label">Select Event or Program<span className="reqStar">*</span></div>
              <select
                className="input"
                value={`${form.selectionType}:${form.selectionId}`}
                onChange={(e) => {
                    const [type, id] = e.target.value.split(":");
                    setForm({ ...form, selectionType: type, selectionId: id });
                }}
              >
                <option value="">-- Choose Option --</option>
                <optgroup label="Upcoming Events">
                   {events.map((e) => (
                    <option 
                        key={e.id || e._id} 
                        value={`event:${e.id || e._id}`}
                        disabled={e.capacity > 0 && e.seatsRemaining <= 0}
                    >
                        📅 {e.title} {e.capacity > 0 && e.seatsRemaining <= 0 ? " (SOLD OUT)" : ""}
                    </option>
                    ))}
                </optgroup>
                <optgroup label="Programs & Workshops">
                    {programs.map((p) => (
                    <option 
                        key={p.id || p._id} 
                        value={`program:${p.id || p._id}`}
                        disabled={p.capacity > 0 && p.seatsRemaining <= 0}
                    >
                        🎯 {p.title} {p.capacity > 0 && p.seatsRemaining <= 0 ? " (FULL)" : ""}
                    </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="formRow" style={{ marginTop: ".7rem" }}>
            <div>
              <div className="label">Department<span className="reqStar">*</span></div>
              <select
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">Semester<span className="reqStar">*</span></div>
              <select
                className="input"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {err && <div style={{ marginTop: ".8rem", color: "#ffd2d7" }}>{err}</div>}

          <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
            <button
              className="btn btnPrimary"
              onClick={onGenerate}
              disabled={isLoading}
            >
              {isLoading ? "⏳ Generating..." : "Get Ticket"}
            </button>
            <div className="sectionSubtitle">
              Logged in as: <b>{user.email}</b>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 900, marginBottom: ".25rem" }}>Your QR Ticket</div>

          {ticket ? (
            <div className="horizontalTicket">
              {/* QR Code - Left */}
              <div className="ticketQrSection" ref={qrRef}>
                <div className="qrWrapper">
                  <QRCodeCanvas 
                    value={qrPayload} 
                    size={170} 
                    level="H" 
                    includeMargin={true}
                    marginSize={2}
                  />
                </div>
                <div className="qrScanLabel">Scan at Entry</div>
              </div>

              {/* Details - Center (Horizontal Grid) */}
              <div className="ticketDetailsSection">
                <h3 className="ticketEventTitle">{activeTarget?.title || "Ticket"}</h3>
                <div className="ticketDetailsGrid">
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Date</span>
                    <span className="detailValue">{activeTarget ? (activeTarget.date || activeTarget.startDate || "TBA") : "TBA"}</span>
                  </div>
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Time/Duration</span>
                    <span className="detailValue">{activeTarget?.time || activeTarget?.duration || "TBA"}</span>
                  </div>
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Department</span>
                    <span className="detailValue">{ticket.department}</span>
                  </div>
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Semester</span>
                    <span className="detailValue">{ticket.semester}</span>
                  </div>
                  <div className="ticketDetailItem">
                    <span className="detailLabel">AG No</span>
                    <span className="detailValue">{ticket.agNo}</span>
                  </div>
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Email</span>
                    <span className="detailValue">{ticket.email}</span>
                  </div>
                </div>
                <div className="ticketIssuedTo">
                  Issued to: <strong>{ticket.name}</strong>
                </div>
                <div className="ticketIdDisplay">
                  Ticket ID: <code>{ticket.publicTicketId || ticket.id}</code>
                </div>
              </div>

              {/* Download Button - Right */}
              <div className="ticketActionSection">
                <button className="btn btnPrimary downloadBtn" onClick={handleDownloadPDF}>
                  📥 Download PDF
                </button>
              </div>
            </div>
          ) : (

            <div className="sectionSubtitle">Generate ticket to see QR here.</div>
          )}

          <div className="hr" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div style={{ fontWeight: 900 }}>My Tickets</div>
            {myTickets.length > 0 && (
              <button 
                className="btn btnPrimary" 
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
                onClick={handleDownloadAll}
              >
                📥 Download All (PDF)
              </button>
            )}
          </div>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {loadingTickets ? (
              [1, 2].map(i => (
                <div key={i} className="expandableTicket" style={{ border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <Skeleton style={{ width: "130px", height: "130px", borderRadius: "12px" }} />
                    <div style={{ flex: 1 }}>
                      <SkeletonTitle style={{ height: "1.5rem", width: "60%" }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "1rem" }}>
                        <Skeleton style={{ height: "0.8rem" }} />
                        <Skeleton style={{ height: "0.8rem" }} />
                        <Skeleton style={{ height: "0.8rem" }} />
                        <Skeleton style={{ height: "0.8rem" }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              myTickets.slice(0, 10).map((t) => {
                const eventId = t.eventId?._id || t.eventId || t.event;
                const programId = t.programId?._id || t.programId || t.program;
                
                const ev = eventId ? (eventsCtx.events || []).find((e) => (e._id || e.id) === eventId) : null;
                const pr = programId ? (programs || []).find((p) => (p._id || p.id) === programId) : null;

                // Use populated data if context lookup fails
                const displayTitle = ev?.title || pr?.title || t.eventId?.title || t.programId?.title || "TCS Ticket";
                const displayDate = ev ? formatDate(ev.date) : (pr ? pr.startDate : (t.eventId?.date ? formatDate(t.eventId.date) : (t.programId?.startDate || "TBA")));
                const displayTime = ev?.time || pr?.duration || t.eventId?.time || t.programId?.duration || "TBA";

                return (
                  <div key={t._id || t.id} className="expandableTicket expanded">
                    <div className="horizontalTicket expandedHorizontal">
                      {/* QR Code - Left */}
                      <div className="ticketQrSection">
                        <div className="qrWrapper">
                          <QRCodeCanvas 
                            value={getQrPayload(t)} 
                            size={130} 
                            level="H" 
                            includeMargin={true}
                            marginSize={2}
                          />
                        </div>
                        <div className="qrScanLabel">Scan at Entry</div>
                      </div>

                      {/* Details - Center */}
                      <div className="ticketDetailsSection">
                        <h3 className="ticketEventTitle">{displayTitle}</h3>
                        <div className="ticketDetailsGrid">
                          <div className="ticketDetailItem">
                            <span className="detailLabel">Date</span>
                            <span className="detailValue">{displayDate}</span>
                          </div>
                          <div className="ticketDetailItem">
                            <span className="detailLabel">Time/Duration</span>
                            <span className="detailValue">{displayTime}</span>
                          </div>
                          <div className="ticketDetailItem">
                            <span className="detailLabel">Department</span>
                            <span className="detailValue">{t.department}</span>
                          </div>
                          <div className="ticketDetailItem">
                            <span className="detailLabel">Semester</span>
                            <span className="detailValue">{t.semester}</span>
                          </div>
                          <div className="ticketDetailItem">
                            <span className="detailLabel">AG No</span>
                            <span className="detailValue">{t.agNo}</span>
                          </div>
                          <div className="ticketDetailItem">
                            <span className="detailLabel">Email</span>
                            <span className="detailValue">{t.email}</span>
                          </div>
                        </div>
                        <div className="ticketIssuedTo">
                          Issued to: <strong>{t.name}</strong>
                        </div>
                        <div className="ticketIdDisplay">
                          Ticket ID: <code>{t.publicTicketId || (t._id || t.id)}</code>
                        </div>
                      </div>

                      {/* Download Button - Right */}
                      <div className="ticketActionSection">
                        <button
                          className="btn btnPrimary downloadBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const ticketData = {
                              ...t,
                              eventTitle: displayTitle,
                              eventDate: displayDate,
                              eventTime: displayTime,
                            };
                            const expandedTicket = e.target.closest('.expandableTicket');
                            const canvas = expandedTicket?.querySelector('.ticketQrSection canvas');
                            if (canvas) {
                              downloadTicketPDF(ticketData, canvas.toDataURL('image/png'));
                            }
                          }}
                        >
                          📥 Download PDF
                        </button>
                        {t.checkedIn && (
                          <button
                            className="btn btnGhost downloadBtn"
                            style={{ marginTop: ".4rem", fontSize: ".78rem" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadCertificatePDF({
                                name: t.name,
                                agNo: t.agNo,
                                eventTitle: displayTitle,
                                eventDate: displayDate,
                                eventTime: displayTime,
                                certificateDescription: ev?.certificateDescription || t.eventId?.certificateDescription,
                                organizer: "The Computing Society",
                              });
                            }}
                          >
                            📜 Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {!loadingTickets && myTickets.length === 0 && <div className="sectionSubtitle">No tickets yet.</div>}
          </div>
        </div>
      </div>

      {/* Hidden High-Resolution QR Generator for PDF Export */}
      <div id="high-res-qr-hidden" style={{ display: 'none' }}>
        {ticket && (
          <QRCodeCanvas 
            value={qrPayload} 
            size={512} 
            level="H" 
            includeMargin={true}
            marginSize={4}
          />
        )}
      </div>
    </section>
  );
}

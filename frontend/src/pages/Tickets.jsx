
import React, { useContext, useMemo, useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { EventContext } from "../context/EventContext";
import { createTicket, listTickets } from "../services/ticketService";
import { downloadTicketPDF } from "../services/pdfService";
import { sendTicketEmail } from "../services/emailService";
import { formatDate } from "../utils/helpers";
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
  const { user, isAuthed } = useAuth();
  const nav = useNavigate();
  const eventsCtx = useContext(EventContext);
  const qrRef = useRef(null);

  const events = useMemo(
    () => (eventsCtx.events || []).filter((e) => e.status !== "past"),
    [eventsCtx.events, eventsCtx.version]
  );

  const [form, setForm] = useState({
    fullName: user?.name || "",
    agNo: "",
    email: user?.email || "",
    eventId: events?.[0]?.id || "",
    department: "CS",
    semester: "1",
  });


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

  const selectedEvent = events.find((e) => e.id === form.eventId);

  const [myTickets, setMyTickets] = useState([]);
  useEffect(() => {
    if (!user) { setMyTickets([]); return; }
    listTickets().then(data => setMyTickets((data || []).filter(t => t.userId === (user?.id || user?._id)))).catch(() => setMyTickets([]));
  }, [user, ticket]);

  // Get QR code as data URL
  const getQRCodeDataUrl = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        return canvas.toDataURL('image/png');
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
      eventTitle: selectedEvent?.title || 'TCS Event',
      eventDate: selectedEvent ? formatDate(selectedEvent.date) : 'TBA',
      eventTime: selectedEvent?.time || 'TBA',
    };

    downloadTicketPDF(ticketData, qrDataUrl);
  };

  // Handle Email Sending
  const handleSendEmail = async () => {
    if (!ticket) return false;

    const qrDataUrl = getQRCodeDataUrl();
    const ticketData = {
      ...ticket,
      eventTitle: selectedEvent?.title || 'TCS Event',
      eventDate: selectedEvent ? formatDate(selectedEvent.date) : 'TBA',
      eventTime: selectedEvent?.time || 'TBA',
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
        <div style={{ marginTop: ".9rem", display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
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
      if (!form.eventId) throw new Error("Event is required.");

      // Server handles duplicate checks
      const ag = form.agNo.trim().toUpperCase();

      const t = await createTicket({
        userId: user.id || user._id,
        eventId: form.eventId,
        name: form.fullName.trim(),
        agNo: ag,
        email: form.email.trim(),
        department: form.department,
        semester: form.semester,
      });

      setTicket(t);

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

  const qrPayload = ticket
    ? JSON.stringify({
      ticketId: ticket._id || ticket.id,
      publicTicketId: ticket.publicTicketId,
      userId: ticket.userId || ticket.user,
      eventId: ticket.eventId,
      agNo: ticket.agNo,
      email: ticket.email,
      department: ticket.department,
      semester: ticket.semester,
    })
    : "";

  // Helper function to get QR payload for any ticket
  const getQrPayload = (t) => JSON.stringify({
    ticketId: t._id || t.id,
    publicTicketId: t.publicTicketId,
    userId: t.userId || t.user,
    eventId: t.eventId || t.event,
    agNo: t.agNo,
    email: t.email,
  });

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
              {selectedEvent?.title || "Event"}
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
            Required fields shown with <b className="reqStar">*</b> • 1 ticket = 1 event
          </div>
        </div>
        <div className="pill pillRed">QR Ticket</div>
      </div>

      <div className="ticketsGrid">
        <div className="card">
          <div style={{ fontWeight: 900, marginBottom: ".2rem" }}>Register for Event</div>
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
              <div className="label">Event<span className="reqStar">*</span></div>
              <select
                className="input"
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
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
                <QRCodeCanvas value={qrPayload || ticket.id} size={140} includeMargin={true} />
                <div className="qrScanLabel">Scan at Entry</div>
              </div>

              {/* Details - Center (Horizontal Grid) */}
              <div className="ticketDetailsSection">
                <h3 className="ticketEventTitle">{selectedEvent?.title || "Event"}</h3>
                <div className="ticketDetailsGrid">
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Date</span>
                    <span className="detailValue">{selectedEvent ? formatDate(selectedEvent.date) : "TBA"}</span>
                  </div>
                  <div className="ticketDetailItem">
                    <span className="detailLabel">Time</span>
                    <span className="detailValue">{selectedEvent?.time || "TBA"}</span>
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
          <div style={{ fontWeight: 900, marginBottom: ".35rem" }}>My Tickets</div>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {myTickets.slice(0, 10).map((t) => {
              const ev = (eventsCtx.events || []).find((e) => (e._id || e.id) === (t.eventId || t.event));

              return (
                <div key={t._id || t.id} className="expandableTicket expanded">
                  <div className="horizontalTicket expandedHorizontal">
                    {/* QR Code - Left */}
                    <div className="ticketQrSection">
                      <QRCodeCanvas value={getQrPayload(t)} size={120} includeMargin={true} />
                      <div className="qrScanLabel">Scan at Entry</div>
                    </div>

                    {/* Details - Center */}
                    <div className="ticketDetailsSection">
                      <h3 className="ticketEventTitle">{ev?.title || "Event"}</h3>
                      <div className="ticketDetailsGrid">
                        <div className="ticketDetailItem">
                          <span className="detailLabel">Date</span>
                          <span className="detailValue">{ev ? formatDate(ev.date) : "TBA"}</span>
                        </div>
                        <div className="ticketDetailItem">
                          <span className="detailLabel">Time</span>
                          <span className="detailValue">{ev?.time || "TBA"}</span>
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
                            eventTitle: ev?.title || 'TCS Event',
                            eventDate: ev ? formatDate(ev.date) : 'TBA',
                            eventTime: ev?.time || 'TBA',
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
                    </div>
                  </div>
                </div>
              );
            })}
            {myTickets.length === 0 && <div className="sectionSubtitle">No tickets yet.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

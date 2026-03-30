
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { listTickets, setTicketCheckedIn, deleteTicket, checkInByQrCode } from "../../services/ticketService";
import { listEvents } from "../../services/eventService";
import "../../assets/styles/pages/adminTickets.css";

function toCSV(rows) {
  const headers = ["publicTicketId", "agNo", "name", "email", "eventId", "eventTitle", "department", "semester", "createdAt", "checkedIn"];
  const esc = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map(h => esc(r[h])).join(","));
  }
  return lines.join("\n");
}
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminTickets() {
  const [q, setQ] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // quick check-in by AG
  const [checkAg, setCheckAg] = useState("");
  const [checkEvent, setCheckEvent] = useState("");
  const [checkMsg, setCheckMsg] = useState("");

  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    listEvents().then(d => setEvents(d || [])).catch(() => { });
  }, []);

  useEffect(() => {
    listTickets().then(d => setTickets(d || [])).catch(() => { });
  }, [refresh]);

  const eventMap = useMemo(() => {
    const m = {};
    for (const e of events) {
      m[e._id || e.id] = e;
    }
    return m;
  }, [events]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tickets;
    return tickets.filter(t =>
      (t.agNo || "").toLowerCase().includes(s) ||
      (t.publicTicketId || "").toLowerCase().includes(s) ||
      (t.name || "").toLowerCase().includes(s) ||
      (t.email || "").toLowerCase().includes(s)
    );
  }, [tickets, q]);

  const enriched = useMemo(() => {
    return filtered.map(t => {
      const ev = eventMap[t.eventId];
      const title = ev?.title || "Event";
      const short = `${t.eventId} • ${title}`; // short only (no username)
      return { ...t, eventTitle: short };
    });
  }, [filtered, eventMap]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(enriched.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = enriched.slice(start, start + pageSize);

  const checkedInCount = enriched.filter(t => t.checkedIn).length;

  const handleExport = () => {
    const csv = toCSV(enriched);
    downloadText(`tcs-tickets-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const markCheckedIn = async (ticketId, val) => {
    await setTicketCheckedIn(ticketId, val);
    setRefresh(x => x + 1);
  };

  // Handle ticket deletion (Admin only)
  const handleDelete = async (ticketId, ticketInfo) => {
    const confirmMsg = `Are you sure you want to delete this ticket?\n\nAG No: ${ticketInfo.agNo}\nName: ${ticketInfo.name}\nEvent: ${ticketInfo.eventTitle}\n\nThis will allow the student to re-register.`;

    if (window.confirm(confirmMsg)) {
      try {
        await deleteTicket(ticketId);
        setCheckMsg("✅ Ticket deleted successfully. Student can now re-register.");
        setRefresh(x => x + 1);
      } catch (err) {
        setCheckMsg("❌ Failed to delete ticket.");
      }
    }
  };

  // QR Scan using html5-qrcode (reliable cross-browser)
  const [scanError, setScanError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const html5QrRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Audio beep for scan feedback
  const playBeep = (success) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = success ? 880 : 330;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + (success ? 0.15 : 0.3));
    } catch (e) { /* audio not available */ }
  };

  const startScan = async () => {
    setScanError("");
    setScanResult(null);
    setScanning(true);

    setTimeout(async () => {
      if (!document.getElementById("admin-qr-reader")) return;

      try {
        const html5QrCode = new Html5Qrcode("admin-qr-reader");
        html5QrRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          async (decodedText) => {
            // Prevent duplicate processing
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
              const result = await checkInByQrCode(decodedText);
              setScanResult(result);
              playBeep(result.success && result.isNewCheckIn);

              if (result.success && result.isNewCheckIn) {
                setCheckMsg(`✅ ${result.ticket?.name || "Student"} checked-in!`);
              } else if (result.ticket?.checkedIn) {
                setCheckMsg(`⚠️ ${result.ticket?.name || "Student"} already checked-in.`);
              } else {
                setCheckMsg(result.message || "❌ Invalid QR code.");
              }

              setRefresh(x => x + 1);

              // Reset after 2 seconds for continuous scanning
              setTimeout(() => {
                setScanResult(null);
                isProcessingRef.current = false;
              }, 2000);
            } catch (err) {
              setScanResult({ success: false, message: "❌ Network error" });
              setTimeout(() => {
                setScanResult(null);
                isProcessingRef.current = false;
              }, 2000);
            }
          },
          () => { /* ignore no-QR-in-frame errors */ }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setScanError("📷 Camera access denied or not available.");
        setScanning(false);
      }
    }, 200);
  };

  const stopScan = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (err) { /* already stopped */ }
      html5QrRef.current = null;
    }
    setScanning(false);
    setScanResult(null);
    isProcessingRef.current = false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => { });
      }
    };
  }, []);

  const quickCheckIn = async () => {
    setCheckMsg("");
    const ag = checkAg.trim().toUpperCase();
    const ev = checkEvent.trim();
    if (!ag || !ev) {
      setCheckMsg("AG No + Event required.");
      return;
    }
    const found = tickets.find(t => (t.agNo || "").toUpperCase() === ag && (t.eventId === ev || t._id === ev));
    if (!found) {
      setCheckMsg("Ticket not found for this AG No + Event.");
      return;
    }
    if (found.checkedIn) {
      setCheckMsg("Already checked-in.");
      return;
    }
    try {
      await setTicketCheckedIn(found._id || found.id, true);
      setRefresh(x => x + 1);
      setCheckMsg(`✅ ${ag} Checked-in successfully!`);
      setQ(ag);
      setCheckAg("");
    } catch (err) {
      setCheckMsg(`❌ Error: ${err.response?.data?.message || "Failed to check-in"}`);
    }
  };

  return (
    <section className="section">
      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">Admin • Tickets</div>
          <div className="sectionSubtitle">All tickets • Search (AG/ID) • Export CSV • QR check-in</div>
        </div>
        <div className="pill pillRed">{enriched.length} tickets • {checkedInCount} checked-in</div>
      </div>

      <div className="adminTools">
        <div className="adminSearch">
          <input
            className="input"
            placeholder="Search by AG No / Ticket ID / Email"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
          <button className="btn btnGhost" onClick={() => { setQ(""); setPage(1); }}>Clear</button>
          <button className="btn btnPrimary" onClick={handleExport}>Export CSV</button>
        </div>

        <div className="adminScan">
          <div className="sectionSubtitle" style={{ marginBottom: ".4rem" }}>Check-in by AG No (direct) + QR</div>

          <div className="checkRow">
            <input className="input" placeholder="AG No (scan or type)" value={checkAg} onChange={(e) => setCheckAg(e.target.value)} />
            <select className="input" value={checkEvent} onChange={(e) => setCheckEvent(e.target.value)}>
              <option value="">Select Event</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.id} • {e.title}</option>)}
            </select>
            <button className="btn btnPrimary" onClick={quickCheckIn}>Check-in</button>
          </div>

          <div className="scanRow">
            {!scanning ? (
              <button className="btn btnGhost" onClick={startScan}>🎥 Start QR Scan</button>
            ) : (
              <button className="btn btnGhost" onClick={stopScan}>✕ Stop Scanner</button>
            )}
            <span className="sectionSubtitle">{scanError || checkMsg}</span>
          </div>

          {scanning && (
            <div className="cameraContainer" style={{
              marginTop: '0.75rem',
              border: scanResult ? (scanResult.success ? '4px solid #00ff88' : '4px solid #ff4d6d') : '2px solid var(--glass-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              maxWidth: '400px',
            }}>
              <div id="admin-qr-reader" style={{ width: '100%' }} />
              {scanResult && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  zIndex: 10,
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}>
                  <div style={{ fontSize: '2rem' }}>{scanResult.success ? '✅' : '❌'}</div>
                  <div>{scanResult.message}</div>
                  {scanResult.ticket && (
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.3rem' }}>
                      {scanResult.ticket.name} • {scanResult.ticket.agNo}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="adminFooter">
        <div className="sectionSubtitle">
          Page size:
          <select className="input small" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="pager">
          <button className="btn btnGhost" onClick={() => setPage(1)} disabled={safePage === 1}>First</button>
          <button className="btn btnGhost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>Prev</button>
          <div className="pill">{safePage} / {totalPages}</div>
          <button className="btn btnGhost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Next</button>
          <button className="btn btnGhost" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>Last</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>AG No</th>
                <th>Event</th>
                <th>Department</th>
                <th>Sem</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(t => (
                <tr key={t.id}>
                  <td className="mono">{t.publicTicketId}</td>
                  <td className="mono">{t.agNo}</td>
                  <td>{t.eventTitle}</td>
                  <td>{t.department}</td>
                  <td>{t.semester}</td>
                  <td>
                    <button
                      className={`statusBtn ${t.checkedIn ? "ok" : ""}`}
                      onClick={() => markCheckedIn(t.id, !t.checkedIn)}
                      title="Toggle check-in"
                    >
                      {t.checkedIn ? "Checked-in" : "Not checked"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="deleteBtn"
                      onClick={() => handleDelete(t.id, t)}
                      title="Delete ticket (allows re-registration)"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!pageRows.length && (
                <tr><td colSpan="7" style={{ padding: "1rem" }} className="sectionSubtitle">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkInByQrCode } from "../../../services/ticketService";
import "../../../assets/styles/pages/adminTickets.css";

export default function TicketsTab({
    tickets,
    events,
    refresh
}) {
    const [scannerActive, setScannerActive] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const isProcessingRef = useRef(false);

    // Filter tickets based on search
    const filteredTickets = tickets.filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            (t.publicTicketId || "").toLowerCase().includes(q) ||
            (t.id || "").toLowerCase().includes(q) ||
            (t.name || "").toLowerCase().includes(q) ||
            (t.agNo || "").toLowerCase().includes(q) ||
            (t.email || "").toLowerCase().includes(q)
        );
    });

    // Start QR Scanner
    const startScanner = async () => {
        setScanResult(null);
        setScannerActive(true);

        // Wait for DOM to be ready
        setTimeout(async () => {
            if (!document.getElementById("qr-reader")) return;

            try {
                const html5QrCode = new Html5Qrcode("qr-reader");
                html5QrCodeRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        handleScan(decodedText);
                    },
                    (errorMessage) => {
                        // Ignore scan errors (no QR in frame)
                    }
                );
            } catch (err) {
                console.error("Camera error:", err);
                setScanResult({
                    success: false,
                    message: "📷 Camera access denied or not available. Please allow camera permission.",
                    isNewCheckIn: false
                });
                setScannerActive(false);
            }
        }, 200);
    };

    // Stop QR Scanner
    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.log("Stop error:", err);
            }
            html5QrCodeRef.current = null;
        }
        setScannerActive(false);
    };

    // Play a beep sound for scan feedback
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

    // Handle QR code scan result
    const handleScan = async (qrCode) => {
        // Prevent duplicate scans while processing
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            // Check-in the ticket (NOW properly awaited!)
            const result = await checkInByQrCode(qrCode);
            setScanResult(result);

            // Audio feedback
            playBeep(result.success && result.isNewCheckIn);

            // Add to scan history
            const historyEntry = {
                id: Date.now(),
                qrCode,
                ...result,
                time: new Date().toLocaleTimeString()
            };
            setScanHistory(prev => [historyEntry, ...prev.slice(0, 19)]);

            // Refresh tickets list
            refresh();

            // Auto-clear result after 2 seconds to continue scanning
            setTimeout(() => {
                setScanResult(null);
                isProcessingRef.current = false;
            }, 2000);
        } catch (err) {
            setScanResult({
                success: false,
                message: "❌ Network error — try again",
                isNewCheckIn: false
            });
            setTimeout(() => {
                setScanResult(null);
                isProcessingRef.current = false;
            }, 2000);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(err => { });
            }
        };
    }, []);

    // Get scan result styling
    const getScanResultStyle = () => {
        if (!scanResult) return {};

        if (scanResult.success && scanResult.isNewCheckIn) {
            return {
                border: "4px solid #00ff88",
                background: "linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 200, 100, 0.1) 100%)",
                boxShadow: "0 0 40px rgba(0, 255, 136, 0.5), inset 0 0 30px rgba(0, 255, 136, 0.1)"
            };
        } else {
            return {
                border: "4px solid #ff4d6d",
                background: "linear-gradient(135deg, rgba(255, 77, 109, 0.15) 0%, rgba(220, 39, 67, 0.1) 100%)",
                boxShadow: "0 0 40px rgba(255, 77, 109, 0.5), inset 0 0 30px rgba(255, 77, 109, 0.1)"
            };
        }
    };

    // Count stats
    const checkedInCount = tickets.filter(t => t.checkedIn).length;
    const pendingCount = tickets.length - checkedInCount;

    return (
        <div className="ticketsTabContainer">
            {/* Header with Stats */}
            <div className="ticketStats">
                <div className="statBox">
                    <span className="statNumber">{tickets.length}</span>
                    <span className="statLabel">Total</span>
                </div>
                <div className="statBox success">
                    <span className="statNumber">{checkedInCount}</span>
                    <span className="statLabel">Checked In</span>
                </div>
                <div className="statBox pending">
                    <span className="statNumber">{pendingCount}</span>
                    <span className="statLabel">Pending</span>
                </div>
            </div>

            <div className="hr" />

            {/* QR Scanner Section */}
            <div className="scannerSection">
                <div className="scannerHeader">
                    <h3 className="scannerTitle">📷 QR Code Scanner</h3>
                    <div className="scannerControls">
                        {!scannerActive ? (
                            <button
                                className="btn btnPrimary scanBtn"
                                onClick={startScanner}
                            >
                                🎥 Open Camera
                            </button>
                        ) : (
                            <button
                                className="btn btnGhost scanBtn"
                                onClick={stopScanner}
                            >
                                ✕ Close Camera
                            </button>
                        )}
                    </div>
                </div>

                {/* Camera View */}
                {scannerActive && (
                    <div
                        className="cameraContainer"
                        style={getScanResultStyle()}
                    >
                        {/* Scanning Line Animation */}
                        {!scanResult && <div className="scanningLine" />}

                        {/* Corner Brackets */}
                        {!scanResult && (
                            <>
                                <div className="scannerCorners" />
                                <div className="scannerCornersBottom" />
                            </>
                        )}

                        <div
                            id="qr-reader"
                            ref={scannerRef}
                            className="qrReader"
                        />

                        {/* Scan Result Overlay */}
                        {scanResult && (
                            <div className={`scanResultOverlay ${scanResult.success ? 'success' : 'error'}`}>
                                <div className="scanResultIcon">
                                    {scanResult.success ? '✅' : '❌'}
                                </div>
                                <div className="scanResultMessage">
                                    {scanResult.message}
                                </div>
                                {scanResult.ticket && (
                                    <div className="scanResultDetails">
                                        <strong>{scanResult.ticket.name}</strong>
                                        <span>{scanResult.ticket.agNo}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions when camera not active */}
                {!scannerActive && (
                    <div className="scannerInstructions">
                        <div className="instructionIcon">📱</div>
                        <p>Click "Open Camera" to scan student QR codes for check-in</p>
                        <ul>
                            <li>🟢 <strong>Green Border</strong> = Successful Check-in</li>
                            <li>🔴 <strong>Red Border</strong> = Already Checked-in (Duplicate)</li>
                            <li>❌ <strong>Error</strong> = Invalid QR Code</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="hr" />

            {/* Scan History */}
            {scanHistory.length > 0 && (
                <>
                    <div className="sectionSubtitle" style={{ marginBottom: "0.75rem" }}>
                        🕐 Recent Scans ({scanHistory.length})
                    </div>
                    <div className="scanHistoryList">
                        {scanHistory.map(entry => (
                            <div
                                key={entry.id}
                                className={`scanHistoryItem ${entry.success ? 'success' : 'error'}`}
                            >
                                <div className="scanHistoryStatus">
                                    {entry.success ? '✅' : '❌'}
                                </div>
                                <div className="scanHistoryInfo">
                                    <span className="scanHistoryName">
                                        {entry.ticket?.name || 'Unknown'}
                                    </span>
                                    <span className="scanHistoryMeta">
                                        {entry.ticket?.agNo || 'Invalid QR'} • {entry.time}
                                    </span>
                                </div>
                                <div className="scanHistoryBadge">
                                    {entry.isNewCheckIn ? 'CHECKED IN' : entry.found ? 'DUPLICATE' : 'INVALID'}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="hr" style={{ marginTop: "1rem" }} />
                </>
            )}

            {/* Search Section */}
            <div className="searchSection">
                <div className="sectionSubtitle" style={{ marginBottom: "0.75rem" }}>
                    🔍 Search Registrations
                </div>
                <div className="searchBox">
                    <input
                        type="text"
                        className="input searchInput"
                        placeholder="Search by Ticket ID, Name, AG No, or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="clearSearchBtn"
                            onClick={() => setSearchQuery("")}
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <div className="searchResults">
                        Found <strong>{filteredTickets.length}</strong> of {tickets.length} tickets
                    </div>
                )}
            </div>

            <div className="hr" />

            {/* All Tickets List */}
            <div className="sectionSubtitle" style={{ marginBottom: "0.75rem" }}>
                🎟️ All Registrations ({filteredTickets.length})
            </div>
            <div className="ticketsList">
                {filteredTickets.map(t => {
                    const ev = events.find(e => e.id === t.eventId);
                    return (
                        <div
                            key={t.id}
                            className={`ticketCard ${t.checkedIn ? 'checkedIn' : ''}`}
                        >
                            <div className="ticketInfo">
                                <div className="ticketEventName">{ev?.title || "Event"}</div>
                                <div className="ticketStudentInfo">
                                    <strong>{t.name}</strong> • {t.agNo} • {t.email}
                                </div>
                                <div className="ticketIdDisplay">
                                    ID: <span className="mono">{t.publicTicketId || t.id}</span>
                                </div>
                            </div>
                            <div className="ticketActions">
                                <span className={`ticketStatus ${t.checkedIn ? 'checked' : 'pending'}`}>
                                    {t.checkedIn ? '✓ Checked In' : '⏳ Pending'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {filteredTickets.length === 0 && tickets.length > 0 && (
                    <div className="emptyState">
                        <span className="emptyIcon">🔍</span>
                        <p>No tickets match your search.</p>
                    </div>
                )}
                {tickets.length === 0 && (
                    <div className="emptyState">
                        <span className="emptyIcon">🎫</span>
                        <p>No tickets yet. Registrations will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

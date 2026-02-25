
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getPaymentStatus } from "../services/paymentService";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentReturn() {
    const [params] = useSearchParams();
    const nav = useNavigate();
    const orderId = params.get("orderId") || "";

    const [status, setStatus] = useState("loading"); // loading | success | failed | notfound
    const [order, setOrder] = useState(null);
    const [ticket, setTicket] = useState(null);
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        if (!orderId) {
            setStatus("notfound");
            return;
        }

        let cancelled = false;

        const fetchStatus = async () => {
            try {
                const data = await getPaymentStatus(orderId);
                if (cancelled) return;

                setOrder(data.order);
                setTicket(data.ticket);

                if (data.order?.paymentStatus === "paid") {
                    setStatus("success");
                } else if (data.order?.paymentStatus === "failed") {
                    setStatus("failed");
                } else if (pollCount < 12) {
                    // Keep polling for up to 60 seconds (every 5s)
                    setTimeout(() => {
                        if (!cancelled) setPollCount((c) => c + 1);
                    }, 5000);
                } else {
                    setStatus("failed");
                }
            } catch {
                if (!cancelled) setStatus("notfound");
            }
        };

        fetchStatus();
        return () => { cancelled = true; };
    }, [orderId, pollCount]);

    if (!orderId || status === "notfound") {
        return (
            <section className="section">
                <div className="sectionTitle">Payment Status</div>
                <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                    No payment reference found. Please try again from the Tickets page.
                </div>
                <button className="btn btnPrimary" style={{ marginTop: "1rem" }} onClick={() => nav("/tickets")}>
                    Go to Tickets
                </button>
            </section>
        );
    }

    if (status === "loading") {
        return (
            <section className="section" style={{ textAlign: "center" }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: "3rem", marginBottom: "1rem" }}
                >
                    ⏳
                </motion.div>
                <div className="sectionTitle">Verifying Payment...</div>
                <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                    Please wait while we confirm your payment with JazzCash.
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return (
            <section className="section" style={{ textAlign: "center" }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: "4rem", marginBottom: "1rem" }}
                >
                    ❌
                </motion.div>
                <div className="sectionTitle" style={{ color: "#ff6b6b" }}>Payment Failed</div>
                <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                    Your payment was not completed. No charges were applied.
                </div>
                <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", justifyContent: "center" }}>
                    <button className="btn btnPrimary" onClick={() => nav("/tickets")}>Try Again</button>
                    <button className="btn btnGhost" onClick={() => nav("/")}>Home</button>
                </div>
            </section>
        );
    }

    // Success
    return (
        <section className="section" style={{ textAlign: "center" }}>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{ fontSize: "4rem", marginBottom: "1rem" }}
            >
                ✅
            </motion.div>
            <div className="sectionTitle" style={{ color: "#4ade80" }}>Payment Successful!</div>
            <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                Your ticket has been generated. Show the QR code at the event entrance.
            </div>

            {ticket && (
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: 500, margin: "1.5rem auto", textAlign: "left" }}
                >
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {/* QR Code */}
                        <div style={{ background: "#fff", borderRadius: 12, padding: 8, flexShrink: 0 }}>
                            <QRCodeCanvas value={ticket.ticketId} size={140} includeMargin={false} />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--accent-cyan)", marginBottom: ".5rem" }}>
                                {ticket.event?.title || "Event"}
                            </div>
                            <div style={{ fontSize: ".85rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
                                <div><strong>Name:</strong> {ticket.name}</div>
                                <div><strong>Email:</strong> {ticket.email}</div>
                                {ticket.agNo && <div><strong>AG No:</strong> {ticket.agNo}</div>}
                                <div><strong>Amount:</strong> ₨ {order?.amount || "—"}</div>
                                <div><strong>Transaction:</strong> {order?.transactionId || "—"}</div>
                            </div>
                            <div style={{ marginTop: ".5rem", padding: ".4rem .8rem", background: "rgba(74,222,128,0.15)", borderRadius: 8, display: "inline-block", fontSize: ".78rem", fontWeight: 700, color: "#4ade80" }}>
                                Ticket ID: {ticket.ticketId}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", justifyContent: "center" }}>
                <button className="btn btnPrimary" onClick={() => nav("/tickets")}>My Tickets</button>
                <button className="btn btnGhost" onClick={() => nav("/")}>Home</button>
            </div>
        </section>
    );
}

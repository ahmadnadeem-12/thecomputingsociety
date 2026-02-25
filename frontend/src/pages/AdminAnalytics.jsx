
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import {
    getAnalyticsOverview,
    getEventAnalytics,
    getDailyRevenue,
    getPaidUsers,
    getExpiredOrders,
} from "../services/paymentService";
import { listEvents } from "../services/eventService";

export default function AdminAnalytics() {
    const { isAdmin } = useAuth();
    const [overview, setOverview] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [eventStats, setEventStats] = useState(null);
    const [dailyData, setDailyData] = useState([]);
    const [paidUsers, setPaidUsers] = useState([]);
    const [expiredOrders, setExpiredOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");

    // Load overview data
    useEffect(() => {
        if (!isAdmin) return;
        getAnalyticsOverview().then(setOverview).catch(() => { });
        getDailyRevenue(30).then(setDailyData).catch(() => { });
        listEvents().then((data) => {
            const paid = (data || []).filter((e) => e.ticketPrice > 0);
            setEvents(paid);
            if (paid.length > 0) setSelectedEvent(paid[0]._id || paid[0].id);
        }).catch(() => { });
        getExpiredOrders().then(setExpiredOrders).catch(() => { });
    }, [isAdmin]);

    // Load per-event data when selection changes
    useEffect(() => {
        if (!selectedEvent) return;
        getEventAnalytics(selectedEvent).then(setEventStats).catch(() => setEventStats(null));
        getPaidUsers(selectedEvent).then(setPaidUsers).catch(() => setPaidUsers([]));
    }, [selectedEvent]);

    if (!isAdmin) {
        return (
            <section className="section">
                <div className="sectionTitle">Unauthorized</div>
            </section>
        );
    }

    const statCards = overview
        ? [
            { label: "Total Revenue", value: `₨ ${(overview.totalRevenue || 0).toLocaleString()}`, icon: "💰" },
            { label: "Tickets Sold", value: overview.totalPaidTickets || 0, icon: "🎟️" },
            { label: "Tickets Used", value: overview.ticketsUsed || 0, icon: "✅" },
            { label: "Unused Tickets", value: overview.ticketsUnused || 0, icon: "⏳" },
            { label: "Paid Events", value: overview.totalPaidEvents || 0, icon: "📅" },
        ]
        : [];

    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "events", label: "Per Event" },
        { key: "daily", label: "Daily Revenue" },
        { key: "expired", label: "Expired Orders" },
    ];

    return (
        <section className="section">
            <div className="sectionHeader">
                <div>
                    <div className="sectionTitle">Payment Analytics</div>
                    <div className="sectionSubtitle">Revenue, ticket sales, and event occupancy data</div>
                </div>
                <div className="pill pillRed">💰 Revenue</div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        className={`btn ${activeTab === t.key ? "btnPrimary" : "btnGhost"}`}
                        onClick={() => setActiveTab(t.key)}
                        style={{ fontSize: ".82rem" }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {overview ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                            {statCards.map((card) => (
                                <div className="card" key={card.label} style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>{card.icon}</div>
                                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>{card.value}</div>
                                    <div style={{ fontSize: ".78rem", color: "var(--text-muted)", marginTop: ".25rem" }}>{card.label}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="sectionSubtitle">Loading analytics...</div>
                    )}

                    {/* Recent Transactions */}
                    {overview?.recentOrders?.length > 0 && (
                        <div className="card" style={{ marginTop: "1.5rem" }}>
                            <div style={{ fontWeight: 800, marginBottom: ".5rem" }}>Recent Transactions</div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                            <th style={thStyle}>Event</th>
                                            <th style={thStyle}>Amount</th>
                                            <th style={thStyle}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overview.recentOrders.map((o, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <td style={tdStyle}>{o.event}</td>
                                                <td style={tdStyle}>₨ {o.amount}</td>
                                                <td style={tdStyle}>{new Date(o.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Per Event Tab */}
            {activeTab === "events" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {events.length > 0 ? (
                        <>
                            <select
                                className="input"
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                style={{ maxWidth: 400, marginBottom: "1rem" }}
                            >
                                {events.map((ev) => (
                                    <option key={ev._id || ev.id} value={ev._id || ev.id}>
                                        {ev.title} — ₨{ev.ticketPrice}
                                    </option>
                                ))}
                            </select>

                            {eventStats && (
                                <div className="card">
                                    <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: ".75rem" }}>
                                        {eventStats.event?.title}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
                                        <StatBox label="Tickets Sold" value={eventStats.ticketsSold} />
                                        <StatBox label="Revenue" value={`₨ ${(eventStats.revenue || 0).toLocaleString()}`} />
                                        <StatBox label="Occupancy" value={`${eventStats.occupancyPercent}%`} />
                                        <StatBox label="Tickets Used" value={eventStats.ticketsUsed} />
                                        <StatBox label="Total Seats" value={eventStats.event?.totalSeats || "∞"} />
                                        <StatBox label="Price" value={`₨ ${eventStats.event?.ticketPrice || 0}`} />
                                    </div>
                                </div>
                            )}

                            {/* Paid Users List */}
                            {paidUsers.length > 0 && (
                                <div className="card" style={{ marginTop: "1rem" }}>
                                    <div style={{ fontWeight: 800, marginBottom: ".5rem" }}>Paid Users ({paidUsers.length})</div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                                            <thead>
                                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                                    <th style={thStyle}>Name</th>
                                                    <th style={thStyle}>Email</th>
                                                    <th style={thStyle}>AG No</th>
                                                    <th style={thStyle}>Dept</th>
                                                    <th style={thStyle}>Used</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paidUsers.map((u, i) => (
                                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                        <td style={tdStyle}>{u.name}</td>
                                                        <td style={tdStyle}>{u.email}</td>
                                                        <td style={tdStyle}>{u.agNo || "—"}</td>
                                                        <td style={tdStyle}>{u.department || "—"}</td>
                                                        <td style={tdStyle}>
                                                            <span style={{ color: u.isUsed ? "#4ade80" : "var(--text-muted)" }}>
                                                                {u.isUsed ? "✅ Yes" : "No"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="sectionSubtitle">No paid events found.</div>
                    )}
                </motion.div>
            )}

            {/* Daily Revenue Tab */}
            {activeTab === "daily" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {dailyData.length > 0 ? (
                        <div className="card">
                            <div style={{ fontWeight: 800, marginBottom: ".75rem" }}>Daily Revenue (Last 30 Days)</div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                            <th style={thStyle}>Date</th>
                                            <th style={thStyle}>Revenue</th>
                                            <th style={thStyle}>Tickets</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyData.map((d, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <td style={tdStyle}>{d.date}</td>
                                                <td style={tdStyle}>₨ {d.revenue.toLocaleString()}</td>
                                                <td style={tdStyle}>{d.tickets}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="sectionSubtitle">No revenue data available yet.</div>
                    )}
                </motion.div>
            )}

            {/* Expired Orders Tab */}
            {activeTab === "expired" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {expiredOrders.length > 0 ? (
                        <div className="card">
                            <div style={{ fontWeight: 800, marginBottom: ".75rem" }}>
                                Expired / Failed Orders ({expiredOrders.length})
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                            <th style={thStyle}>Event</th>
                                            <th style={thStyle}>User</th>
                                            <th style={thStyle}>Amount</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={thStyle}>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expiredOrders.map((o, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <td style={tdStyle}>{o.event}</td>
                                                <td style={tdStyle}>{o.user}</td>
                                                <td style={tdStyle}>₨ {o.amount}</td>
                                                <td style={tdStyle}>
                                                    <span style={{ color: "#ff6b6b", fontWeight: 700 }}>{o.status}</span>
                                                </td>
                                                <td style={tdStyle}>{o.reason || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="sectionSubtitle">No expired or failed orders.</div>
                    )}
                </motion.div>
            )}
        </section>
    );
}

// Helper components
function StatBox({ label, value }) {
    return (
        <div style={{ textAlign: "center", padding: ".75rem", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: ".2rem" }}>{label}</div>
        </div>
    );
}

const thStyle = { textAlign: "left", padding: ".5rem .75rem", color: "var(--text-muted)", fontWeight: 600 };
const tdStyle = { padding: ".5rem .75rem", color: "var(--text-main)" };

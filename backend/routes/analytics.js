/**
 * ============================================
 * Admin Analytics Routes
 * ============================================
 * GET /api/analytics/overview         → System-wide stats
 * GET /api/analytics/event/:eventId   → Per-event stats
 * GET /api/analytics/daily-revenue    → Daily revenue chart data
 * GET /api/analytics/paid-users/:eid  → List of paid users
 * GET /api/analytics/expired-orders   → Expired/failed orders
 * ============================================
 */

const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const PaymentOrder = require("../models/PaymentOrder");
const PaidTicket = require("../models/PaidTicket");
const { protect, adminOnly } = require("../middleware/auth");

// All analytics routes require admin
router.use(protect, adminOnly);

// =============================================
// GET /api/analytics/overview
// =============================================
router.get("/overview", async (req, res) => {
    const [totalPaidTickets, totalRevenue, totalEvents, recentOrders] = await Promise.all([
        PaidTicket.countDocuments(),
        PaymentOrder.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Event.countDocuments({ ticketPrice: { $gt: 0 } }),
        PaymentOrder.find({ paymentStatus: "paid" })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("eventId", "title")
            .lean(),
    ]);

    const ticketsUsed = await PaidTicket.countDocuments({ isUsed: true });

    res.json({
        success: true,
        data: {
            totalPaidTickets,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalPaidEvents: totalEvents,
            ticketsUsed,
            ticketsUnused: totalPaidTickets - ticketsUsed,
            recentOrders: recentOrders.map((o) => ({
                orderId: o.orderId,
                amount: o.amount,
                event: o.eventId?.title || "Unknown",
                date: o.createdAt,
            })),
        },
    });
});

// =============================================
// GET /api/analytics/event/:eventId
// =============================================
router.get("/event/:eventId", async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }

    const [ticketsSold, revenue, ticketsUsed] = await Promise.all([
        PaidTicket.countDocuments({ eventId: event._id }),
        PaymentOrder.aggregate([
            { $match: { eventId: event._id, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        PaidTicket.countDocuments({ eventId: event._id, isUsed: true }),
    ]);

    const occupancy = event.totalSeats > 0
        ? Math.round((event.soldTickets / event.totalSeats) * 100)
        : 0;

    res.json({
        success: true,
        data: {
            event: {
                title: event.title,
                date: event.date,
                ticketPrice: event.ticketPrice,
                totalSeats: event.totalSeats,
                soldTickets: event.soldTickets,
            },
            ticketsSold,
            revenue: revenue[0]?.total || 0,
            ticketsUsed,
            ticketsUnused: ticketsSold - ticketsUsed,
            occupancyPercent: occupancy,
        },
    });
});

// =============================================
// GET /api/analytics/daily-revenue
// =============================================
router.get("/daily-revenue", async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = await PaymentOrder.aggregate([
        {
            $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                revenue: { $sum: "$amount" },
                tickets: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({
        success: true,
        data: dailyData.map((d) => ({
            date: d._id,
            revenue: d.revenue,
            tickets: d.tickets,
        })),
    });
});

// =============================================
// GET /api/analytics/paid-users/:eventId
// =============================================
router.get("/paid-users/:eventId", async (req, res) => {
    const tickets = await PaidTicket.find({ eventId: req.params.eventId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        count: tickets.length,
        data: tickets.map((t) => ({
            ticketId: t.ticketId,
            name: t.name,
            email: t.email,
            agNo: t.agNo,
            department: t.department,
            semester: t.semester,
            isUsed: t.isUsed,
            purchasedAt: t.createdAt,
        })),
    });
});

// =============================================
// GET /api/analytics/expired-orders
// =============================================
router.get("/expired-orders", async (req, res) => {
    const orders = await PaymentOrder.find({
        paymentStatus: { $in: ["failed", "expired"] },
    })
        .populate("eventId", "title")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    res.json({
        success: true,
        count: orders.length,
        data: orders.map((o) => ({
            orderId: o.orderId,
            amount: o.amount,
            status: o.paymentStatus,
            event: o.eventId?.title || "Unknown",
            user: o.userId?.name || "Unknown",
            email: o.userId?.email || "",
            reason: o.jazzcashResponseMessage,
            createdAt: o.createdAt,
        })),
    });
});

module.exports = router;

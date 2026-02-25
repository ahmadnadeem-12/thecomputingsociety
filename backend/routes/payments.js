/**
 * ============================================
 * Payment Routes — JazzCash Integration
 * ============================================
 * POST /api/payments/initiate    → Start payment flow
 * POST /api/payments/webhook     → JazzCash callback (no auth)
 * GET  /api/payments/status/:id  → Check payment status
 * GET  /api/payments/return      → Frontend redirect handler
 * POST /api/payments/verify-ticket/:ticketId → Atomic ticket verification
 * ============================================
 */

const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const PaymentOrder = require("../models/PaymentOrder");
const PaidTicket = require("../models/PaidTicket");
const { protect, adminOnly } = require("../middleware/auth");
const jazzcash = require("../services/jazzcashService");

// =============================================
// POST /api/payments/initiate
// Validate seats, check duplicates, create order
// =============================================
router.post("/initiate", protect, async (req, res) => {
    const { eventId, name, email, agNo, department, semester } = req.body;

    if (!eventId || !name || !email) {
        return res.status(400).json({ success: false, message: "eventId, name, and email are required" });
    }

    // 1. Find event and validate
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.ticketPrice <= 0) {
        return res.status(400).json({ success: false, message: "This is a free event. Use the regular ticket system." });
    }

    if (event.status === "closed" || event.status === "cancelled" || event.status === "past") {
        return res.status(400).json({ success: false, message: "This event is no longer accepting registrations." });
    }

    // 2. Check seat availability
    if (event.totalSeats > 0 && event.soldTickets >= event.totalSeats) {
        return res.status(400).json({ success: false, message: "SOLD OUT — No seats remaining." });
    }

    // 3. Check if user already has a paid ticket
    const existingTicket = await PaidTicket.findOne({
        userId: req.user._id,
        eventId,
    });
    if (existingTicket) {
        return res.status(409).json({ success: false, message: "You already have a paid ticket for this event." });
    }

    // 4. Check if user has a pending payment order
    const existingOrder = await PaymentOrder.findOne({
        userId: req.user._id,
        eventId,
        paymentStatus: "pending",
    });
    if (existingOrder) {
        // Return existing order's payment data
        const paymentData = jazzcash.generatePaymentData({
            orderId: existingOrder.orderId,
            amount: existingOrder.amount,
            description: `Ticket: ${event.title}`,
            billRef: existingOrder.orderId,
        });
        return res.json({
            success: true,
            message: "Existing pending order found",
            orderId: existingOrder.orderId,
            ...paymentData,
        });
    }

    // 5. Create new payment order
    const order = await PaymentOrder.create({
        userId: req.user._id,
        eventId,
        amount: event.ticketPrice,
        name: name.trim(),
        email: email.trim(),
        agNo: (agNo || "").trim(),
        department: department || "",
        semester: semester || "",
    });

    // 6. Generate JazzCash payment form data
    const paymentData = jazzcash.generatePaymentData({
        orderId: order.orderId,
        amount: event.ticketPrice,
        description: `Ticket: ${event.title}`,
        billRef: order.orderId,
    });

    res.status(201).json({
        success: true,
        message: "Payment order created",
        orderId: order.orderId,
        ...paymentData,
    });
});

// =============================================
// POST /api/payments/webhook
// JazzCash callback — NO AUTH (JazzCash posts here)
// CRITICAL: Verify signature before trusting data
// =============================================
router.post("/webhook", async (req, res) => {
    const payload = req.body;

    console.log("💳 JazzCash Webhook received:", JSON.stringify(payload, null, 2));

    // 1. Verify HMAC signature
    if (!jazzcash.verifyWebhookSignature(payload)) {
        console.error("❌ JazzCash webhook: Invalid signature!");
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2. Extract fields
    const orderId = payload.ppmpf_1; // We stored orderId in ppmpf_1
    const responseCode = payload.pp_ResponseCode;
    const transactionId = payload.pp_TxnRefNo || "";
    const responseMessage = payload.pp_ResponseMessage || "";

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Missing order reference" });
    }

    // 3. Find the payment order
    const order = await PaymentOrder.findOne({ orderId });
    if (!order) {
        console.error(`❌ JazzCash webhook: Order not found: ${orderId}`);
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 4. If already processed, skip
    if (order.paymentStatus === "paid") {
        return res.json({ success: true, message: "Already processed" });
    }

    // 5. Check if payment was successful
    if (jazzcash.isPaymentSuccessful(responseCode)) {
        // Update order to paid
        order.paymentStatus = "paid";
        order.transactionId = transactionId;
        order.jazzcashResponseCode = responseCode;
        order.jazzcashResponseMessage = responseMessage;
        await order.save();

        // 6. Atomically increment soldTickets (race-condition safe)
        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: order.eventId,
                $or: [
                    { totalSeats: 0 }, // Unlimited seats
                    { $expr: { $lt: ["$soldTickets", "$totalSeats"] } }, // Has seats
                ],
            },
            { $inc: { soldTickets: 1 } },
            { new: true }
        );

        if (!updatedEvent) {
            // Seats ran out between payment and confirmation — refund scenario
            order.paymentStatus = "failed";
            order.jazzcashResponseMessage = "Sold out after payment — needs manual refund";
            await order.save();
            console.error(`⚠️ SOLD OUT after payment for order ${orderId} — REFUND NEEDED`);
            return res.json({ success: false, message: "Sold out — refund required" });
        }

        // 7. Generate paid ticket
        try {
            await PaidTicket.create({
                userId: order.userId,
                eventId: order.eventId,
                paymentOrderId: order._id,
                transactionId,
                name: order.name,
                email: order.email,
                agNo: order.agNo,
                department: order.department,
                semester: order.semester,
            });
            console.log(`✅ Paid ticket generated for order ${orderId}`);
        } catch (ticketErr) {
            // Duplicate ticket (user somehow paid twice)
            console.error(`⚠️ Duplicate ticket for order ${orderId}:`, ticketErr.message);
        }

        return res.json({ success: true, message: "Payment confirmed and ticket generated" });
    } else {
        // Payment failed
        order.paymentStatus = "failed";
        order.jazzcashResponseCode = responseCode;
        order.jazzcashResponseMessage = responseMessage;
        await order.save();

        return res.json({ success: true, message: "Payment failed — order updated" });
    }
});

// =============================================
// GET /api/payments/status/:orderId
// Check payment and ticket status
// =============================================
router.get("/status/:orderId", protect, async (req, res) => {
    const order = await PaymentOrder.findOne({ orderId: req.params.orderId });
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Security: only order owner or admin can check
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    let ticket = null;
    if (order.paymentStatus === "paid") {
        ticket = await PaidTicket.findOne({ paymentOrderId: order._id }).populate("eventId", "title date time venue");
    }

    res.json({
        success: true,
        order: {
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
            amount: order.amount,
            transactionId: order.transactionId,
            createdAt: order.createdAt,
        },
        ticket: ticket
            ? {
                ticketId: ticket.ticketId,
                name: ticket.name,
                email: ticket.email,
                agNo: ticket.agNo,
                event: ticket.eventId,
                isUsed: ticket.isUsed,
            }
            : null,
    });
});

// =============================================
// GET /api/payments/return
// Frontend redirect after JazzCash payment
// =============================================
router.get("/return", (req, res) => {
    // JazzCash redirects here with query params
    // Frontend will handle this route and show status
    const orderId = req.query.ppmpf_1 || req.query.orderId || "";
    const returnUrl = process.env.JAZZCASH_RETURN_URL || "http://localhost:5175/payment/return";
    res.redirect(`${returnUrl}?orderId=${orderId}`);
});

// =============================================
// POST /api/payments/verify-ticket/:ticketId
// Atomic ticket verification (mark as used)
// =============================================
router.post("/verify-ticket/:ticketId", protect, adminOnly, async (req, res) => {
    // Atomic: find ticket where isUsed = false and set to true
    const ticket = await PaidTicket.findOneAndUpdate(
        { ticketId: req.params.ticketId, isUsed: false },
        { isUsed: true, usedAt: new Date() },
        { new: true }
    ).populate("eventId", "title date time venue");

    if (!ticket) {
        // Check if ticket exists but is already used
        const existing = await PaidTicket.findOne({ ticketId: req.params.ticketId });
        if (existing && existing.isUsed) {
            return res.json({
                success: false,
                message: "⚠️ ALREADY USED — This ticket was checked in previously.",
                ticket: existing,
            });
        }
        return res.json({
            success: false,
            message: "❌ INVALID — Ticket not found.",
            ticket: null,
        });
    }

    res.json({
        success: true,
        message: "✅ VALID — Ticket verified and marked as used.",
        ticket,
    });
});

// =============================================
// GET /api/payments/my-paid-tickets
// Get current user's paid tickets
// =============================================
router.get("/my-paid-tickets", protect, async (req, res) => {
    const tickets = await PaidTicket.find({ userId: req.user._id })
        .populate("eventId", "title date time venue ticketPrice")
        .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
});

module.exports = router;

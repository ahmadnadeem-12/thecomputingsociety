const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

// @route   GET /api/tickets
// @desc    Get all tickets (admin) or user's tickets
router.get("/", protect, async (req, res) => {
    let query = {};
    // If not admin, only show user's own tickets
    if (req.user.role !== "admin") {
        query.userId = req.user._id.toString();
    }
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).populate("eventId", "title date time venue");
    res.json({ success: true, count: tickets.length, data: tickets });
});

// @route   POST /api/tickets
// @desc    Create a ticket (generate for event)
router.post("/", protect, async (req, res) => {
    const { eventId, name, agNo, email, department, semester } = req.body;

    if (!eventId || !name || !agNo || !email) {
        return res.status(400).json({ success: false, message: "eventId, name, agNo, and email are required" });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    // Check if ticket already exists for this event + AG No
    const existing = await Ticket.findOne({
        eventId,
        agNo: { $regex: new RegExp(`^${agNo.trim()}$`, "i") },
    });

    if (existing) {
        return res.status(400).json({ success: false, message: "You already generated a ticket for this event" });
    }

    // Check if event has capacity
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Only check capacity if it's set (> 0)
    if (event.capacity > 0 && event.seatsRemaining <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Sorry, this event is fully booked! No seats remaining." 
        });
    }

    // Generate public ticket ID
    const safeName = (name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const publicTicketId = `${safeName || "student"}-${agNo || "0000-AG-0000"}-${ts}-${rand}`;

    const ticket = await Ticket.create({
        publicTicketId,
        userId: req.user ? req.user._id.toString() : "",
        eventId,
        name,
        agNo: agNo.trim(),
        email: email || "",
        department: department || "",
        semester: semester || "",
    });

    // Decrement seats remaining if successful
    if (event.capacity > 0) {
        event.seatsRemaining = Math.max(0, event.seatsRemaining - 1);
        await event.save();
    }

    res.status(201).json({ success: true, data: ticket });
});

// @route   PUT /api/tickets/:id/checkin
// @desc    Toggle check-in status
router.put("/:id/checkin", protect, adminOnly, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    ticket.checkedIn = req.body.checkedIn !== undefined ? req.body.checkedIn : !ticket.checkedIn;
    await ticket.save();

    res.json({ success: true, data: ticket });
});

// @route   POST /api/tickets/qr-checkin
// @desc    Check-in by QR code scan
router.post("/qr-checkin", protect, adminOnly, async (req, res) => {
    const { qrCode } = req.body;
    const rawCode = (qrCode || "").trim();

    let ticketId = null;
    let publicTicketId = null;

    // Try to parse as JSON (QR codes contain JSON data)
    try {
        const parsed = JSON.parse(rawCode);
        ticketId = parsed.ticketId || null;
        publicTicketId = parsed.publicTicketId || null;
    } catch (e) {
        publicTicketId = rawCode;
        ticketId = rawCode;
    }

    // Find ticket
    let ticket = null;

    if (ticketId) {
        ticket = await Ticket.findById(ticketId).catch(() => null);
    }

    if (!ticket && publicTicketId) {
        ticket = await Ticket.findOne({ publicTicketId });
    }

    if (!ticket) {
        ticket = await Ticket.findById(rawCode).catch(() => null);
        if (!ticket) {
            ticket = await Ticket.findOne({ publicTicketId: rawCode });
        }
    }

    if (!ticket) {
        return res.json({
            success: false,
            message: "❌ Invalid QR Code - Ticket not found!",
            ticket: null,
            isNewCheckIn: false,
        });
    }

    if (ticket.checkedIn) {
        return res.json({
            success: false,
            message: "⚠️ DUPLICATE ENTRY - Already Checked In!",
            ticket,
            isNewCheckIn: false,
        });
    }

    // Mark checked in
    ticket.checkedIn = true;
    await ticket.save();

    res.json({
        success: true,
        message: "✅ CHECK-IN SUCCESSFUL!",
        ticket,
        isNewCheckIn: true,
    });
});

// @route   DELETE /api/tickets/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Increment seats remaining
    const event = await Event.findById(ticket.eventId);
    if (event && event.capacity > 0) {
        event.seatsRemaining = Math.min(event.capacity, event.seatsRemaining + 1);
        await event.save();
    }

    res.json({ success: true, message: "Ticket deleted" });
});

// @route   DELETE /api/tickets/by-ag/:agNo/:eventId
// @desc    Delete ticket by AG No and Event ID
router.delete("/by-ag/:agNo/:eventId", protect, adminOnly, async (req, res) => {
    const ticket = await Ticket.findOneAndDelete({
        agNo: { $regex: new RegExp(`^${req.params.agNo.trim()}$`, "i") },
        eventId: req.params.eventId,
    });

    if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found for this AG No and Event" });
    }

    // Increment seats remaining
    const event = await Event.findById(req.params.eventId);
    if (event && event.capacity > 0) {
        event.seatsRemaining = Math.min(event.capacity, event.seatsRemaining + 1);
        await event.save();
    }

    res.json({ success: true, message: "Ticket deleted" });
});

module.exports = router;

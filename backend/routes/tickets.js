const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const Program = require("../models/Program");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

// @route   GET /api/tickets
// @desc    Get all tickets (admin) or user's tickets
router.get("/", protect, async (req, res) => {
    let query = {};
    // If not admin, only show user's own tickets
    if (req.user.role !== "admin") {
        query.userId = req.user._id.toString();
    }
    const tickets = await Ticket.find(query)
        .sort({ createdAt: -1 })
        .populate("eventId", "title date time venue")
        .populate("programId", "title startDate duration instructor status");
    res.json({ success: true, count: tickets.length, data: tickets });
});

// @route   POST /api/tickets
// @desc    Create a ticket (generate for event or program)
router.post("/", protect, async (req, res) => {
    const { eventId, programId, name, agNo, email, department, semester } = req.body;

    if ((!eventId && !programId) || !name || !agNo || !email) {
        return res.status(400).json({ success: false, message: "eventId or programId, name, agNo, and email are required" });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    // Check if ticket already exists for this event/program + AG No
    const query = {
        agNo: { $regex: new RegExp(`^${agNo.trim()}$`, "i") },
    };
    if (eventId) query.eventId = eventId;
    if (programId) query.programId = programId;

    const existing = await Ticket.findOne(query);

    if (existing) {
        return res.status(400).json({ success: false, message: `You already generated a ticket for this ${eventId ? "event" : "program"}` });
    }

    let target = null;
    if (eventId) {
        target = await Event.findById(eventId);
        if (!target) return res.status(404).json({ success: false, message: "Event not found" });
    } else if (programId) {
        target = await Program.findById(programId);
        if (!target) return res.status(404).json({ success: false, message: "Program not found" });
        if (target.status === "upcoming") {
            return res.status(400).json({ success: false, message: "Registration is not open yet for this program" });
        }
    }

    // Only check capacity if it's set (> 0)
    if (target.capacity > 0 && target.seatsRemaining <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: `Sorry, this ${eventId ? "event" : "program"} is fully booked! No seats remaining.` 
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
        eventId: eventId || undefined,
        programId: programId || undefined,
        name,
        agNo: agNo.trim(),
        email: email || "",
        department: department || "",
        semester: semester || "",
    });

    // Decrement seats remaining and increment participants
    if (target.capacity > 0) {
        target.seatsRemaining = Math.max(0, target.seatsRemaining - 1);
    }
    if (programId) {
        target.participants = (target.participants || 0) + 1;
    }
    await target.save();

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
    try {
        const { qrCode } = req.body;
        const rawCode = (qrCode || "").trim();

        if (!rawCode) {
            return res.json({ success: false, message: "Empty QR code" });
        }

        let ticketId = null;
        let publicTicketId = null;

        // 1. Try direct ID lookup if it's a 24-char hex string
        let ticket = null;
        if (/^[0-9a-fA-F]{24}$/.test(rawCode)) {
            ticket = await Ticket.findById(rawCode).catch(() => null);
        }

        // 2. If not found, try lookup by publicTicketId
        if (!ticket) {
            ticket = await Ticket.findOne({ publicTicketId: rawCode });
        }

        // 3. Fallback: Try parsing as JSON (for complex QR payloads)
        if (!ticket && (rawCode.startsWith("{") || rawCode.startsWith("["))) {
            try {
                const parsed = JSON.parse(rawCode);
                const tId = parsed.ticketId || parsed.id || parsed._id;
                if (tId && /^[0-9a-fA-F]{24}$/.test(tId)) {
                    ticket = await Ticket.findById(tId).catch(() => null);
                }
                if (!ticket && parsed.publicTicketId) {
                    ticket = await Ticket.findOne({ publicTicketId: parsed.publicTicketId });
                }
            } catch (e) { /* ignore parse error */ }
        }

        if (!ticket) {
            return res.json({
                success: false,
                message: "❌ Ticket not found in database!",
                ticket: null,
            });
        }

        if (ticket.checkedIn) {
            return res.json({
                success: false,
                message: "⚠️ Already Checked In!",
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
    } catch (error) {
        console.error("QR Check-in Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "❌ Internal Server Error during check-in" 
        });
    }
});



// @route   DELETE /api/tickets/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Increment seats remaining
    if (ticket.eventId) {
        const event = await Event.findById(ticket.eventId);
        if (event && event.capacity > 0) {
            event.seatsRemaining = Math.min(event.capacity, event.seatsRemaining + 1);
            await event.save();
        }
    } else if (ticket.programId) {
        const program = await Program.findById(ticket.programId);
        if (program) {
            if (program.capacity > 0) {
                program.seatsRemaining = Math.min(program.capacity, program.seatsRemaining + 1);
            }
            program.participants = Math.max(0, (program.participants || 0) - 1);
            await program.save();
        }
    }

    res.json({ success: true, message: "Ticket deleted" });
});

// @route   DELETE /api/tickets/by-ag/:agNo/:targetId
// @desc    Delete ticket by AG No and Event/Program ID
router.delete("/by-ag/:agNo/:targetId", protect, adminOnly, async (req, res) => {
    const { agNo, targetId } = req.params;
    
    const ticket = await Ticket.findOneAndDelete({
        agNo: { $regex: new RegExp(`^${agNo.trim()}$`, "i") },
        $or: [{ eventId: targetId }, { programId: targetId }],
    });

    if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found for this AG No and target ID" });
    }

    // Increment seats remaining
    if (ticket.eventId) {
        const event = await Event.findById(ticket.eventId);
        if (event && event.capacity > 0) {
            event.seatsRemaining = Math.min(event.capacity, event.seatsRemaining + 1);
            await event.save();
        }
    } else if (ticket.programId) {
        const program = await Program.findById(ticket.programId);
        if (program) {
            if (program.capacity > 0) {
                program.seatsRemaining = Math.min(program.capacity, program.seatsRemaining + 1);
            }
            program.participants = Math.max(0, (program.participants || 0) - 1);
            await program.save();
        }
    }

    res.json({ success: true, message: "Ticket deleted" });
});

module.exports = router;

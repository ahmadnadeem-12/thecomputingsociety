const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get("/", async (req, res) => {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get("/:id", async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: event });
});

// @route   POST /api/events
// @desc    Create event
// @access  Admin
router.post("/", protect, adminOnly, async (req, res) => {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: event });
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, message: "Event deleted" });
});

module.exports = router;

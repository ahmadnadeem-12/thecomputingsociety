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

// @route   GET /api/events/spotlight
// @desc    Get only events for advertisement (with posters)
// @access  Public
router.get("/spotlight", async (req, res) => {
    const events = await Event.find({ advertise: true, adPoster: { $ne: "" } })
        .select("title adPoster advertise")
        .sort({ date: 1 });
    res.json({ success: true, data: events });
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
    const data = { ...req.body };
    // If capacity is set, initialize seatsRemaining
    if (data.capacity && data.capacity > 0) {
        data.seatsRemaining = data.capacity;
    }
    
    // Single Hero enforcement
    if (data.isHero) {
        await Event.updateMany({}, { isHero: false });
    }

    const event = await Event.create(data);
    res.status(201).json({ success: true, data: event });
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
    const oldEvent = await Event.findById(req.params.id);
    if (!oldEvent) {
        return res.status(404).json({ success: false, message: "Event not found" });
    }

    const data = { ...req.body };

    // If capacity is being updated, adjust seatsRemaining logically
    if (data.capacity !== undefined && data.capacity !== oldEvent.capacity) {
        const diff = data.capacity - oldEvent.capacity;
        data.seatsRemaining = Math.max(0, (oldEvent.seatsRemaining || 0) + diff);
    }

    // Single Hero enforcement
    if (data.isHero) {
        await Event.updateMany({ _id: { $ne: req.params.id } }, { isHero: false });
    }

    const event = await Event.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
    });
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

const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const { protect, adminOnly } = require("../middleware/auth");

// Default announcements for reset
const DEFAULT_ANNOUNCEMENTS = [
    {
        title: "Midterm Exam Schedule Released",
        body: "The midterm examination schedule for Fall 2024 has been released. Please check your student portal for detailed date and time slots. Make sure to prepare accordingly.",
        date: "2024-12-28",
        priority: "important",
        tags: ["Academic", "Exams"],
        link: "",
        linkText: "",
    },
    {
        title: "Tech & Entrepreneurship Summit 4.0",
        body: "Join us for the biggest tech event of the year! Register now to secure your spot. Limited seats available. The summit will feature industry leaders, workshops, and networking sessions.",
        date: "2024-12-25",
        priority: "urgent",
        tags: ["Event", "Summit"],
        link: "/events",
        linkText: "Register Now",
    },
    {
        title: "New Library Resources Available",
        body: "The department library has acquired new books and digital resources. Visit the library to explore the latest additions to our collection.",
        date: "2024-12-20",
        priority: "normal",
        tags: ["Library", "Resources"],
        link: "",
        linkText: "",
    },
];

// @route   GET /api/announcements
router.get("/", async (req, res) => {
    const items = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
});

// @route   GET /api/announcements/:id
router.get("/:id", async (req, res) => {
    const item = await Announcement.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
    res.json({ success: true, data: item });
});

// @route   POST /api/announcements
router.post("/", protect, adminOnly, async (req, res) => {
    const item = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: item });
});

// @route   PUT /api/announcements/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
    res.json({ success: true, data: item });
});

// @route   DELETE /api/announcements/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
    res.json({ success: true, message: "Announcement deleted" });
});

// @route   POST /api/announcements/reset
router.post("/reset", protect, adminOnly, async (req, res) => {
    await Announcement.deleteMany({});
    const items = await Announcement.insertMany(DEFAULT_ANNOUNCEMENTS);
    res.json({ success: true, count: items.length, data: items });
});

module.exports = router;

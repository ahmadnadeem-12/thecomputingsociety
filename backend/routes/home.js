const express = require("express");
const router = express.Router();
const HomeContent = require("../models/HomeContent");
const { protect, adminOnly } = require("../middleware/auth");

// Default home content
const DEFAULT_HOME = {
    heroTitle: { line1: "THE", line2: "COMPUTING", line3: "SOCIETY" },
    heroBadge: "Official Society • Dept. of Computer Science • UAF",
    heroDescription: "Connecting students, faculty, and industry through workshops, competitions, talks, hackathons, and social nights. Building the next generation of tech leaders at UAF.",
    stats: [
        { number: "25+", label: "Events / Year" },
        { number: "600+", label: "Active Members" },
        { number: "10+", label: "Faculty Mentors" },
    ],
    notices: [
        { title: "Latest Announcement", meta: "Midterm schedule uploaded • PDF", icon: "📢", gradient: "linear-gradient(135deg, #dc2743, #c234a5)" },
        { title: "Upcoming Event", meta: "Tech & Entrepreneurship Summit 4.0", icon: "🎤", gradient: "linear-gradient(135deg, #9b59b6, #00d9ff)" },
        { title: "Tickets Open", meta: "Generate QR ticket in seconds", icon: "🎟️", gradient: "linear-gradient(135deg, #00d9ff, #00ff88)" },
    ],
    features: [
        { icon: "🚀", title: "Workshops", desc: "Hands-on learning sessions" },
        { icon: "🏆", title: "Competitions", desc: "Showcase your skills" },
        { icon: "💡", title: "Hackathons", desc: "48-hour innovation sprints" },
        { icon: "🎯", title: "Bootcamps", desc: "Intensive skill training" },
    ],
    quickLinks: [
        { label: "Meet the Cabinet", path: "/cabinet", icon: "👥" },
        { label: "Our Faculty", path: "/faculty", icon: "👨‍🏫" },
        { label: "Gallery", path: "/gallery", icon: "📸" },
        { label: "Admin Portal", path: "/admin/login", icon: "🔐" },
    ],
};

// @route   GET /api/home
// @desc    Get home page content (returns single doc, creates default if not found)
router.get("/", async (req, res) => {
    let content = await HomeContent.findOne();
    if (!content) {
        content = await HomeContent.create(DEFAULT_HOME);
    }
    console.log("DEBUG: Sending home content, stats count:", content.stats?.length || 0);
    res.json({ success: true, data: content });
});

// @route   PUT /api/home
// @desc    Update home page content
router.put("/", protect, adminOnly, async (req, res) => {
    let content = await HomeContent.findOne();
    if (!content) {
        content = await HomeContent.create(req.body);
    } else {
        Object.assign(content, req.body);
        await content.save();
    }
    res.json({ success: true, data: content });
});

// @route   POST /api/home/reset
// @desc    Reset to defaults
router.post("/reset", protect, adminOnly, async (req, res) => {
    await HomeContent.deleteMany({});
    const content = await HomeContent.create(DEFAULT_HOME);
    res.json({ success: true, data: content });
});

module.exports = router;

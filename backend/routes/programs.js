const express = require("express");
const router = express.Router();
const Program = require("../models/Program");
const { protect, adminOnly } = require("../middleware/auth");

// Default programs for reset
const DEFAULT_PROGRAMS = [
    {
        title: "Web Development Bootcamp",
        type: "bootcamp",
        description: "Intensive 6-week bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build real-world projects and get job-ready skills.",
        icon: "💻",
        duration: "6 Weeks",
        participants: 50,
        status: "upcoming",
        startDate: "2025-01-15",
        instructor: "Dr. Ahmed Khan",
        tags: ["Web", "Frontend", "Backend"],
    },
    {
        title: "AI & Machine Learning Workshop",
        type: "workshop",
        description: "Learn the fundamentals of AI and ML with hands-on Python exercises. Covers supervised learning, neural networks, and real applications.",
        icon: "🤖",
        duration: "3 Days",
        participants: 40,
        status: "open",
        startDate: "2025-01-20",
        instructor: "Prof. Sarah Ali",
        tags: ["AI", "ML", "Python"],
    },
    {
        title: "Competitive Programming Contest",
        type: "competition",
        description: "Test your algorithmic skills in our annual coding competition. Win prizes and recognition!",
        icon: "🏆",
        duration: "8 Hours",
        participants: 100,
        status: "open",
        startDate: "2025-02-01",
        instructor: "ACM Chapter",
        tags: ["Algorithms", "DSA", "Contest"],
    },
    {
        title: "Industry Expert Talk Series",
        type: "talk",
        description: "Monthly sessions with industry professionals sharing insights on tech careers, trends, and best practices.",
        icon: "🎤",
        duration: "2 Hours",
        participants: 200,
        status: "ongoing",
        startDate: "2025-01-10",
        instructor: "Various Speakers",
        tags: ["Career", "Industry", "Networking"],
    },
];

// @route   GET /api/programs
router.get("/", async (req, res) => {
    const items = await Program.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
});

// @route   GET /api/programs/:id
router.get("/:id", async (req, res) => {
    const item = await Program.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Program not found" });
    res.json({ success: true, data: item });
});

// @route   POST /api/programs
router.post("/", protect, adminOnly, async (req, res) => {
    const item = await Program.create(req.body);
    res.status(201).json({ success: true, data: item });
});

// @route   PUT /api/programs/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
    const item = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Program not found" });
    res.json({ success: true, data: item });
});

// @route   DELETE /api/programs/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const item = await Program.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Program not found" });
    res.json({ success: true, message: "Program deleted" });
});

// @route   POST /api/programs/reset
router.post("/reset", protect, adminOnly, async (req, res) => {
    await Program.deleteMany({});
    const items = await Program.insertMany(DEFAULT_PROGRAMS);
    res.json({ success: true, count: items.length, data: items });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Degree = require("../models/Degree");
const { protect, adminOnly } = require("../middleware/auth");

// Default degrees for reset
const DEFAULT_DEGREES = [
    { code: "BS CS", name: "Computer Science", fullName: "Bachelor of Science in Computer Science", duration: "4 Years", semesters: 8, description: "A comprehensive program covering programming, algorithms, databases, AI, software engineering, and computer systems.", icon: "💻", courses: ["Programming Fundamentals", "Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Computer Networks", "AI & ML", "Software Engineering"], pdfUrl: "" },
    { code: "BS SE", name: "Software Engineering", fullName: "Bachelor of Science in Software Engineering", duration: "4 Years", semesters: 8, description: "Focused on software development lifecycle, project management, quality assurance, and modern development practices.", icon: "⚙️", courses: ["Software Design", "Requirements Engineering", "Project Management", "Testing & QA", "DevOps", "Agile Methods"], pdfUrl: "" },
    { code: "BS IT", name: "Information Technology", fullName: "Bachelor of Science in Information Technology", duration: "4 Years", semesters: 8, description: "Covers IT infrastructure, networking, system administration, cybersecurity, and enterprise solutions.", icon: "🌐", courses: ["Network Administration", "Cybersecurity", "Cloud Computing", "IT Management", "Web Technologies"], pdfUrl: "" },
    { code: "BS AI", name: "Artificial Intelligence", fullName: "Bachelor of Science in Artificial Intelligence", duration: "4 Years", semesters: 8, description: "Specialized in machine learning, deep learning, NLP, computer vision, and intelligent systems development.", icon: "🤖", courses: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Robotics", "Neural Networks"], pdfUrl: "" },
    { code: "BS DS", name: "Data Science", fullName: "Bachelor of Science in Data Science", duration: "4 Years", semesters: 8, description: "Combines statistics, programming, and domain expertise to extract insights from data using modern tools.", icon: "📊", courses: ["Statistics", "Data Mining", "Big Data", "Data Visualization", "Python for DS", "R Programming"], pdfUrl: "" },
    { code: "BS BI", name: "Business Informatics", fullName: "Bachelor of Science in Business Informatics", duration: "4 Years", semesters: 8, description: "Bridges technology and business, covering ERP systems, business analytics, and IT consulting.", icon: "📈", courses: ["Business Analytics", "ERP Systems", "IT Consulting", "E-Commerce", "Management Information Systems"], pdfUrl: "" },
];

// @route   GET /api/degrees
router.get("/", async (req, res) => {
    const items = await Degree.find().sort({ createdAt: 1 });
    res.json({ success: true, count: items.length, data: items });
});

// @route   GET /api/degrees/:id
router.get("/:id", async (req, res) => {
    const item = await Degree.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Degree not found" });
    res.json({ success: true, data: item });
});

// @route   POST /api/degrees
router.post("/", protect, adminOnly, async (req, res) => {
    const item = await Degree.create(req.body);
    res.status(201).json({ success: true, data: item });
});

// @route   PUT /api/degrees/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
    const item = await Degree.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Degree not found" });
    res.json({ success: true, data: item });
});

// @route   DELETE /api/degrees/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const item = await Degree.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Degree not found" });
    res.json({ success: true, message: "Degree deleted" });
});

// @route   POST /api/degrees/reset
router.post("/reset", protect, adminOnly, async (req, res) => {
    await Degree.deleteMany({});
    const items = await Degree.insertMany(DEFAULT_DEGREES);
    res.json({ success: true, count: items.length, data: items });
});

module.exports = router;

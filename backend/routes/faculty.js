const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /api/faculty
router.get("/", async (req, res) => {
    const items = await Faculty.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: items.length, data: items });
});

// @route   POST /api/faculty
router.post("/", protect, adminOnly, async (req, res) => {
    const count = await Faculty.countDocuments();
    req.body.order = count;
    const item = await Faculty.create(req.body);
    res.status(201).json({ success: true, data: item });
});

// @route   PUT /api/faculty/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
    const item = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found" });
    res.json({ success: true, data: item });
});

// @route   DELETE /api/faculty/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const item = await Faculty.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Faculty member not found" });
    res.json({ success: true, message: "Faculty member deleted" });
});

// @route   PUT /api/faculty/reorder
router.put("/reorder", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: "ids array is required" });
    }

    const bulkOps = ids.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { order: index },
        },
    }));

    await Faculty.bulkWrite(bulkOps);
    const items = await Faculty.find().sort({ order: 1 });
    res.json({ success: true, data: items });
});

module.exports = router;

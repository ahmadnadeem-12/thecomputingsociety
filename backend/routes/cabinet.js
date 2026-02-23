const express = require("express");
const router = express.Router();
const Cabinet = require("../models/Cabinet");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /api/cabinet
router.get("/", async (req, res) => {
    const items = await Cabinet.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: items.length, data: items });
});

// @route   POST /api/cabinet
router.post("/", protect, adminOnly, async (req, res) => {
    // Auto-set order to last
    const count = await Cabinet.countDocuments();
    req.body.order = count;
    const item = await Cabinet.create(req.body);
    res.status(201).json({ success: true, data: item });
});

// @route   PUT /api/cabinet/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
    const item = await Cabinet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Cabinet member not found" });
    res.json({ success: true, data: item });
});

// @route   DELETE /api/cabinet/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const item = await Cabinet.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Cabinet member not found" });
    res.json({ success: true, message: "Cabinet member deleted" });
});

// @route   PUT /api/cabinet/reorder
// @desc    Reorder cabinet members
router.put("/reorder", protect, adminOnly, async (req, res) => {
    const { ids } = req.body; // Array of IDs in new order
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: "ids array is required" });
    }

    const bulkOps = ids.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { order: index },
        },
    }));

    await Cabinet.bulkWrite(bulkOps);
    const items = await Cabinet.find().sort({ order: 1 });
    res.json({ success: true, data: items });
});

module.exports = router;

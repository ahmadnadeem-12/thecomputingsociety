const express = require("express");
const router = express.Router();
const Theme = require("../models/Theme");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /api/theme
// @desc    Get the current active theme
router.get("/", async (req, res) => {
    try {
        const theme = await Theme.findOne({ name: "default" });
        if (!theme) {
            return res.json({ success: true, data: {} });
        }
        res.json({ success: true, data: theme.colors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/theme
// @desc    Update or create the active theme
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { colors } = req.body;
        
        let theme = await Theme.findOne({ name: "default" });
        if (theme) {
            theme.colors = colors;
            await theme.save();
        } else {
            theme = await Theme.create({ name: "default", colors });
        }
        
        res.json({ success: true, data: theme.colors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/theme
// @desc    Reset theme to factory defaults (deletes DB record)
router.delete("/", protect, adminOnly, async (req, res) => {
    try {
        await Theme.findOneAndDelete({ name: "default" });
        res.json({ success: true, message: "Theme reset to defaults" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

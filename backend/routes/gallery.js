const express = require("express");
const router = express.Router();
const Gallery = require("../models/Gallery");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /api/gallery
router.get("/", async (req, res) => {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
});

// @route   GET /api/gallery/:id
router.get("/:id", async (req, res) => {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found" });
    res.json({ success: true, data: item });
});

// @route   POST /api/gallery
router.post("/", protect, adminOnly, async (req, res) => {
    const item = await Gallery.create({
        title: req.body.title || "New Album",
        images: req.body.images || [],
    });
    res.status(201).json({ success: true, data: item });
});

// @route   PUT /api/gallery/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Album not found" });
    res.json({ success: true, data: item });
});

// @route   DELETE /api/gallery/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Album not found" });
    res.json({ success: true, message: "Album deleted" });
});

// @route   POST /api/gallery/:id/images
// @desc    Add image(s) to album
router.post("/:id/images", protect, adminOnly, async (req, res) => {
    const album = await Gallery.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: "Album not found" });

    const { imageUrl, imageUrls } = req.body;
    if (imageUrl) album.images.push(imageUrl);
    if (imageUrls && Array.isArray(imageUrls)) album.images.push(...imageUrls);

    await album.save();
    res.json({ success: true, data: album });
});

// @route   DELETE /api/gallery/:id/images
// @desc    Remove image from album
router.delete("/:id/images", protect, adminOnly, async (req, res) => {
    const album = await Gallery.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: "Album not found" });

    const { imageUrl } = req.body;
    album.images = album.images.filter((img) => img !== imageUrl);
    await album.save();

    res.json({ success: true, data: album });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create user
    const user = await User.create({ name, email, password });
    const token = user.getSignedJwtToken();

    res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
    });
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = user.getSignedJwtToken();

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
    });
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get("/me", protect, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt,
        },
    });
});

// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal, server acknowledges)
// @access  Public
router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Don't reveal if email exists (security)
        return res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    // Build reset URL (frontend URL)
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
        const { sendResetEmail } = require("../services/emailService");
        await sendResetEmail(user.email, resetUrl, user.name);

        res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    } catch (error) {
        console.error("Email send error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send reset email. Please try again later." });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure this is a reset token
        if (decoded.purpose !== "reset") {
            return res.status(400).json({ success: false, message: "Invalid reset token" });
        }

        const user = await User.findById(decoded.id).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password has been reset successfully. You can now login." });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ success: false, message: "Reset link has expired. Please request a new one." });
        }
        return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }
});

module.exports = router;

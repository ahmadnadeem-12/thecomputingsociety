const express = require("express");
const router = express.Router();
const crypto = require("crypto");
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

// ============================================
// FORGOT PASSWORD — Send reset link via email
// ============================================
// @route   POST /api/auth/forgot-password
// @desc    Generate crypto reset token, save to DB, send email
// @access  Public
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Don't reveal if email exists or not (security best practice)
        return res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    }

    // Generate crypto reset token (returns raw unhashed token)
    const resetToken = user.getResetPasswordToken();

    // Save the hashed token + expiry to database
    await user.save({ validateBeforeSave: false });

    // Build reset URL (frontend URL)
    const frontendUrl = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",")[0];
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
        const { sendResetEmail } = require("../services/emailService");
        await sendResetEmail(user.email, resetUrl, user.name);

        res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    } catch (error) {
        // If email fails, clear the token from DB so user can try again
        user.clearResetToken();
        await user.save({ validateBeforeSave: false });

        console.error("Email send error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send reset email. Please try again later." });
    }
});

// ============================================
// RESET PASSWORD — Validate token & update password
// ============================================
// @route   POST /api/auth/reset-password
// @desc    Validate crypto token from DB, hash new password, update user
// @access  Public
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Hash the incoming token to compare with DB (we stored hashed version)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by hashed token AND ensure token hasn't expired
    const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpire: { $gt: Date.now() }, // Token expiry must be in the future
    }).select("+password");

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired reset token. Please request a new link." });
    }

    // Update password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;

    // Clear reset token fields from database
    user.clearResetToken();

    // Save user (triggers password hashing)
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully. You can now login with your new password." });
});

module.exports = router;

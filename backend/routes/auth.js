const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const { logAction } = require("../utils/auditLogger");
const { sendEmail } = require("../services/emailService");
const Ticket = require("../models/Ticket");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
    const { name, email, agNo, password, department, semester } = req.body;

    // Validate
    if (!name || !email || !agNo || !password || !department || !semester) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Delete any existing unverified accounts with same email or AG Number so they can register again
    await User.deleteMany({
        $or: [
            { email: email.toLowerCase() },
            { agNo: agNo.toUpperCase() }
        ],
        isVerified: false
    });

    // Check if user exists by email (verified accounts only now)
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Check if user exists by agNo (verified accounts only now)
    const existingAgNo = await User.findOne({ agNo: agNo.toUpperCase() });
    if (existingAgNo) {
        return res.status(400).json({ success: false, message: "AG Number already registered" });
    }

    // Create user
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({ 
        name, 
        email, 
        agNo: agNo.toUpperCase(), 
        password,
        department,
        semester,
        verificationToken,
        verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send Verification Email
    let backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    if (backendUrl.includes("localhost") && !req.get("host").includes("localhost") && !req.get("host").includes("127.0.0.1")) {
        backendUrl = `${req.protocol}://${req.get("host")}`;
    }
    const verifyUrl = `${backendUrl}/api/auth/verify/${verificationToken}`;
    
    console.log("\n============================================");
    console.log("🚀 VERIFICATION URL GENERATED:");
    console.log(`🔗 Link: ${verifyUrl}`);
    console.log("============================================\n");
    
    const message = `Welcome to The Computing Society! Please verify your email address to complete your registration and start generating tickets.`;
    const html = `
        <div style="font-size: 15px; color: #9a8fa6; line-height: 1.7; margin-bottom: 25px;">
            ${message}
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #9a8fa6; margin-bottom: 20px;">Click the button below to verify your account:</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2743, #c234a5); color: #fff; text-decoration: none; border-radius: 50px; font-weight: 700;">Verify My Account</a>
            <p style="font-size: 11px; color: #6b5f78; margin-top: 20px;">Link expires in 24 hours.</p>
        </div>
    `;

    // Send email asynchronously in the background so registration finishes instantly on the client
    sendEmail({
        email: user.email,
        subject: "Verify Your Email - The Computing Society",
        message,
        html
    }).catch(err => {
        console.log("Verification email could not be sent in background:", err.message);
    });
    const token = user.getSignedJwtToken();

    res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            agNo: user.agNo,
            role: user.role,
            isVerified: user.isVerified,
            department: user.department,
            semester: user.semester,
            createdAt: user.createdAt,
        },
    });
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Email/AG No and password are required" });
    }

    const input = identifier.trim().toLowerCase();

    // Find user by either email OR agNo (case insensitive)
    const user = await User.findOne({
        $or: [
            { email: input },
            { agNo: identifier.trim().toUpperCase() }
        ]
    }).select("+password");

    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        return res.status(423).json({ 
            success: false, 
            message: `Account is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.` 
        });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
        // Increment login attempts
        user.loginAttempts += 1;
        
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
            user.loginAttempts = 0; // Reset after locking
            await user.save();
            return res.status(423).json({ success: false, message: "Too many failed attempts. Account locked for 15 minutes." });
        }
        
        await user.save();
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Reset attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            agNo: user.agNo,
            role: user.role,
            isVerified: user.isVerified,
            department: user.department,
            semester: user.semester,
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
            agNo: req.user.agNo,
            role: req.user.role,
            isVerified: req.user.isVerified,
            department: req.user.department,
            semester: req.user.semester,
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
        return res.status(404).json({ success: false, message: "No account found with that email address." });
    }

    // Generate crypto reset token (returns raw unhashed token)
    const resetToken = user.getResetPasswordToken();

    // Save the hashed token + expiry to database
    await user.save({ validateBeforeSave: false });

    // Build reset URL (frontend URL)
    let frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    if (frontendUrl.includes("localhost") && !req.get("host").includes("localhost") && !req.get("host").includes("127.0.0.1")) {
        const hostIp = req.get("host").split(":")[0];
        frontendUrl = `http://${hostIp}:5173`;
    }
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

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
    }).select("+password +resetToken +resetTokenExpire");

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

// ============================================
// ADMIN ONLY — User Management
// ============================================

// @route   GET /api/auth/all-users
// @desc    Get all registered users (admin only)
router.get("/all-users", protect, adminOnly, async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user and all their tickets (admin only)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
        return res.status(400).json({ success: false, message: "Cannot delete admin accounts" });
    }

    // Cascade delete: Remove all tickets associated with this user
    await require("../models/Ticket").deleteMany({ agNo: user.agNo });
    
    const details = `Deleted user: ${user.name} (${user.agNo})`;
    await logAction(req, "DELETE_USER", "User", user._id, details);

    await user.deleteOne();

    res.json({ success: true, message: "User and all associated data deleted successfully" });
});

// @route   POST /api/auth/users/bulk-delete
// @desc    Delete multiple users and their tickets (admin only)
router.post("/users/bulk-delete", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: "IDs array is required" });
    }

    try {
        // Find users to get their AG Numbers for cascading ticket deletion
        const users = await User.find({ _id: { $in: ids }, role: { $ne: "admin" } });
        const agNos = users.map(u => u.agNo);
        const actualIds = users.map(u => u._id);

        // Delete associated tickets
        await require("../models/Ticket").deleteMany({ agNo: { $in: agNos } });
        
        // Delete the users
        await User.deleteMany({ _id: { $in: actualIds } });

        await logAction(req, "BULK_DELETE_USERS", "User", "Multiple", `Deleted ${actualIds.length} users`);

        res.json({ success: true, message: `${actualIds.length} users and their data deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error during bulk deletion" });
    }
});

// @route   GET /api/auth/verify/:token
// @desc    Verify email address
router.get("/verify/:token", async (req, res) => {
    const user = await User.findOne({
        verificationToken: req.params.token,
        verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Auto-login: Generate a token
    const token = user.getSignedJwtToken();

    // Redirect to frontend with token
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const frontendUrl = `${frontendBaseUrl}/verify-success?token=${token}`;
    res.redirect(frontendUrl);
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile (Name, Dept, Semester)
router.put("/update-profile", protect, async (req, res) => {
    try {
        const { name, department, semester } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if (name) user.name = name;
        if (department) user.department = department;
        if (semester) user.semester = semester;
        
        await user.save();

        // Dynamically update all existing tickets for this user with the new Name, Department, and Semester
        const updateFields = {};
        if (name) updateFields.name = name;
        if (department) updateFields.department = department;
        if (semester) updateFields.semester = semester;

        if (Object.keys(updateFields).length > 0) {
            await Ticket.updateMany(
                { $or: [{ userId: user._id.toString() }, { agNo: user.agNo }] },
                { $set: updateFields }
            );
        }

        res.json({ 
            success: true, 
            message: "Profile updated successfully.", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                agNo: user.agNo,
                role: user.role,
                isVerified: user.isVerified,
                department: user.department,
                semester: user.semester,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
    }
});

// @route   DELETE /api/auth/delete-me
// @desc    User deletes their own account
router.delete("/delete-me", protect, async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: "Please provide your password to confirm account deletion." });

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password. Account deletion aborted." });
    }

    if (user.role === "admin") {
        return res.status(400).json({ success: false, message: "Admin accounts cannot be deleted directly." });
    }

    // Delete associated tickets
    await require("../models/Ticket").deleteMany({ agNo: user.agNo });

    // Log the action before deleting
    const { logAction } = require('../utils/auditLogger');
    await logAction(req, "ACCOUNT_DELETED", "User", user._id, `User deleted their own account: ${user.email}`, { 
        email: user.email,
        name: user.name 
    });

    await user.deleteOne();

    res.json({ success: true, message: "Your account has been permanently deleted." });
});

// @route   PUT /api/auth/update-password
// @desc    Update password while logged in
router.put("/update-password", protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
});

// @route   GET /api/auth/audit-logs
// @desc    Get admin audit logs (admin only)
router.get("/audit-logs", protect, adminOnly, async (req, res) => {
    const logs = await require("../models/AuditLog").find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
});

// @route   PUT /api/auth/users/:id/manual-verify
// @desc    Admin manually verifies a user
// @access  Private (Admin Only)
router.put("/users/:id/manual-verify", protect, adminOnly, async (req, res) => {
    const user = await User.findById(req.user.id); // for audit log
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    
    targetUser.isVerified = true;
    targetUser.verificationToken = undefined;
    targetUser.verificationTokenExpire = undefined;
    await targetUser.save();

    await logAction(req, "USER_VERIFIED_MANUALLY", "User", targetUser._id, `Manually verified user: ${targetUser.name} (${targetUser.email})`);

    res.json({ success: true, message: `User ${targetUser.name} verified manually.` });
});

// @route   POST /api/auth/users/:id/resend-verify
// @desc    Resends verification email to a user (Admin or Self)
// @access  Private
router.post("/users/:id/resend-verify", protect, async (req, res) => {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const verificationToken = crypto.randomBytes(20).toString("hex");
    targetUser.verificationToken = verificationToken;
    targetUser.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await targetUser.save();

    let backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    if (backendUrl.includes("localhost") && !req.get("host").includes("localhost") && !req.get("host").includes("127.0.0.1")) {
        backendUrl = `${req.protocol}://${req.get("host")}`;
    }
    const verifyUrl = `${backendUrl}/api/auth/verify/${verificationToken}`;
    
    console.log("\n============================================");
    console.log("🚀 RESEND VERIFICATION URL GENERATED:");
    console.log(`🔗 Link: ${verifyUrl}`);
    console.log("============================================\n");
    const html = `
        <div style="font-size: 15px; color: #9a8fa6; line-height: 1.7; margin-bottom: 25px;">
            Your email verification link has been resent. Please verify your email address to complete your registration and start generating tickets.
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #9a8fa6; margin-bottom: 20px;">Click the button below to verify your account:</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2743, #c234a5); color: #fff; text-decoration: none; border-radius: 50px; font-weight: 700;">Verify My Account</a>
            <p style="font-size: 11px; color: #6b5f78; margin-top: 20px;">Link expires in 24 hours.</p>
        </div>
    `;

    const { sendEmail } = require("../services/emailService");
    sendEmail({
        email: targetUser.email,
        subject: "Verify Your Email - The Computing Society",
        message: "Verify your email link resent.",
        html
    }).catch(err => {
        console.error("Resend verification email could not be sent in background:", err.message);
    });

    res.json({ success: true, message: "Verification email resent successfully." });
});

module.exports = router;

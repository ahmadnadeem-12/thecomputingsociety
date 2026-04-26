const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
        },
        department: {
            type: String,
            trim: true,
        },
        semester: {
            type: String,
            trim: true,
        },
        agNo: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true,
            sparse: true, // Allows multiple users with null agNo (admins)
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't include password in queries by default
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        verificationTokenExpire: Date,
        loginAttempts: {
            type: Number,
            required: true,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },

        // ========================
        // Password Reset Fields
        // ========================
        resetToken: {
            type: String,
            select: false, // Don't return this in normal queries
            default: undefined,
        },
        resetTokenExpire: {
            type: Date,
            default: undefined,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30m",
    });
};

/**
 * Generate crypto-based reset token
 * - Creates a random 32-byte hex token
 * - Hashes it (SHA-256) before saving to DB for security
 * - Returns the UNHASHED token (sent to user via email)
 * - Token expires in 15 minutes
 */
userSchema.methods.getResetPasswordToken = function () {
    // Generate random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to database (never store raw tokens in DB)
    this.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Set expiry — 15 minutes from now
    this.resetTokenExpire = Date.now() + 15 * 60 * 1000;

    // Return the UNHASHED token (this goes in the email link)
    return rawToken;
};

/**
 * Clear reset token fields after successful reset
 */
userSchema.methods.clearResetToken = function () {
    this.resetToken = undefined;
    this.resetTokenExpire = undefined;
};

module.exports = mongoose.model("User", userSchema);

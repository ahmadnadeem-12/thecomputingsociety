const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paymentOrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event ID is required"],
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: 1,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "expired"],
            default: "pending",
        },
        transactionId: {
            type: String,
            default: "",
        },
        jazzcashResponseCode: {
            type: String,
            default: "",
        },
        jazzcashResponseMessage: {
            type: String,
            default: "",
        },
        // Customer info snapshot
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        agNo: { type: String, default: "" },
        department: { type: String, default: "" },
        semester: { type: String, default: "" },

        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// TTL index — auto-delete expired pending orders after expiresAt
paymentOrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate pending orders per user per event
paymentOrderSchema.index({ userId: 1, eventId: 1, paymentStatus: 1 });

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema);

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paidTicketSchema = new mongoose.Schema(
    {
        ticketId: {
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
        paymentOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentOrder",
            required: [true, "Payment Order is required"],
        },
        transactionId: {
            type: String,
            required: [true, "Transaction ID is required"],
        },
        // Snapshot of user info at purchase time
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
        },
        agNo: {
            type: String,
            default: "",
        },
        department: {
            type: String,
            default: "",
        },
        semester: {
            type: String,
            default: "",
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        usedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Prevent duplicate paid ticket per user per event
paidTicketSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("PaidTicket", paidTicketSchema);

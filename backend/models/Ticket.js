const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        publicTicketId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: String,
            default: "",
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: false,
        },
        programId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program",
            required: false,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        agNo: {
            type: String,
            default: "",
        },
        email: {
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
        checkedIn: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Prevent duplicate ticket per event/program per student (AG No)
ticketSchema.index({ eventId: 1, agNo: 1, programId: 1 }, { unique: true });

module.exports = mongoose.model("Ticket", ticketSchema);

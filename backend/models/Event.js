const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        date: {
            type: String,
            required: [true, "Event date is required"],
        },
        time: {
            type: String,
            default: "",
        },
        venue: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "closed", "upcoming", "cancelled", "past"],
            default: "open",
        },
        featured: {
            type: Boolean,
            default: false,
        },
        capacity: {
            type: Number,
            default: 0,
        },
        seatsRemaining: {
            type: Number,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("Event", eventSchema);

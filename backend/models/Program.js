const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Program title is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: ["bootcamp", "workshop", "competition", "talk", "seminar", "other"],
            default: "workshop",
        },
        description: {
            type: String,
            default: "",
        },
        icon: {
            type: String,
            default: "📚",
        },
        duration: {
            type: String,
            default: "",
        },
        participants: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["upcoming", "open", "ongoing", "completed", "cancelled"],
            default: "upcoming",
        },
        startDate: {
            type: String,
            default: "",
        },
        instructor: {
            type: String,
            default: "",
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("Program", programSchema);

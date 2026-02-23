const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Announcement title is required"],
            trim: true,
        },
        body: {
            type: String,
            default: "",
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0],
        },
        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal",
        },
        tags: {
            type: [String],
            default: [],
        },
        link: {
            type: String,
            default: "",
        },
        linkText: {
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

module.exports = mongoose.model("Announcement", announcementSchema);

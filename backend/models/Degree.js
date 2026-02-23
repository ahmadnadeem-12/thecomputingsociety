const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Degree code is required"],
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Degree name is required"],
            trim: true,
        },
        fullName: {
            type: String,
            default: "",
        },
        duration: {
            type: String,
            default: "4 Years",
        },
        semesters: {
            type: Number,
            default: 8,
        },
        description: {
            type: String,
            default: "",
        },
        icon: {
            type: String,
            default: "📚",
        },
        courses: {
            type: [String],
            default: [],
        },
        pdfUrl: {
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

module.exports = mongoose.model("Degree", degreeSchema);

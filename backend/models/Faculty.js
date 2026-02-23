const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Faculty name is required"],
            trim: true,
        },
        departmentRole: {
            type: String,
            default: "",
        },
        education: {
            type: String,
            default: "",
        },
        experienceYears: {
            type: Number,
            default: 0,
        },
        expertise: {
            type: [String],
            default: [],
        },
        courses: {
            type: [String],
            default: [],
        },
        universities: {
            type: [String],
            default: [],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
        },
        phone: {
            type: String,
            default: "",
        },
        summary: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        socials: {
            linkedin: { type: String, default: "" },
            website: { type: String, default: "" },
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("Faculty", facultySchema);

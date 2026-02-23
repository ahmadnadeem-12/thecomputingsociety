const mongoose = require("mongoose");

const cabinetSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Cabinet member name is required"],
            trim: true,
        },
        role: {
            type: String,
            required: [true, "Role is required"],
            trim: true,
        },
        degree: {
            type: String,
            default: "",
        },
        agNo: {
            type: String,
            default: "",
        },
        interests: {
            type: [String],
            default: [],
        },
        phone: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
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
            instagram: { type: String, default: "" },
            facebook: { type: String, default: "" },
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

module.exports = mongoose.model("Cabinet", cabinetSchema);

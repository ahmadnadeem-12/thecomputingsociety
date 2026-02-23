const mongoose = require("mongoose");

const homeContentSchema = new mongoose.Schema(
    {
        heroTitle: {
            line1: { type: String, default: "THE" },
            line2: { type: String, default: "COMPUTING" },
            line3: { type: String, default: "SOCIETY" },
        },
        heroBadge: {
            type: String,
            default: "Official Society • Dept. of Computer Science • UAF",
        },
        heroDescription: {
            type: String,
            default:
                "Connecting students, faculty, and industry through workshops, competitions, talks, hackathons, and social nights. Building the next generation of tech leaders at UAF.",
        },
        stats: [
            {
                number: { type: String, default: "" },
                label: { type: String, default: "" },
            },
        ],
        notices: [
            {
                title: { type: String, default: "" },
                meta: { type: String, default: "" },
                icon: { type: String, default: "" },
                gradient: { type: String, default: "" },
            },
        ],
        features: [
            {
                icon: { type: String, default: "" },
                title: { type: String, default: "" },
                desc: { type: String, default: "" },
            },
        ],
        quickLinks: [
            {
                label: { type: String, default: "" },
                path: { type: String, default: "" },
                icon: { type: String, default: "" },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("HomeContent", homeContentSchema);

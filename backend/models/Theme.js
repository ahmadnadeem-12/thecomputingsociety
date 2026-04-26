const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "default",
            unique: true,
        },
        colors: {
            type: Map,
            of: String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Theme", themeSchema);

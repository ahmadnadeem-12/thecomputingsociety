
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        adminName: {
            type: String,
            required: true,
        },
        action: {
            type: String, // e.g., "DELETE_USER", "UPDATE_EVENT", "DELETE_TICKET"
            required: true,
        },
        targetType: {
            type: String, // e.g., "User", "Event", "Ticket", "Program"
            required: true,
        },
        targetId: {
            type: String,
        },
        details: {
            type: String, // Human readable description
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed, // Any additional data
        },
        ipAddress: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);

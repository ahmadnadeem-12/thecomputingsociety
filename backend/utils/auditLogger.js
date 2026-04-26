
const AuditLog = require("../models/AuditLog");

/**
 * Log an administrative action
 * @param {Object} req - Express request object
 * @param {String} action - Action type (e.g., DELETE_USER)
 * @param {String} targetType - Resource type (e.g., User)
 * @param {String} targetId - ID of the resource
 * @param {String} details - Description
 * @param {Object} metadata - Extra context
 */
exports.logAction = async (req, action, targetType, targetId, details, metadata = {}) => {
    try {
        await AuditLog.create({
            adminId: req.user._id,
            adminName: req.user.name,
            action,
            targetType,
            targetId,
            details,
            metadata,
            ipAddress: req.ip || req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || "Unknown",
        });
    } catch (error) {
        console.error("Audit Logging Error:", error);
        // We don't want to break the main request if logging fails
    }
};

/**
 * ============================================
 * THE COMPUTING SOCIETY — Backend API Server
 * ============================================
 * MERN Stack | Express.js + MongoDB + Mongoose
 * ============================================
 */

require("dotenv").config();
require("express-async-errors"); // Catch async errors automatically

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize Express
const app = express();

/**
 * Trust proxy is essential for capturing real client IP addresses 
 * when the application is behind a reverse proxy (Nginx, Cloudflare, etc.)
 */
app.set("trust proxy", true);

// ========================
// Security Middleware
// ========================
app.use(helmet()); // Security headers
app.use(
    cors({
        origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN?.split(","),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", limiter);

// ========================
// Body Parsing & Logging
// ========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression()); // Gzip compression

// Logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// ========================
// API Routes
// ========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/cabinet", require("./routes/cabinet"));
app.use("/api/faculty", require("./routes/faculty"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/programs", require("./routes/programs"));
app.use("/api/degrees", require("./routes/degrees"));
app.use("/api/theme", require("./routes/theme"));
app.use("/api/home", require("./routes/home"));

// ========================
// API Root & Health Check
// ========================
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "👋 Welcome to THE COMPUTING SOCIETY API",
        endpoints: {
            auth: "/api/auth",
            events: "/api/events",
            health: "/api/health",
        },
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "TCS Backend API is running",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "🎓 THE COMPUTING SOCIETY — API Server",
        version: "1.0.0",
        docs: "/api/health",
    });
});

// ========================
// Error Handling
// ========================
app.use(notFound);
app.use(errorHandler);

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

const Ticket = require("./models/Ticket");

const startServer = async () => {
    try {
        await connectDB();
        
        // Automatically sync and drop stale Mongoose indexes for Tickets
        try {
            await Ticket.syncIndexes();
            console.log("  ✅ MongoDB Indexes Synchronized");
        } catch (err) {
            console.warn("  ⚠️ Warning: Could not sync Ticket indexes", err.message);
        }

        app.listen(PORT, () => {
            console.log("");
            console.log("============================================");
            console.log("  🎓 THE COMPUTING SOCIETY — API Server");
            console.log("============================================");
            console.log(`  🚀 Mode:    ${process.env.NODE_ENV || "development"}`);
            console.log(`  🌐 Port:    ${PORT}`);
            console.log(`  📡 Health:  /api/health`);
            console.log("============================================");
            console.log("");
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    // Don't crash in development
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message);
    process.exit(1);
});

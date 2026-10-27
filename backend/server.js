// Load environment variables (.env) using Node.js native support
try {
    process.loadEnvFile();
} catch (error) {
    // .env file might be missing in production or handled via env vars
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect to MongoDB Atlas (if MONGO_URI is set)
connectDB();

const app = express();

// ── Enable CORS for frontend / Live Server support ──────────
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// ── Body parser ──────────────────────────────────────────────
app.use(express.json());

// ── Serve Frontend static files ──────────────────────────────
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ── API Routes ───────────────────────────────────────────────
const userRoutes = require("./routes/userRoutes");
const businessRoutes = require("./routes/businessRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

// ── Health-check & Status route ──────────────────────────────
app.get("/api/health", (req, res) => {
    const mongoose = require("mongoose");
    const dbState = mongoose.connection.readyState;

    if (dbState === 1) {
        return res.status(200).json({
            status: "ok",
            database: "connected",
            message: "LocalBizConnect Backend is running with MongoDB Atlas",
            timestamp: new Date().toISOString()
        });
    }

    res.status(200).json({
        status: "ok",
        database: "demo-memory",
        message: "Running with demo data",
        mode: "in-memory-demo",
        timestamp: new Date().toISOString()
    });
});

// Fallback route for frontend single page navigation if requested
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
        if (err) {
            res.send("LocalBizConnect Backend is running!");
        }
    });
});

// ── 404 handler (unknown routes) ────────────────────────────
app.use(notFound);

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend accessible at http://localhost:${PORT}`);
    console.log(`🔌 API accessible at http://localhost:${PORT}/api`);
});

module.exports = { app, server };
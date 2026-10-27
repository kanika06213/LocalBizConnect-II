const mongoose = require("mongoose");

// Middleware to verify database connection; allows in-memory demo mode when MongoDB is not connected
const checkDbConnected = (req, res, next) => {
    req.isDemo = mongoose.connection.readyState !== 1;
    next();
};

// 404 Not Found Middleware
const notFound = (req, res, next) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal server error";

    // Mongoose bad ObjectId / CastError
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with invalid ID: ${err.value}`;
    }

    // Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `Duplicate value entered for ${field}. Please use another value.`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token authorization";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired. Please log in again.";
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
};

module.exports = {
    checkDbConnected,
    notFound,
    errorHandler
};

const mongoose = require("mongoose");

// @desc  Connect to MongoDB Atlas
// @usage Call connectDB() in server.js
const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri || uri === "your_mongodb_connection_string" || uri.trim() === "") {
        console.warn("\n====================================================================");
        console.warn("⚠️  [MongoDB Warning] MONGO_URI is NOT configured in backend/.env!");
        console.warn("To enable full database functionality:");
        console.warn("1. Open backend/.env");
        console.warn("2. Replace 'your_mongodb_connection_string' with your MongoDB Atlas URI");
        console.warn("   Example: mongodb+srv://<user>:<password>@cluster0.mongodb.net/localbizconnect");
        console.warn("====================================================================\n");
        return null;
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        console.warn("Please verify your MONGO_URI credentials and network access in backend/.env.");
        return null;
    }
};

module.exports = connectDB;

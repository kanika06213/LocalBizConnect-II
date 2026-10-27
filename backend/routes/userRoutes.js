const express = require("express");
const {
    registerUser,
    loginUser,
    getUserProfile,
    getAdminDashboard
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { checkDbConnected } = require("../middleware/errorMiddleware");

const router = express.Router();

// Apply checkDbConnected so DB errors are caught with clean 503 instead of buffering timeouts
router.use(checkDbConnected);

// Public Routes
// POST /api/users/register
router.post("/register", registerUser);

// POST /api/users/login
router.post("/login", loginUser);

// Protected Routes
// GET /api/users/profile (Any authenticated user)
router.get("/profile", protect, getUserProfile);

// GET /api/users/admin (Admin role only)
router.get("/admin", protect, authorizeRoles("admin"), getAdminDashboard);

module.exports = router;
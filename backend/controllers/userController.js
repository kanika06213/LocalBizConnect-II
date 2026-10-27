const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Business = require("../models/Business");
const Product = require("../models/Product");
const Review = require("../models/Review");
const demoStore = require("../data/demoStore");

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to generate signed JWT (password is NEVER included)
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || "fallback_jwt_secret_key",
        { expiresIn: "7d" }
    );
};

// @desc    Register a new user (customer or seller only)
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation: Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email, and password"
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        // Password length guard
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Prevent public admin registration
        if (role && role.toLowerCase() === "admin") {
            return res.status(400).json({
                message: "Public registration as admin is not permitted"
            });
        }

        // Allowed public roles: customer (default) or seller
        let userRole = "customer";
        if (role) {
            const normalizedRole = role.toLowerCase().trim();
            if (["customer", "seller"].includes(normalizedRole)) {
                userRole = normalizedRole;
            } else {
                return res.status(400).json({
                    message: "Role must be either 'customer' or 'seller'"
                });
            }
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const existingUser = demoStore.findUserByEmail(normalizedEmail);
            if (existingUser) {
                return res.status(409).json({
                    message: "Email already registered. Please log in instead."
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = demoStore.createUser({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: userRole
            });

            const token = generateToken(newUser._id, newUser.role);

            return res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    _id: newUser._id,
                    id: newUser.id || newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered. Please log in instead."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole
        });

        await user.save();

        const token = generateToken(user._id, user.role);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user and return JWT
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const user = demoStore.findUserByEmail(normalizedEmail);
            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = generateToken(user._id, user.role);

            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const user = demoStore.findUserById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    message: "User profile not found"
                });
            }

            return res.status(200).json({
                message: "Profile retrieved successfully",
                user: {
                    _id: user._id,
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User profile not found"
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin-only dashboard overview & statistics
// @route   GET /api/users/admin
// @access  Private (admin only)
const getAdminDashboard = async (req, res, next) => {
    try {
        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const overview = demoStore.getUserStats();
            return res.status(200).json({
                message: "Welcome to the admin dashboard",
                stats: overview.stats,
                recentUsers: overview.recentUsers
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const [
            totalUsers,
            totalCustomers,
            totalSellers,
            totalBusinesses,
            totalProducts,
            totalReviews,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "customer" }),
            User.countDocuments({ role: "seller" }),
            Business.countDocuments(),
            Product.countDocuments(),
            Review.countDocuments(),
            User.find().select("-password").sort({ createdAt: -1 }).limit(5)
        ]);

        return res.status(200).json({
            message: "Welcome to the admin dashboard",
            stats: {
                totalUsers,
                totalCustomers,
                totalSellers,
                totalBusinesses,
                totalProducts,
                totalReviews
            },
            recentUsers
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAdminDashboard
};

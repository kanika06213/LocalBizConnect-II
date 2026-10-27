const mongoose = require("mongoose");
const Business = require("../models/Business");
const Product = require("../models/Product");
const Review = require("../models/Review");
const demoStore = require("../data/demoStore");

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to attach review aggregates (avg rating, review count) in MongoDB mode
const getReviewStatsMap = async (businessIds) => {
    const stats = await Review.aggregate([
        { $match: { business: { $in: businessIds } } },
        {
            $group: {
                _id: "$business",
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    const statsMap = {};
    stats.forEach((item) => {
        statsMap[item._id.toString()] = {
            averageRating: Number(item.averageRating.toFixed(1)),
            reviewCount: item.reviewCount
        };
    });
    return statsMap;
};

// @desc    Get all businesses with search and category filtering
// @route   GET /api/businesses
// @access  Public
const getBusinesses = async (req, res, next) => {
    try {
        const { category, search, owner } = req.query;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const businesses = demoStore.getBusinesses({ category, search, owner });
            return res.status(200).json({
                count: businesses.length,
                businesses
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const query = {};

        if (category && category !== "All") {
            query.category = category;
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [{ name: regex }, { description: regex }, { address: regex }];
        }

        if (owner) {
            query.owner = owner;
        }

        const businesses = await Business.find(query)
            .populate("owner", "name email")
            .sort({ createdAt: -1 });

        const businessIds = businesses.map((b) => b._id);
        const statsMap = await getReviewStatsMap(businessIds);

        const businessesWithStats = businesses.map((b) => {
            const obj = b.toObject();
            const stat = statsMap[b._id.toString()] || { averageRating: 0, reviewCount: 0 };
            obj.averageRating = stat.averageRating;
            obj.reviewCount = stat.reviewCount;
            return obj;
        });

        return res.status(200).json({
            count: businessesWithStats.length,
            businesses: businessesWithStats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get businesses owned by current seller
// @route   GET /api/businesses/seller/mine
// @access  Private (seller/admin)
const getMyBusinesses = async (req, res, next) => {
    try {
        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const businesses = demoStore.getBusinesses({ owner: req.user.userId });
            return res.status(200).json({
                count: businesses.length,
                businesses
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const businesses = await Business.find({ owner: req.user.userId })
            .populate("owner", "name email")
            .sort({ createdAt: -1 });

        const businessIds = businesses.map((b) => b._id);
        const statsMap = await getReviewStatsMap(businessIds);

        const businessesWithStats = businesses.map((b) => {
            const obj = b.toObject();
            const stat = statsMap[b._id.toString()] || { averageRating: 0, reviewCount: 0 };
            obj.averageRating = stat.averageRating;
            obj.reviewCount = stat.reviewCount;
            return obj;
        });

        return res.status(200).json({
            count: businessesWithStats.length,
            businesses: businessesWithStats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single business by ID
// @route   GET /api/businesses/:id
// @access  Public
const getBusinessById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.getBusinessById(id);
            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }
            return res.status(200).json({ business });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        const business = await Business.findById(id).populate("owner", "name email");

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        const reviews = await Review.find({ business: id })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        const products = await Product.find({ business: id }).sort({ createdAt: -1 });

        const reviewCount = reviews.length;
        const averageRating =
            reviewCount > 0
                ? Number(
                      (
                          reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                      ).toFixed(1)
                  )
                : 0;

        const businessObj = business.toObject();
        businessObj.averageRating = averageRating;
        businessObj.reviewCount = reviewCount;
        businessObj.reviews = reviews;
        businessObj.products = products;

        return res.status(200).json({
            business: businessObj
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new business
// @route   POST /api/businesses
// @access  Private (seller/admin only)
const createBusiness = async (req, res, next) => {
    try {
        const { name, description, category, address, phone, email, image } = req.body;

        // Validation
        if (!name || !description || !category || !address || !phone || !email) {
            return res.status(400).json({
                message: "Please provide all required fields: name, description, category, address, phone, email"
            });
        }

        const validCategories = [
            "Food",
            "Medicine",
            "Carpenter",
            "Plumber",
            "Electrician",
            "Grocery"
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                message: `Category must be one of: ${validCategories.join(", ")}`
            });
        }

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.createBusiness({
                name,
                description,
                category,
                address,
                phone,
                email,
                image,
                owner: req.user.userId
            });

            return res.status(201).json({
                message: "Business created successfully",
                business
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const business = new Business({
            name: name.trim(),
            description: description.trim(),
            category,
            address: address.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            owner: req.user.userId,
            image: image && image.trim() !== "" ? image.trim() : ""
        });

        await business.save();

        const populated = await Business.findById(business._id).populate("owner", "name email");

        return res.status(201).json({
            message: "Business created successfully",
            business: populated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a business
// @route   PUT /api/businesses/:id
// @access  Private (owner/admin only)
const updateBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.getBusinessById(id);
            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }

            const ownerId = business.owner ? (business.owner._id || business.owner).toString() : "";
            if (ownerId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized to update this business. You do not own it."
                });
            }

            const { name, description, category, address, phone, email, image } = req.body;
            const updates = {};
            if (category) {
                const validCategories = ["Food", "Medicine", "Carpenter", "Plumber", "Electrician", "Grocery"];
                if (!validCategories.includes(category)) {
                    return res.status(400).json({ message: `Category must be one of: ${validCategories.join(", ")}` });
                }
                updates.category = category;
            }
            if (name) updates.name = name.trim();
            if (description) updates.description = description.trim();
            if (address) updates.address = address.trim();
            if (phone) updates.phone = phone.trim();
            if (email) updates.email = email.trim().toLowerCase();
            if (image !== undefined) updates.image = image.trim();

            const updated = demoStore.updateBusiness(id, updates);
            return res.status(200).json({
                message: "Business updated successfully",
                business: updated
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        // Authorization check: owner or admin only
        if (business.owner.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized to update this business. You do not own it."
            });
        }

        const { name, description, category, address, phone, email, image } = req.body;

        if (category) {
            const validCategories = [
                "Food",
                "Medicine",
                "Carpenter",
                "Plumber",
                "Electrician",
                "Grocery"
            ];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    message: `Category must be one of: ${validCategories.join(", ")}`
                });
            }
            business.category = category;
        }

        if (name) business.name = name.trim();
        if (description) business.description = description.trim();
        if (address) business.address = address.trim();
        if (phone) business.phone = phone.trim();
        if (email) business.email = email.trim().toLowerCase();
        if (image !== undefined) business.image = image.trim();

        await business.save();

        const updated = await Business.findById(business._id).populate("owner", "name email");

        return res.status(200).json({
            message: "Business updated successfully",
            business: updated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a business
// @route   DELETE /api/businesses/:id
// @access  Private (owner/admin only)
const deleteBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.getBusinessById(id);
            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }

            const ownerId = business.owner ? (business.owner._id || business.owner).toString() : "";
            if (ownerId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized to delete this business. You do not own it."
                });
            }

            demoStore.deleteBusiness(id);
            return res.status(200).json({
                message: "Business and all associated products and reviews deleted successfully"
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        // Authorization check: owner or admin only
        if (business.owner.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized to delete this business. You do not own it."
            });
        }

        // Cascade delete products and reviews associated with this business
        await Product.deleteMany({ business: id });
        await Review.deleteMany({ business: id });
        await Business.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Business and all associated products and reviews deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBusinesses,
    getMyBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness
};

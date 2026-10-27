const mongoose = require("mongoose");
const Review = require("../models/Review");
const Business = require("../models/Business");
const demoStore = require("../data/demoStore");

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all reviews for a business
// @route   GET /api/businesses/:businessId/reviews
// @access  Public
const getBusinessReviews = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.getBusinessById(businessId);
            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }

            const data = demoStore.getBusinessReviews(businessId);
            return res.status(200).json(data);
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        const reviews = await Review.find({ business: businessId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        const count = reviews.length;
        const averageRating =
            count > 0
                ? Number(
                      (
                          reviews.reduce((sum, r) => sum + r.rating, 0) / count
                      ).toFixed(1)
                  )
                : 0;

        return res.status(200).json({
            count,
            averageRating,
            reviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new review for a business
// @route   POST /api/businesses/:businessId/reviews
// @access  Private (logged-in customers/admin only)
const createReview = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const { rating, comment } = req.body;

        if (rating === undefined || !comment || comment.trim() === "") {
            return res.status(400).json({
                message: "Please provide both rating (1-5) and comment"
            });
        }

        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.getBusinessById(businessId);
            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }

            // Sellers cannot review their own businesses
            const ownerId = business.owner ? (business.owner._id || business.owner).toString() : "";
            if (ownerId === req.user.userId) {
                return res.status(400).json({
                    message: "You cannot review your own business"
                });
            }

            const result = demoStore.createOrUpdateReview({
                businessId,
                userId: req.user.userId,
                rating: numRating,
                comment: comment.trim()
            });

            if (!result.isNew) {
                return res.status(200).json({
                    message: "Review updated successfully",
                    review: result.review
                });
            }

            return res.status(201).json({
                message: "Review submitted successfully",
                review: result.review
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        if (business.owner.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot review your own business"
            });
        }

        const existingReview = await Review.findOne({
            business: businessId,
            user: req.user.userId
        });

        if (existingReview) {
            existingReview.rating = numRating;
            existingReview.comment = comment.trim();
            await existingReview.save();

            const populated = await Review.findById(existingReview._id).populate(
                "user",
                "name email"
            );

            return res.status(200).json({
                message: "Review updated successfully",
                review: populated
            });
        }

        const review = new Review({
            user: req.user.userId,
            business: businessId,
            rating: numRating,
            comment: comment.trim()
        });

        await review.save();

        const populated = await Review.findById(review._id).populate(
            "user",
            "name email"
        );

        return res.status(201).json({
            message: "Review submitted successfully",
            review: populated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing review
// @route   PUT /api/reviews/:id
// @access  Private (only review author or admin)
const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const review = demoStore.getReviewById(id);
            if (!review) {
                return res.status(404).json({ message: "Review not found" });
            }

            const authorId = (review.user && review.user._id ? review.user._id : review.user).toString();
            if (authorId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized. You can only edit your own reviews."
                });
            }

            const { rating, comment } = req.body;
            let numRating = undefined;
            if (rating !== undefined) {
                numRating = Number(rating);
                if (isNaN(numRating) || numRating < 1 || numRating > 5) {
                    return res.status(400).json({
                        message: "Rating must be an integer between 1 and 5"
                    });
                }
            }

            const updated = demoStore.updateReview(id, {
                rating: numRating,
                comment: comment ? comment.trim() : undefined
            });

            return res.status(200).json({
                message: "Review updated successfully",
                review: updated
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review ID format" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized. You can only edit your own reviews."
            });
        }

        const { rating, comment } = req.body;

        if (rating !== undefined) {
            const numRating = Number(rating);
            if (isNaN(numRating) || numRating < 1 || numRating > 5) {
                return res.status(400).json({
                    message: "Rating must be an integer between 1 and 5"
                });
            }
            review.rating = numRating;
        }

        if (comment) {
            review.comment = comment.trim();
        }

        await review.save();

        const populated = await Review.findById(review._id).populate("user", "name email");

        return res.status(200).json({
            message: "Review updated successfully",
            review: populated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (only review author or admin)
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const review = demoStore.getReviewById(id);
            if (!review) {
                return res.status(404).json({ message: "Review not found" });
            }

            const authorId = (review.user && review.user._id ? review.user._id : review.user).toString();
            if (authorId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized. You can only delete your own reviews."
                });
            }

            demoStore.deleteReview(id);
            return res.status(200).json({
                message: "Review deleted successfully"
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review ID format" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized. You can only delete your own reviews."
            });
        }

        await Review.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Review deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews written by current logged-in user
// @route   GET /api/reviews/my/reviews
// @access  Private
const getMyReviews = async (req, res, next) => {
    try {
        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const reviews = demoStore.getUserReviews(req.user.userId);
            return res.status(200).json({
                count: reviews.length,
                reviews
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const reviews = await Review.find({ user: req.user.userId })
            .populate("business", "name category address image")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: reviews.length,
            reviews
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBusinessReviews,
    createReview,
    updateReview,
    deleteReview,
    getMyReviews
};

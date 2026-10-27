const express = require("express");
const {
    updateReview,
    deleteReview,
    getMyReviews
} = require("../controllers/reviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { checkDbConnected } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(checkDbConnected);

// GET /api/reviews/my/reviews
router.get("/my/reviews", protect, getMyReviews);

// PUT /api/reviews/:id
router.put("/:id", protect, authorizeRoles("customer", "admin"), updateReview);

// DELETE /api/reviews/:id
router.delete("/:id", protect, authorizeRoles("customer", "admin"), deleteReview);

module.exports = router;

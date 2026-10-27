const express = require("express");
const {
    getBusinesses,
    getMyBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness
} = require("../controllers/businessController");
const { getBusinessProducts } = require("../controllers/productController");
const {
    getBusinessReviews,
    createReview
} = require("../controllers/reviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { checkDbConnected } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(checkDbConnected);

// Public business discovery
router.get("/", getBusinesses);

// Protected: Get businesses owned by current logged-in seller
router.get("/seller/mine", protect, authorizeRoles("seller", "admin"), getMyBusinesses);

// Public: Get business details by ID
router.get("/:id", getBusinessById);

// Protected: Create new business (seller or admin)
router.post("/", protect, authorizeRoles("seller", "admin"), createBusiness);

// Protected: Update business (owner or admin)
router.put("/:id", protect, authorizeRoles("seller", "admin"), updateBusiness);

// Protected: Delete business (owner or admin)
router.delete("/:id", protect, authorizeRoles("seller", "admin"), deleteBusiness);

// Products of a business
router.get("/:businessId/products", getBusinessProducts);

// Reviews of a business
router.get("/:businessId/reviews", getBusinessReviews);

// Add a review to a business (customer or admin)
router.post("/:businessId/reviews", protect, authorizeRoles("customer", "admin"), createReview);

module.exports = router;

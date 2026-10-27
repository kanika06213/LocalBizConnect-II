const express = require("express");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { checkDbConnected } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(checkDbConnected);

// GET /api/products
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

// POST /api/products (seller or admin)
router.post("/", protect, authorizeRoles("seller", "admin"), createProduct);

// PUT /api/products/:id (seller or admin)
router.put("/:id", protect, authorizeRoles("seller", "admin"), updateProduct);

// DELETE /api/products/:id (seller or admin)
router.delete("/:id", protect, authorizeRoles("seller", "admin"), deleteProduct);

module.exports = router;

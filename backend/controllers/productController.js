const mongoose = require("mongoose");
const Product = require("../models/Product");
const Business = require("../models/Business");
const demoStore = require("../data/demoStore");

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all products (with optional type/category/search filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { type, category, search, business } = req.query;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const products = demoStore.getProducts({ type, category, search, business });
            return res.status(200).json({
                count: products.length,
                products
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        const query = {};

        if (type && ["product", "service"].includes(type.toLowerCase())) {
            query.type = type.toLowerCase();
        }

        if (category && category !== "All") {
            query.category = category;
        }

        if (business) {
            if (!mongoose.Types.ObjectId.isValid(business)) {
                return res.status(400).json({ message: "Invalid business ID format" });
            }
            query.business = business;
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [{ name: regex }, { description: regex }];
        }

        const products = await Product.find(query)
            .populate("business", "name category address phone email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const product = demoStore.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: "Product or service not found" });
            }
            return res.status(200).json({ product });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await Product.findById(id).populate(
            "business",
            "name category address phone email owner"
        );

        if (!product) {
            return res.status(404).json({ message: "Product or service not found" });
        }

        return res.status(200).json({ product });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all products/services of a specific business
// @route   GET /api/businesses/:businessId/products
// @access  Public
const getBusinessProducts = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const business = demoStore.getBusinessById(businessId);
            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }

            const products = demoStore.getBusinessProducts(businessId);
            return res.status(200).json({
                count: products.length,
                business: {
                    _id: business._id,
                    id: business.id || business._id,
                    name: business.name,
                    category: business.category
                },
                products
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

        const products = await Product.find({ business: businessId }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: products.length,
            business: {
                _id: business._id,
                name: business.name,
                category: business.category
            },
            products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product or service
// @route   POST /api/products
// @access  Private (seller/admin only)
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, type, business, image } = req.body;

        if (!name || !description || price === undefined || !category || !business) {
            return res.status(400).json({
                message: "Please provide name, description, price, category, and business ID"
            });
        }

        if (isNaN(price) || Number(price) < 0) {
            return res.status(400).json({
                message: "Price must be a non-negative number"
            });
        }

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const businessDoc = demoStore.getBusinessById(business);
            if (!businessDoc) {
                return res.status(404).json({ message: "Associated business not found" });
            }

            const ownerId = businessDoc.owner ? (businessDoc.owner._id || businessDoc.owner).toString() : "";
            if (ownerId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized. You can only add products/services to your own business."
                });
            }

            const productType = type && ["service", "product"].includes(type.toLowerCase())
                ? type.toLowerCase()
                : "product";

            const product = demoStore.createProduct({
                name,
                description,
                price,
                category,
                type: productType,
                business,
                image
            });

            return res.status(201).json({
                message: "Product/Service created successfully",
                product
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(business)) {
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        const businessDoc = await Business.findById(business);
        if (!businessDoc) {
            return res.status(404).json({ message: "Associated business not found" });
        }

        if (businessDoc.owner.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized. You can only add products/services to your own business."
            });
        }

        const productType = type && ["service", "product"].includes(type.toLowerCase())
            ? type.toLowerCase()
            : "product";

        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category: category.trim(),
            type: productType,
            business,
            image: image && image.trim() !== "" ? image.trim() : ""
        });

        await product.save();

        const populated = await Product.findById(product._id).populate(
            "business",
            "name category address"
        );

        return res.status(201).json({
            message: "Product/Service created successfully",
            product: populated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product or service
// @route   PUT /api/products/:id
// @access  Private (seller/admin only)
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const product = demoStore.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: "Product or service not found" });
            }

            const bizId = product.business ? (product.business._id || product.business) : "";
            const biz = demoStore.getBusinessById(bizId);
            const ownerId = biz && biz.owner ? (biz.owner._id || biz.owner).toString() : "";

            if (ownerId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized. You do not own the business this product belongs to."
                });
            }

            const { name, description, price, category, type, image } = req.body;
            const updates = {};
            if (name) updates.name = name.trim();
            if (description) updates.description = description.trim();
            if (price !== undefined) {
                if (isNaN(price) || Number(price) < 0) {
                    return res.status(400).json({ message: "Price must be a non-negative number" });
                }
                updates.price = Number(price);
            }
            if (category) updates.category = category.trim();
            if (type && ["product", "service"].includes(type.toLowerCase())) {
                updates.type = type.toLowerCase();
            }
            if (image !== undefined) updates.image = image.trim();

            const updated = demoStore.updateProduct(id, updates);
            return res.status(200).json({
                message: "Product/Service updated successfully",
                product: updated
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await Product.findById(id).populate("business");
        if (!product) {
            return res.status(404).json({ message: "Product or service not found" });
        }

        if (
            product.business.owner.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Not authorized. You do not own the business this product belongs to."
            });
        }

        const { name, description, price, category, type, image } = req.body;

        if (name) product.name = name.trim();
        if (description) product.description = description.trim();
        if (price !== undefined) {
            if (isNaN(price) || Number(price) < 0) {
                return res.status(400).json({ message: "Price must be a non-negative number" });
            }
            product.price = Number(price);
        }
        if (category) product.category = category.trim();
        if (type && ["product", "service"].includes(type.toLowerCase())) {
            product.type = type.toLowerCase();
        }
        if (image !== undefined) product.image = image.trim();

        await product.save();

        return res.status(200).json({
            message: "Product/Service updated successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product or service
// @route   DELETE /api/products/:id
// @access  Private (seller/admin only)
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ── IN-MEMORY DEMO MODE ────────────────────────────────
        if (!isDbConnected()) {
            const product = demoStore.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: "Product or service not found" });
            }

            const bizId = product.business ? (product.business._id || product.business) : "";
            const biz = demoStore.getBusinessById(bizId);
            const ownerId = biz && biz.owner ? (biz.owner._id || biz.owner).toString() : "";

            if (ownerId !== req.user.userId && req.user.role !== "admin") {
                return res.status(403).json({
                    message: "Not authorized. You do not own the business this product belongs to."
                });
            }

            demoStore.deleteProduct(id);
            return res.status(200).json({
                message: "Product/Service deleted successfully"
            });
        }

        // ── MONGODB MODE ───────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await Product.findById(id).populate("business");
        if (!product) {
            return res.status(404).json({ message: "Product or service not found" });
        }

        if (
            product.business.owner.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Not authorized. You do not own the business this product belongs to."
            });
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Product/Service deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    getBusinessProducts,
    createProduct,
    updateProduct,
    deleteProduct
};

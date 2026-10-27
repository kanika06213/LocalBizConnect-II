const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Business name is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "Food",
                    "Medicine",
                    "Carpenter",
                    "Plumber",
                    "Electrician",
                    "Grocery"
                ],
                message: "Category must be one of: Food, Medicine, Carpenter, Plumber, Electrician, Grocery"
            }
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        image: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for reviews associated with this business
businessSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "business"
});

// Virtual for products associated with this business
businessSchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "business"
});

module.exports = mongoose.model("Business", businessSchema);

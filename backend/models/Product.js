const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        type: {
            type: String,
            required: [true, "Type is required"],
            enum: {
                values: ["product", "service"],
                message: "Type must be either 'product' or 'service'"
            },
            default: "product"
        },
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: [true, "Business ID is required"]
        },
        image: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"]
        },
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: [true, "Business is required"]
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"]
        },
        comment: {
            type: String,
            required: [true, "Comment is required"],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Optional compound index: one review per user per business
// Let's create index so we can efficiently look up reviews by business
reviewSchema.index({ business: 1, user: 1 });

module.exports = mongoose.model("Review", reviewSchema);

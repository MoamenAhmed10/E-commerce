const Review = require("../models/review.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../constants/order-status");

class ReviewService {
  /**
   * Get reviews for a product
   */
  async getByProductId(productId, options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const filter = { productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    // Calculate average rating
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const ratingStats = stats[0] || { averageRating: 0, totalReviews: 0 };

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: parseInt(page) < Math.ceil(total / limit),
        hasPrevPage: parseInt(page) > 1,
      },
      stats: {
        averageRating: Math.round(ratingStats.averageRating * 10) / 10 || 0,
        totalReviews: ratingStats.totalReviews || 0,
      },
    };
  }

  /**
   * Get user's reviews
   */
  async getByUserId(userId) {
    return Review.find({ userId })
      .populate("productId", "name images slug")
      .sort("-createdAt");
  }

  /**
   * Create review
   */
  async create(userId, reviewData) {
    const { productId, orderId, rating, title, comment, images } = reviewData;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    // Verify user has purchased this product
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: ORDER_STATUS.RECEIVED,
      "items.productId": productId,
    });

    if (!order) {
      const error = new Error(
        "You can only review products you have purchased and received",
      );
      error.statusCode = 400;
      throw error;
    }

    // Check if user already reviewed this product for this order
    const existingReview = await Review.findOne({ userId, productId, orderId });
    if (existingReview) {
      const error = new Error(
        "You have already reviewed this product for this order",
      );
      error.statusCode = 400;
      throw error;
    }

    // Get user name for the review
    const User = require("../models/user.model");
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const review = new Review({
      userId,
      productId,
      orderId,
      userName: user.name,
      rating,
      title,
      comment,
      images,
      isApproved: true, // Auto-approve for now
    });

    await review.save();

    // Update product rating
    await this._updateProductRating(productId);

    return review;
  }

  /**
   * Update review
   */
  async update(reviewId, userId, updateData) {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      throw error;
    }

    const { rating, title, comment, images } = updateData;
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Update product rating
    await this._updateProductRating(review.productId);

    return review;
  }

  /**
   * Delete review
   */
  async delete(reviewId, userId) {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      throw error;
    }

    const productId = review.productId;
    await review.deleteOne();

    // Update product rating
    await this._updateProductRating(productId);

    return { message: "Review deleted successfully" };
  }

  /**
   * Get all reviews (Admin)
   */
  async getAll(options = {}) {
    const { page = 1, limit = 20, isApproved, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const filter = {};
    if (typeof isApproved === "boolean") filter.isApproved = isApproved;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "firstName lastName email")
        .populate("productId", "name images")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: parseInt(page) < Math.ceil(total / limit),
        hasPrevPage: parseInt(page) > 1,
      },
    };
  }

  /**
   * Approve/reject review (Admin)
   */
  async toggleApproval(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      throw error;
    }

    review.isApproved = !review.isApproved;
    await review.save();

    // Update product rating
    await this._updateProductRating(review.productId);

    return review;
  }

  /**
   * Update product rating (helper)
   */
  async _updateProductRating(productId) {
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const ratingData = stats[0] || { averageRating: 0, reviewCount: 0 };

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(ratingData.averageRating * 10) / 10 || 0,
      reviewCount: ratingData.reviewCount || 0,
    });
  }
}

module.exports = new ReviewService();

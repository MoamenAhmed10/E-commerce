const reviewService = require("../services/review.service");

/**
 * Get reviews for a product
 */
exports.getByProduct = async (req, res, next) => {
  try {
    const result = await reviewService.getByProductId(
      req.params.productId,
      req.query,
    );
    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's reviews
 */
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getByUserId(req.user._id);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Create review
 */
exports.create = async (req, res, next) => {
  try {
    const review = await reviewService.create(req.user._id, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review
 */
exports.update = async (req, res, next) => {
  try {
    const review = await reviewService.update(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 */
exports.delete = async (req, res, next) => {
  try {
    const result = await reviewService.delete(req.params.id, req.user._id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews (Admin)
 */
exports.getAll = async (req, res, next) => {
  try {
    const result = await reviewService.getAll(req.query);
    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle review approval (Admin)
 */
exports.toggleApproval = async (req, res, next) => {
  try {
    const review = await reviewService.toggleApproval(req.params.id);
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

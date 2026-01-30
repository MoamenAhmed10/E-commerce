const testimonialService = require("../services/testimonial.service");

/**
 * Get approved testimonials for homepage
 */
exports.getApproved = async (req, res, next) => {
  try {
    const result = await testimonialService.getApproved(req.query);
    res.json({
      success: true,
      data: result.testimonials,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's testimonial
 */
exports.getMyTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.getByUserId(req.user._id);
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

/**
 * Create testimonial
 */
exports.create = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.create(req.user._id, req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

/**
 * Update testimonial
 */
exports.update = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.update(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete testimonial
 */
exports.delete = async (req, res, next) => {
  try {
    const result = await testimonialService.delete(req.params.id, req.user._id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all testimonials (Admin)
 */
exports.getAll = async (req, res, next) => {
  try {
    const result = await testimonialService.getAll(req.query);
    res.json({
      success: true,
      data: result.testimonials,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle approval status (Admin)
 */
exports.toggleApproval = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.toggleApproval(req.params.id);
    res.json({
      success: true,
      data: testimonial,
      message: testimonial.isApproved
        ? "Testimonial approved"
        : "Testimonial unapproved",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin delete testimonial
 */
exports.adminDelete = async (req, res, next) => {
  try {
    const result = await testimonialService.adminDelete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

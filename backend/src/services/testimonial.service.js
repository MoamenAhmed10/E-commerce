const Testimonial = require("../models/testimonial.model");
const User = require("../models/user.model");

class TestimonialService {
  /**
   * Get all approved testimonials for homepage
   */
  async getApproved(options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const filter = { isApproved: true, isDeleted: false };

    const [testimonials, total] = await Promise.all([
      Testimonial.find(filter)
        .populate("userId", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Testimonial.countDocuments(filter),
    ]);

    return {
      testimonials,
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
   * Get user's testimonial
   */
  async getByUserId(userId) {
    return Testimonial.findOne({ userId, isDeleted: false });
  }

  /**
   * Create testimonial
   */
  async create(userId, testimonialData) {
    const { rating, title, content } = testimonialData;

    // Check if user already has a testimonial
    const existingTestimonial = await Testimonial.findOne({
      userId,
      isDeleted: false,
    });
    if (existingTestimonial) {
      const error = new Error("You have already submitted a testimonial");
      error.statusCode = 400;
      throw error;
    }

    // Get user name
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const testimonial = await Testimonial.create({
      userId,
      userName,
      rating,
      title,
      content,
      isApproved: false,
    });

    return testimonial;
  }

  /**
   * Update testimonial
   */
  async update(testimonialId, userId, updateData) {
    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      userId,
      isDeleted: false,
    });

    if (!testimonial) {
      const error = new Error("Testimonial not found");
      error.statusCode = 404;
      throw error;
    }

    const { rating, title, content } = updateData;

    if (rating) testimonial.rating = rating;
    if (title) testimonial.title = title;
    if (content) testimonial.content = content;

    // Reset approval when user updates
    testimonial.isApproved = false;

    await testimonial.save();
    return testimonial;
  }

  /**
   * Delete testimonial
   */
  async delete(testimonialId, userId) {
    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      userId,
      isDeleted: false,
    });

    if (!testimonial) {
      const error = new Error("Testimonial not found");
      error.statusCode = 404;
      throw error;
    }

    testimonial.isDeleted = true;
    await testimonial.save();

    return { message: "Testimonial deleted successfully" };
  }

  /**
   * Get all testimonials (Admin)
   */
  async getAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      isApproved,
      search,
    } = options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (isApproved !== undefined) {
      filter.isApproved = isApproved === "true";
    }

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const [testimonials, total] = await Promise.all([
      Testimonial.find(filter)
        .populate("userId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Testimonial.countDocuments(filter),
    ]);

    return {
      testimonials,
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
   * Toggle approval status (Admin)
   */
  async toggleApproval(testimonialId) {
    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      isDeleted: false,
    });

    if (!testimonial) {
      const error = new Error("Testimonial not found");
      error.statusCode = 404;
      throw error;
    }

    testimonial.isApproved = !testimonial.isApproved;
    await testimonial.save();

    return testimonial;
  }

  /**
   * Admin delete testimonial
   */
  async adminDelete(testimonialId) {
    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      isDeleted: false,
    });

    if (!testimonial) {
      const error = new Error("Testimonial not found");
      error.statusCode = 404;
      throw error;
    }

    testimonial.isDeleted = true;
    await testimonial.save();

    return { message: "Testimonial deleted successfully" };
  }
}

module.exports = new TestimonialService();

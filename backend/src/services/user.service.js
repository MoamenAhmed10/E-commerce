const User = require("../models/user.model");
const { paginate } = require("../utils/pagination");

class UserService {
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} User
   */
  async getById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateProfile(userId, updateData) {
    const { name, email, mobile } = updateData;

    // Check for duplicate email/mobile
    if (email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        const error = new Error("Email already in use");
        error.statusCode = 400;
        throw error;
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({
        mobile,
        _id: { $ne: userId },
      });
      if (existingMobile) {
        const error = new Error("Mobile number already in use");
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email: email || undefined,
        mobile: mobile || undefined,
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  /**
   * Get all users (Admin)
   * @param {Object} options - Query options
   * @returns {Object} Users with pagination
   */
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, role, isActive, search } = options;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: paginate(total, page, limit),
    };
  }

  /**
   * Toggle user active status (Admin)
   * @param {string} userId - User ID
   * @returns {Object} Updated user
   */
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  /**
   * Soft delete user (Admin)
   * @param {string} userId - User ID
   * @returns {Object} Success message
   */
  async softDeleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    return { message: "User deleted successfully" };
  }
}

module.exports = new UserService();

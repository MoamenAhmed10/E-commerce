const userService = require("../services/user.service");
const ApiResponse = require("../utils/response");

class UserController {
  /**
   * GET /api/v1/users/me
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await userService.getById(req.user._id);
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/me
   * Update current user profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user._id, req.body);
      return ApiResponse.success(res, user, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/me/password
   * Change current user password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        req.user._id,
        currentPassword,
        newPassword,
      );
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/users (Admin)
   * Get all users with pagination
   */
  async getAllUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      return ApiResponse.paginated(res, result.users, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/users/:id/toggle-status (Admin)
   * Toggle user active status
   */
  async toggleUserStatus(req, res, next) {
    try {
      const user = await userService.toggleUserStatus(req.params.id);
      return ApiResponse.success(res, user, "User status updated");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/users/:id (Admin)
   * Soft delete user
   */
  async deleteUser(req, res, next) {
    try {
      const result = await userService.softDeleteUser(req.params.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

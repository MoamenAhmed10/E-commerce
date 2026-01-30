const authService = require("../services/auth.service");
const ApiResponse = require("../utils/response");

class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.created(res, result, "Registration successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  async login(req, res, next) {
    try {
      const { emailOrMobile, password, guestCart } = req.body;

      // Get sessionId from headers for guest cart merging
      const sessionId = req.headers["x-session-id"];

      const result = await authService.login(
        emailOrMobile,
        password,
        sessionId,
      );

      // Legacy support: Merge guest cart if provided in body
      if (guestCart && guestCart.length > 0) {
        await authService.mergeGuestCart(result.user.id, guestCart);
      }

      return ApiResponse.success(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user (client-side token removal)
   */
  async logout(req, res, next) {
    try {
      // JWT is stateless, so logout is handled client-side
      // This endpoint is for future session management if needed
      return ApiResponse.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

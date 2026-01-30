const ApiResponse = require("../utils/response");
const { ROLES } = require("../constants/roles");

/**
 * Admin Middleware
 * Must be used after auth middleware
 * Checks if user has admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, "Authentication required");
  }

  if (req.user.role !== ROLES.ADMIN) {
    return ApiResponse.forbidden(res, "Admin access required");
  }

  next();
};

module.exports = { isAdmin };

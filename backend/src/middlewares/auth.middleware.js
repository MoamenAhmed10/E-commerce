const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiResponse = require("../utils/response");
const { jwtSecret } = require("../config/env");

/**
 * Authentication Middleware
 * Validates JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(res, "No token provided");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Find user
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return ApiResponse.unauthorized(res, "User not found");
    }

    if (!user.isActive) {
      return ApiResponse.unauthorized(res, "Account is deactivated");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return ApiResponse.unauthorized(res, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Token expired");
    }
    return ApiResponse.error(res, "Authentication failed");
  }
};

/**
 * Optional Auth Middleware
 * Attaches user if token exists, but doesn't require it
 * For guests, uses sessionId from header or generates one
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id).select("-passwordHash");

      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    }

    // For guest users, get sessionId from header
    const sessionId = req.headers["x-session-id"];
    if (sessionId) {
      req.sessionId = sessionId;
    }

    next();
  } catch (error) {
    // For guest users, get sessionId from header
    const sessionId = req.headers["x-session-id"];
    if (sessionId) {
      req.sessionId = sessionId;
    }
    next();
  }
};

module.exports = { auth, optionalAuth };

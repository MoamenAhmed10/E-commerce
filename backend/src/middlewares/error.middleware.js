const ApiResponse = require("../utils/response");
const { nodeEnv } = require("../config/env");

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.badRequest(res, "Validation failed", errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.badRequest(res, `${field} already exists`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return ApiResponse.badRequest(res, "Invalid ID format");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.unauthorized(res, "Token expired");
  }

  // Custom app error with statusCode
  if (err.statusCode) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Default error
  const message =
    nodeEnv === "development" ? err.message : "Internal server error";
  return ApiResponse.error(res, message, 500);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};

module.exports = { errorHandler, notFoundHandler };

const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/response");

/**
 * Validation Middleware
 * Use after express-validator checks to process results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return ApiResponse.badRequest(res, "Validation failed", errorMessages);
  }

  next();
};

module.exports = validate;

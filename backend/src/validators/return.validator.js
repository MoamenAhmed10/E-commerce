const { body } = require("express-validator");

exports.create = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Reason must be between 10 and 1000 characters"),
];

exports.updateStatus = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["approved", "rejected", "received", "refunded", "cancelled"])
    .withMessage("Invalid return status"),
  body("adminNotes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Admin notes cannot exceed 500 characters"),
];

const { body } = require("express-validator");
const { ORDER_STATUS } = require("../constants/order-status");

exports.create = [
  body("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

exports.updateStatus = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Object.values(ORDER_STATUS))
    .withMessage("Invalid order status"),
];

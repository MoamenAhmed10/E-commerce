const { body } = require("express-validator");

exports.addItem = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
  body("sizeId").optional().isMongoId().withMessage("Invalid size ID"),
  body("quantity")
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage("Quantity must be between 1 and 99"),
];

exports.updateItem = [
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0, max: 99 })
    .withMessage("Quantity must be between 0 and 99"),
];

const { body } = require("express-validator");

exports.create = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("comparePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Compare price must be a positive number"),
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID"),
  body("subcategoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*").isURL().withMessage("Each image must be a valid URL"),
  body("sizes")
    .isArray({ min: 1 })
    .withMessage("At least one size variant is required"),
  body("sizes.*.size").notEmpty().withMessage("Size is required"),
  body("sizes.*.color").notEmpty().withMessage("Color is required"),
  body("sizes.*.stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("material")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Material cannot exceed 100 characters"),
  body("careInstructions")
    .optional()
    .isArray()
    .withMessage("Care instructions must be an array"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),
];

exports.update = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("comparePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Compare price must be a positive number"),
  body("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  body("subcategoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),
  body("images")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),
  body("sizes")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one size variant is required"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),
];

exports.updateStock = [
  body("sizeId")
    .notEmpty()
    .withMessage("Size ID is required")
    .isMongoId()
    .withMessage("Invalid size ID"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt()
    .withMessage("Quantity must be an integer"),
];

const { body } = require("express-validator");

exports.create = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Content must be between 10 and 500 characters"),
];

exports.update = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Content must be between 10 and 500 characters"),
];

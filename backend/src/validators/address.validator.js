const { body } = require("express-validator");

const addressValidator = [
  body("label")
    .optional()
    .isIn(["Home", "Office", "Other"])
    .withMessage("Label must be Home, Office, or Other"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("area").trim().notEmpty().withMessage("Area is required"),

  body("street").trim().notEmpty().withMessage("Street is required"),

  body("building").trim().notEmpty().withMessage("Building is required"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Notes cannot exceed 200 characters"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

module.exports = {
  addressValidator,
};

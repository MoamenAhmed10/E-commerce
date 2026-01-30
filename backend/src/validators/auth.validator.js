const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),

  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("mobile")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Please enter a valid mobile number (10-15 digits)"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  // Custom validation: either email or mobile required
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.mobile) {
      throw new Error("Either email or mobile number is required");
    }
    return true;
  }),
];

const loginValidator = [
  body("emailOrMobile")
    .trim()
    .notEmpty()
    .withMessage("Email or mobile is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};

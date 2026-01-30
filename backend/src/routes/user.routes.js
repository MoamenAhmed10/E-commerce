const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/user.validator");
const validate = require("../middlewares/validate.middleware");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", auth, userController.getProfile);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  "/me",
  auth,
  updateProfileValidator,
  validate,
  userController.updateProfile,
);

/**
 * @route   PUT /api/v1/users/me/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  "/me/password",
  auth,
  changePasswordValidator,
  validate,
  userController.changePassword,
);

module.exports = router;

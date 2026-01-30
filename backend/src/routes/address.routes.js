const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller");
const { addressValidator } = require("../validators/address.validator");
const validate = require("../middlewares/validate.middleware");
const { auth } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/v1/addresses
 * @desc    Get all user addresses
 * @access  Private
 */
router.get("/", addressController.getAddresses);

/**
 * @route   GET /api/v1/addresses/:id
 * @desc    Get address by ID
 * @access  Private
 */
router.get("/:id", addressController.getAddress);

/**
 * @route   POST /api/v1/addresses
 * @desc    Create new address
 * @access  Private
 */
router.post("/", addressValidator, validate, addressController.createAddress);

/**
 * @route   PUT /api/v1/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put("/:id", addressValidator, validate, addressController.updateAddress);

/**
 * @route   PUT /api/v1/addresses/:id/default
 * @desc    Set address as default
 * @access  Private
 */
router.put("/:id/default", addressController.setDefault);

/**
 * @route   DELETE /api/v1/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete("/:id", addressController.deleteAddress);

module.exports = router;

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { optionalAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const cartValidator = require("../validators/cart.validator");

// All cart routes support both authenticated and guest users
router.get("/", optionalAuth, cartController.getCart);

router.post(
  "/items",
  optionalAuth,
  cartValidator.addItem,
  validate,
  cartController.addItem,
);

router.put(
  "/items/:itemId",
  optionalAuth,
  cartValidator.updateItem,
  validate,
  cartController.updateItem,
);

router.delete("/items/:itemId", optionalAuth, cartController.removeItem);

router.delete("/", optionalAuth, cartController.clearCart);

module.exports = router;

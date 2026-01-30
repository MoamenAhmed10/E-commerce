const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const productValidator = require("../validators/product.validator");

// Public routes
router.get("/", productController.getAll);
router.get("/featured", productController.getFeatured);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/slug/:slug", productController.getBySlug);
router.get("/:id", productController.getById);

// Admin routes
router.post(
  "/",
  auth,
  isAdmin,
  productValidator.create,
  validate,
  productController.create,
);

router.put(
  "/:id",
  auth,
  isAdmin,
  productValidator.update,
  validate,
  productController.update,
);

router.patch(
  "/:id/stock",
  auth,
  isAdmin,
  productValidator.updateStock,
  validate,
  productController.updateStock,
);

router.patch(
  "/:id/toggle-status",
  auth,
  isAdmin,
  productController.toggleStatus,
);

router.patch(
  "/:id/toggle-featured",
  auth,
  isAdmin,
  productController.toggleFeatured,
);

router.delete("/:id", auth, isAdmin, productController.delete);

module.exports = router;

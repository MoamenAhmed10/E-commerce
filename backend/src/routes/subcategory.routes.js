const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/subcategory.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const subcategoryValidator = require("../validators/subcategory.validator");

// Public routes
router.get("/", subcategoryController.getAll);
router.get("/:id", subcategoryController.getById);

// Admin routes
router.post(
  "/",
  auth,
  isAdmin,
  subcategoryValidator.create,
  validate,
  subcategoryController.create,
);

router.put(
  "/:id",
  auth,
  isAdmin,
  subcategoryValidator.update,
  validate,
  subcategoryController.update,
);

router.patch(
  "/:id/toggle-status",
  auth,
  isAdmin,
  subcategoryController.toggleStatus,
);

router.delete("/:id", auth, isAdmin, subcategoryController.delete);

module.exports = router;

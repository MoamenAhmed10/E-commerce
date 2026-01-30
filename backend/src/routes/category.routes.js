const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const categoryValidator = require("../validators/category.validator");

// Public routes
router.get("/", categoryController.getAll);
router.get("/slug/:slug", categoryController.getBySlug);
router.get("/:id", categoryController.getById);

// Admin routes
router.post(
  "/",
  auth,
  isAdmin,
  categoryValidator.create,
  validate,
  categoryController.create,
);

router.put(
  "/:id",
  auth,
  isAdmin,
  categoryValidator.update,
  validate,
  categoryController.update,
);

router.patch(
  "/:id/toggle-status",
  auth,
  isAdmin,
  categoryController.toggleStatus,
);

router.delete("/:id", auth, isAdmin, categoryController.delete);

module.exports = router;

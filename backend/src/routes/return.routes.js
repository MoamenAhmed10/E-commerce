const express = require("express");
const router = express.Router();
const returnController = require("../controllers/return.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const returnValidator = require("../validators/return.validator");

// User routes
router.get("/my-returns", auth, returnController.getMyReturns);
router.get("/:id", auth, returnController.getById);

router.post(
  "/",
  auth,
  returnValidator.create,
  validate,
  returnController.create,
);

router.patch("/:id/cancel", auth, returnController.cancel);

// Admin routes
router.get("/", auth, isAdmin, returnController.getAll);

router.patch(
  "/:id/status",
  auth,
  isAdmin,
  returnValidator.updateStatus,
  validate,
  returnController.updateStatus,
);

module.exports = router;

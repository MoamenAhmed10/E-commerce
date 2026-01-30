const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const reviewValidator = require("../validators/review.validator");

// Public routes
router.get("/product/:productId", reviewController.getByProduct);

// User routes
router.get("/my-reviews", auth, reviewController.getMyReviews);

router.post(
  "/",
  auth,
  reviewValidator.create,
  validate,
  reviewController.create,
);

router.put(
  "/:id",
  auth,
  reviewValidator.update,
  validate,
  reviewController.update,
);

router.delete("/:id", auth, reviewController.delete);

// Admin routes
router.get("/", auth, isAdmin, reviewController.getAll);

router.patch(
  "/:id/toggle-approval",
  auth,
  isAdmin,
  reviewController.toggleApproval,
);

module.exports = router;

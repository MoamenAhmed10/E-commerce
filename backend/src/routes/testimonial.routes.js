const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonial.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const testimonialValidator = require("../validators/testimonial.validator");

// Public routes - get approved testimonials for homepage
router.get("/approved", testimonialController.getApproved);

// User routes
router.get("/my-testimonial", auth, testimonialController.getMyTestimonial);

router.post(
  "/",
  auth,
  testimonialValidator.create,
  validate,
  testimonialController.create,
);

router.put(
  "/:id",
  auth,
  testimonialValidator.update,
  validate,
  testimonialController.update,
);

router.delete("/:id", auth, testimonialController.delete);

// Admin routes
router.get("/", auth, isAdmin, testimonialController.getAll);

router.patch(
  "/:id/toggle-approval",
  auth,
  isAdmin,
  testimonialController.toggleApproval,
);

router.delete("/:id/admin", auth, isAdmin, testimonialController.adminDelete);

module.exports = router;

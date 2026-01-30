const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const orderValidator = require("../validators/order.validator");

// User routes
router.get("/my-orders", auth, orderController.getMyOrders);
router.get("/:id", auth, orderController.getById);

router.post("/", auth, orderValidator.create, validate, orderController.create);

router.patch("/:id/cancel", auth, orderController.cancel);

// Admin routes
router.get("/", auth, isAdmin, orderController.getAll);

router.get("/admin/statistics", auth, isAdmin, orderController.getStatistics);

router.patch(
  "/:id/status",
  auth,
  isAdmin,
  orderValidator.updateStatus,
  validate,
  orderController.updateStatus,
);

module.exports = router;

const express = require("express");
const router = express.Router();

// Import controllers from flat structure
const userController = require("../controllers/user.controller");
const productController = require("../controllers/product.controller");
const orderController = require("../controllers/order.controller");
const reviewController = require("../controllers/review.controller");
const returnController = require("../controllers/return.controller");
const categoryController = require("../controllers/category.controller");
const subcategoryController = require("../controllers/subcategory.controller");

// Import middlewares
const { auth } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

// Import validators
const orderValidator = require("../validators/order.validator");
const returnValidator = require("../validators/return.validator");

// All admin routes require authentication and admin role
router.use(auth, isAdmin);

// ============================================
// Dashboard Statistics
// ============================================
router.get("/dashboard/stats", async (req, res, next) => {
  try {
    const Order = require("../models/order.model");
    const User = require("../models/user.model");
    const Product = require("../models/product.model");
    const Review = require("../models/review.model");

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Today's stats
    const todayOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      {
        $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } },
      },
    ]);

    // This month's stats
    const thisMonthOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } },
      },
    ]);

    // Last month's stats (for growth calculation)
    const lastMonthOrders = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } },
      },
      {
        $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } },
      },
    ]);

    // Calculate growth
    const thisMonthCount = thisMonthOrders[0]?.count || 0;
    const thisMonthRevenue = thisMonthOrders[0]?.revenue || 0;
    const lastMonthCount = lastMonthOrders[0]?.count || 1; // Avoid division by zero
    const lastMonthRevenue = lastMonthOrders[0]?.revenue || 1;

    const ordersGrowth = (
      ((thisMonthCount - lastMonthCount) / lastMonthCount) *
      100
    ).toFixed(1);
    const revenueGrowth = (
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
      100
    ).toFixed(1);

    // Get counts
    const [
      totalUsers,
      totalProducts,
      lowStockCount,
      pendingReviewsCount,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ isDeleted: { $ne: true }, stock: { $lte: 3 } }),
      Review.countDocuments({ isApproved: false, isDeleted: { $ne: true } }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      data: {
        today: {
          count: todayOrders[0]?.count || 0,
          revenue: todayOrders[0]?.revenue || 0,
        },
        thisMonth: {
          count: thisMonthCount,
          revenue: thisMonthRevenue,
        },
        growth: {
          orders: parseFloat(ordersGrowth) || 0,
          revenue: parseFloat(revenueGrowth) || 0,
        },
        totalUsers,
        totalProducts,
        lowStockProducts: lowStockCount,
        pendingReviews: pendingReviewsCount,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// User Management
// ============================================
router.get("/users", userController.getAllUsers);
router.patch("/users/:id/toggle-status", userController.toggleUserStatus);
router.delete("/users/:id", userController.deleteUser);

// ============================================
// Product Management
// ============================================
router.get("/products", productController.getAll);
router.post("/products", productController.create);
router.put("/products/:id", productController.update);
router.patch("/products/:id/toggle-status", productController.toggleStatus);
router.patch("/products/:id/toggle-featured", productController.toggleFeatured);
router.patch("/products/:id/stock", productController.updateStock);
router.delete("/products/:id", productController.delete);

// ============================================
// Category Management (using category controller)
// ============================================
router.get("/categories", categoryController.getAll);
router.post("/categories", categoryController.create);
router.put("/categories/:id", categoryController.update);
router.patch("/categories/:id/toggle-status", categoryController.toggleStatus);
router.delete("/categories/:id", categoryController.delete);

// ============================================
// Subcategory Management
// ============================================
router.get("/subcategories", subcategoryController.getAll);
router.post("/subcategories", subcategoryController.create);
router.put("/subcategories/:id", subcategoryController.update);
router.patch(
  "/subcategories/:id/toggle-status",
  subcategoryController.toggleStatus,
);
router.delete("/subcategories/:id", subcategoryController.delete);

// ============================================
// Order Management
// ============================================
router.get("/orders", orderController.getAll);
router.get("/orders/statistics", orderController.getStatistics);
router.get("/orders/:id", orderController.getById);
router.patch("/orders/:id/status", orderController.updateStatus);
router.patch("/orders/:id/cancel", orderController.cancel);

// ============================================
// Review Management
// ============================================
router.get("/reviews", reviewController.getAll);
router.patch("/reviews/:id/toggle-approval", reviewController.toggleApproval);
router.delete("/reviews/:id", reviewController.delete);

// ============================================
// Return Management
// ============================================
router.get("/returns", returnController.getAll);
router.get("/returns/:id", returnController.getById);
router.patch("/returns/:id/status", returnController.updateStatus);

// ============================================
// Reports
// ============================================
const reportService = require("../services/report.service");

// Export sales report as PDF or Excel
router.get("/reports/sales/export", async (req, res, next) => {
  try {
    const { type = "pdf", startDate, endDate, from, to } = req.query;
    // Support both parameter naming conventions
    const fromDate = startDate || from;
    const toDate = endDate || to;

    if (type === "pdf") {
      const pdfBuffer = await reportService.generatePDFReport(fromDate, toDate);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${Date.now()}.pdf`,
      );
      res.send(pdfBuffer);
    } else if (type === "excel") {
      const excelBuffer = await reportService.generateExcelReport(
        fromDate,
        toDate,
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${Date.now()}.xlsx`,
      );
      res.send(excelBuffer);
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid export type. Use 'pdf' or 'excel'.",
        });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/reports/sales", async (req, res, next) => {
  try {
    const Order = require("../models/order.model");
    const { startDate, endDate, from, to } = req.query;
    // Support both parameter naming conventions
    const fromDate = startDate || from;
    const toDate = endDate || to;

    const matchStage = {};
    if (fromDate || toDate) {
      matchStage.createdAt = {};
      if (fromDate) matchStage.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        // Set end date to end of day (23:59:59.999)
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = endOfDay;
      }
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$subtotal" },
          itemsSold: { $sum: "$totalItems" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$subtotal" },
          totalItemsSold: { $sum: "$totalItems" },
        },
      },
    ]);

    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        dailySales: salesData,
        summary: summary[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalItemsSold: 0,
        },
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

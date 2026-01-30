const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Review = require("../models/review.model");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

class ReportService {
  /**
   * Get sales report for date range
   */
  async getSalesReport(fromDate, toDate) {
    const filter = {};
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Exclude cancelled and refused orders from revenue
    filter.status = { $nin: ["cancelled", "refused"] };

    const [salesData, dailySales, topProducts] = await Promise.all([
      // Aggregate sales data
      Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$subtotal" },
            totalItemsSold: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this.quantity"] },
                },
              },
            },
          },
        },
      ]),
      // Daily breakdown
      Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: { $sum: "$subtotal" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Top selling products
      Order.aggregate([
        { $match: filter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            productName: { $first: "$items.productName" },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      summary: salesData[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
      },
      dailySales,
      topProducts,
      dateRange: { from: fromDate, to: toDate },
    };
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(fromDate, toDate) {
    const reportData = await this.getSalesReport(fromDate, toDate);

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(24).text("Sales Report", { align: "center" });
      doc.moveDown();

      // Date range
      doc
        .fontSize(12)
        .text(`Period: ${fromDate || "All time"} to ${toDate || "Present"}`, {
          align: "center",
        });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).text("Summary", { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Orders: ${reportData.summary.totalOrders}`);
      doc.text(`Total Revenue: $${reportData.summary.totalRevenue.toFixed(2)}`);
      doc.text(`Total Items Sold: ${reportData.summary.totalItemsSold}`);
      doc.moveDown(2);

      // Top Products
      doc.fontSize(16).text("Top 10 Products", { underline: true });
      doc.moveDown();
      doc.fontSize(10);

      reportData.topProducts.forEach((product, index) => {
        doc.text(
          `${index + 1}. ${product.productName} - Qty: ${product.totalQuantity}, Revenue: $${product.totalRevenue.toFixed(2)}`,
        );
      });

      doc.moveDown(2);

      // Daily Sales
      if (reportData.dailySales.length > 0) {
        doc.fontSize(16).text("Daily Sales", { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        reportData.dailySales.forEach((day) => {
          doc.text(
            `${day._id}: ${day.orders} orders, $${day.revenue.toFixed(2)}`,
          );
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, {
        align: "center",
      });

      doc.end();
    });
  }

  /**
   * Generate Excel report
   */
  async generateExcelReport(fromDate, toDate) {
    const reportData = await this.getSalesReport(fromDate, toDate);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "E-Commerce Admin";
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 20 },
    ];

    summarySheet.addRows([
      {
        metric: "Report Period",
        value: `${fromDate || "All time"} to ${toDate || "Present"}`,
      },
      { metric: "Total Orders", value: reportData.summary.totalOrders },
      {
        metric: "Total Revenue",
        value: `$${reportData.summary.totalRevenue.toFixed(2)}`,
      },
      { metric: "Total Items Sold", value: reportData.summary.totalItemsSold },
      { metric: "Generated At", value: new Date().toLocaleString() },
    ]);

    // Style header row
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Top Products Sheet
    const productsSheet = workbook.addWorksheet("Top Products");
    productsSheet.columns = [
      { header: "Rank", key: "rank", width: 8 },
      { header: "Product Name", key: "productName", width: 40 },
      { header: "Quantity Sold", key: "quantity", width: 15 },
      { header: "Revenue", key: "revenue", width: 15 },
    ];

    reportData.topProducts.forEach((product, index) => {
      productsSheet.addRow({
        rank: index + 1,
        productName: product.productName,
        quantity: product.totalQuantity,
        revenue: `$${product.totalRevenue.toFixed(2)}`,
      });
    });

    productsSheet.getRow(1).font = { bold: true };
    productsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    productsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Daily Sales Sheet
    const dailySheet = workbook.addWorksheet("Daily Sales");
    dailySheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Orders", key: "orders", width: 12 },
      { header: "Revenue", key: "revenue", width: 15 },
    ];

    reportData.dailySales.forEach((day) => {
      dailySheet.addRow({
        date: day._id,
        orders: day.orders,
        revenue: `$${day.revenue.toFixed(2)}`,
      });
    });

    dailySheet.getRow(1).font = { bold: true };
    dailySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    dailySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      todayOrders,
      monthOrders,
      lastMonthOrders,
      totalUsers,
      totalProducts,
      lowStockProducts,
      pendingReviews,
      recentOrders,
    ] = await Promise.all([
      // Today's orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            status: { $nin: ["Cancelled", "Refused"] },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: "$subtotal" },
          },
        },
      ]),
      // This month's orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: { $nin: ["Cancelled", "Refused"] },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: "$subtotal" },
          },
        },
      ]),
      // Last month's orders (for comparison)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $nin: ["Cancelled", "Refused"] },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: "$subtotal" },
          },
        },
      ]),
      // Total users
      User.countDocuments({ role: "user", isActive: true }),
      // Total active products
      Product.countDocuments({ isActive: true, isDeleted: false }),
      // Low stock products
      Product.countDocuments({
        stock: { $lte: 3 },
        isActive: true,
        isDeleted: false,
      }),
      // Pending reviews
      Review.countDocuments({ isApproved: false }),
      // Recent orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber status subtotal createdAt customerSnapshot.name"),
    ]);

    const thisMonth = monthOrders[0] || { count: 0, revenue: 0 };
    const lastMonth = lastMonthOrders[0] || { count: 0, revenue: 0 };

    // Calculate growth percentages
    const orderGrowth =
      lastMonth.count > 0
        ? (
            ((thisMonth.count - lastMonth.count) / lastMonth.count) *
            100
          ).toFixed(1)
        : 0;
    const revenueGrowth =
      lastMonth.revenue > 0
        ? (
            ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) *
            100
          ).toFixed(1)
        : 0;

    return {
      today: todayOrders[0] || { count: 0, revenue: 0 },
      thisMonth: thisMonth,
      growth: {
        orders: parseFloat(orderGrowth),
        revenue: parseFloat(revenueGrowth),
      },
      totalUsers,
      totalProducts,
      lowStockProducts,
      pendingReviews,
      recentOrders,
    };
  }
}

module.exports = new ReportService();

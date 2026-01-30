const Return = require("../models/return.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { ORDER_STATUS } = require("../constants/order-status");

class ReturnService {
  /**
   * Get all returns (Admin)
   */
  async getAll(options = {}) {
    const { page = 1, limit = 20, status, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const [returns, total] = await Promise.all([
      Return.find(filter)
        .populate("userId", "firstName lastName email")
        .populate({
          path: "orderId",
          select: "orderNumber",
          options: { virtuals: false },
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Return.countDocuments(filter),
    ]);

    return {
      returns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: parseInt(page) < Math.ceil(total / limit),
        hasPrevPage: parseInt(page) > 1,
      },
    };
  }

  /**
   * Get returns by user
   */
  async getByUserId(userId) {
    return Return.find({ userId })
      .populate("orderId", "orderNumber items total")
      .sort("-createdAt");
  }

  /**
   * Get return by ID
   */
  async getById(returnId, userId = null) {
    const filter = { _id: returnId };
    if (userId) filter.userId = userId;

    const returnRequest = await Return.findOne(filter)
      .populate("userId", "firstName lastName email")
      .populate("orderId", "orderNumber items total shippingAddress");

    if (!returnRequest) {
      const error = new Error("Return request not found");
      error.statusCode = 404;
      throw error;
    }

    return returnRequest;
  }

  /**
   * Create return request
   */
  async create(userId, returnData) {
    const { orderId, reason } = returnData;

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    // Verify order is delivered/received
    if (order.status !== ORDER_STATUS.RECEIVED) {
      const error = new Error("Only received orders can be returned");
      error.statusCode = 400;
      throw error;
    }

    // Check return window (14 days)
    const deliveredDate = order.deliveredAt || order.updatedAt;
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceDelivery > 14) {
      const error = new Error("Return window has expired (14 days)");
      error.statusCode = 400;
      throw error;
    }

    // Check for existing return request
    const existingReturn = await Return.findOne({
      orderId,
      userId,
      status: { $nin: ["rejected", "cancelled"] },
    });
    if (existingReturn) {
      const error = new Error("A return request already exists for this order");
      error.statusCode = 400;
      throw error;
    }

    // Create return items from all order items
    const returnItems = order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      reason: reason,
    }));

    const returnRequest = new Return({
      userId,
      orderId,
      items: returnItems,
      reason,
      status: "requested",
    });

    await returnRequest.save();
    return returnRequest;
  }

  /**
   * Update return status (Admin)
   */
  async updateStatus(returnId, newStatus, adminNotes = "") {
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      const error = new Error("Return request not found");
      error.statusCode = 404;
      throw error;
    }

    const validTransitions = {
      requested: ["approved", "rejected"],
      approved: ["received", "cancelled"],
      received: ["refunded"],
    };

    if (!validTransitions[returnRequest.status]?.includes(newStatus)) {
      const error = new Error(
        `Cannot transition from ${returnRequest.status} to ${newStatus}`,
      );
      error.statusCode = 400;
      throw error;
    }

    returnRequest.status = newStatus;
    if (adminNotes) returnRequest.adminNotes = adminNotes;

    // Handle status-specific logic
    if (newStatus === "approved") {
      returnRequest.approvedAt = new Date();
    } else if (newStatus === "received") {
      returnRequest.receivedAt = new Date();
      // Restore stock
      for (const item of returnRequest.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const sizeVariant = product.sizes.find(
            (s) => s.size === item.size && s.color === item.color,
          );
          if (sizeVariant) {
            sizeVariant.stock += item.quantity;
            await product.save();
          }
        }
      }
    } else if (newStatus === "refunded") {
      returnRequest.refundedAt = new Date();
    }

    await returnRequest.save();
    return returnRequest;
  }

  /**
   * Cancel return request
   */
  async cancel(returnId, userId) {
    const returnRequest = await Return.findOne({ _id: returnId, userId });
    if (!returnRequest) {
      const error = new Error("Return request not found");
      error.statusCode = 404;
      throw error;
    }

    if (returnRequest.status !== "pending") {
      const error = new Error("Only pending returns can be cancelled");
      error.statusCode = 400;
      throw error;
    }

    returnRequest.status = "cancelled";
    await returnRequest.save();

    return { message: "Return request cancelled successfully" };
  }
}

module.exports = new ReturnService();

const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Address = require("../models/address.model");
const User = require("../models/user.model");
const { ORDER_STATUS, canTransition } = require("../constants/order-status");

class OrderService {
  /**
   * Get all orders (Admin)
   */
  async getAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      sort = "-createdAt",
    } = options;

    const filter = {};
    // Handle status filter - normalize to lowercase to match stored values
    if (status) filter.status = status.toLowerCase();
    if (userId) filter.userId = userId;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
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
   * Get orders by user
   */
  async getByUserId(userId, options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort(sort).skip(skip).limit(parseInt(limit)),
      Order.countDocuments({ userId }),
    ]);

    return {
      orders,
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
   * Get order by ID
   */
  async getById(orderId, userId = null) {
    const filter = { _id: orderId };
    if (userId) filter.userId = userId;

    const order = await Order.findOne(filter)
      .populate("userId", "name email")
      .populate("items.productId", "name images slug");

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Create order from cart
   */
  async createFromCart(userId, orderData) {
    const { addressId, notes } = orderData;

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Get the shipping address
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 400;
      throw error;
    }

    // Verify stock and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      if (!product || !product.isActive || product.isDeleted) {
        const error = new Error(`Product is no longer available`);
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < cartItem.quantity) {
        const error = new Error(`Insufficient stock for ${product.name}`);
        error.statusCode = 400;
        throw error;
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images[0] || null,
        quantity: cartItem.quantity,
        price: product.price,
        total: itemTotal,
      });

      // Reduce stock
      product.stock -= cartItem.quantity;
      await product.save();
    }

    // Calculate shipping (free over $50)
    const shippingCost = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Build customer snapshot
    const customerSnapshot = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    };

    // Build address snapshot from saved address
    const addressSnapshot = {
      label: address.label,
      city: address.city,
      area: address.area,
      street: address.street,
      building: address.building,
      notes: address.notes,
    };

    // Create order
    const order = new Order({
      orderNumber,
      userId,
      customerSnapshot,
      addressSnapshot,
      items: orderItems,
      notes,
      subtotal,
      shippingCost,
      total,
      status: ORDER_STATUS.PENDING,
      statusHistory: [
        {
          status: ORDER_STATUS.PENDING,
          changedAt: new Date(),
        },
      ],
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    return order;
  }

  /**
   * Update order status (Admin)
   */
  async updateStatus(orderId, newStatus) {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    // Normalize status to lowercase to match ORDER_STATUS values
    const normalizedStatus = newStatus.toLowerCase();

    if (!canTransition(order.status, normalizedStatus)) {
      const error = new Error(
        `Cannot transition from ${order.status} to ${normalizedStatus}`,
      );
      error.statusCode = 400;
      throw error;
    }

    order.status = normalizedStatus;

    // Update timestamps
    if (normalizedStatus === ORDER_STATUS.SHIPPED) {
      order.shippedAt = new Date();
    } else if (normalizedStatus === ORDER_STATUS.RECEIVED) {
      order.deliveredAt = new Date();
    }

    await order.save();
    return order;
  }

  /**
   * Cancel order
   */
  async cancel(orderId, userId = null) {
    const filter = { _id: orderId };
    if (userId) filter.userId = userId;

    const order = await Order.findOne(filter);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (!canTransition(order.status, ORDER_STATUS.CANCELLED)) {
      const error = new Error("Order cannot be cancelled at this stage");
      error.statusCode = 400;
      throw error;
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product && !product.isDeleted) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    await order.save();

    return order;
  }

  /**
   * Get order statistics (Admin)
   */
  async getStatistics() {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    const totalOrders = stats.reduce((acc, s) => acc + s.count, 0);
    const totalRevenue = stats
      .filter((s) => s._id === ORDER_STATUS.DELIVERED)
      .reduce((acc, s) => acc + s.totalRevenue, 0);

    const statusCounts = {};
    stats.forEach((s) => {
      statusCounts[s._id] = s.count;
    });

    return {
      totalOrders,
      totalRevenue,
      statusCounts,
    };
  }
}

module.exports = new OrderService();

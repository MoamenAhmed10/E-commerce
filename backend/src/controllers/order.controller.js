const orderService = require("../services/order.service");

/**
 * Get all orders (Admin)
 */
exports.getAll = async (req, res, next) => {
  try {
    const result = await orderService.getAll(req.query);
    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's orders
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getByUserId(req.user._id, req.query);
    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user._id;
    const order = await orderService.getById(req.params.id, userId);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Create order from cart
 */
exports.create = async (req, res, next) => {
  try {
    const order = await orderService.createFromCart(req.user._id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 */
exports.cancel = async (req, res, next) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user._id;
    const order = await orderService.cancel(req.params.id, userId);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order statistics (Admin)
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await orderService.getStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

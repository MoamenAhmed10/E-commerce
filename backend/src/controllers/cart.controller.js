const cartService = require("../services/cart.service");

/**
 * Get cart
 */
exports.getCart = async (req, res, next) => {
  try {
    const cartIdentifier = req.user
      ? { userId: req.user._id }
      : { sessionId: req.sessionId };

    const cart = await cartService.getCart(cartIdentifier);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
exports.addItem = async (req, res, next) => {
  try {
    const cartIdentifier = req.user
      ? { userId: req.user._id }
      : { sessionId: req.sessionId };

    const cart = await cartService.addItem(cartIdentifier, req.body);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item quantity
 */
exports.updateItem = async (req, res, next) => {
  try {
    const cartIdentifier = req.user
      ? { userId: req.user._id }
      : { sessionId: req.sessionId };

    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(
      cartIdentifier,
      req.params.itemId,
      quantity,
    );
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
exports.removeItem = async (req, res, next) => {
  try {
    const cartIdentifier = req.user
      ? { userId: req.user._id }
      : { sessionId: req.sessionId };

    const cart = await cartService.removeItem(
      cartIdentifier,
      req.params.itemId,
    );
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
exports.clearCart = async (req, res, next) => {
  try {
    const cartIdentifier = req.user
      ? { userId: req.user._id }
      : { sessionId: req.sessionId };

    const result = await cartService.clear(cartIdentifier);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

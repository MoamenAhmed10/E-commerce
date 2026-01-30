const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

class CartService {
  /**
   * Get cart by user ID
   */
  async getByUserId(userId) {
    console.log(`[CART SERVICE] getByUserId called for userId: ${userId}`);

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      console.log(
        `[CART SERVICE] No cart found - creating new empty cart for userId: ${userId}`,
      );
      cart = new Cart({ userId, items: [] });
      await cart.save();
    } else {
      console.log(
        `[CART SERVICE] Found existing cart with ${cart.items.length} items`,
      );
    }

    return this._calculateCartTotals(cart);
  }

  /**
   * Get cart by session ID (guest)
   */
  async getBySessionId(sessionId) {
    let cart = await Cart.findOne({ sessionId }).populate("items.productId");
    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
      await cart.save();
    }
    return this._calculateCartTotals(cart);
  }

  /**
   * Add item to cart
   */
  async addItem(cartIdentifier, itemData) {
    const { productId, quantity = 1 } = itemData;

    // Verify product exists and is available
    const product = await Product.findById(productId);
    if (!product || !product.isActive || product.isDeleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    if (product.stock !== null && product.stock < quantity) {
      const error = new Error("Insufficient stock");
      error.statusCode = 400;
      throw error;
    }

    // Get or create cart
    let cart = await this._getOrCreateCart(cartIdentifier);

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock !== null && product.stock < newQuantity) {
        const error = new Error("Insufficient stock");
        error.statusCode = 400;
        throw error;
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        productImage: product.images[0] || null,
        quantity,
        priceAtAdd: product.price,
      });
    }

    await cart.save();
    return this.getCart(cartIdentifier);
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(cartIdentifier, itemId, quantity) {
    const cart = await this._getCart(cartIdentifier);
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    // Find item by _id or productId
    let item = cart.items.id(itemId);
    if (!item) {
      item = cart.items.find((i) => i.productId.toString() === itemId);
    }
    if (!item) {
      const error = new Error("Item not found in cart");
      error.statusCode = 404;
      throw error;
    }

    // Verify stock
    const product = await Product.findById(item.productId);
    if (product && product.stock !== null && product.stock < quantity) {
      const error = new Error("Insufficient stock");
      error.statusCode = 400;
      throw error;
    }

    if (quantity <= 0) {
      cart.items.pull(item._id);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return this.getCart(cartIdentifier);
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartIdentifier, itemId) {
    const cart = await this._getCart(cartIdentifier);
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    // Find item by _id or productId
    let item = cart.items.id(itemId);
    if (!item) {
      item = cart.items.find((i) => i.productId.toString() === itemId);
    }

    if (item) {
      cart.items.pull(item._id);
    }

    await cart.save();
    return this.getCart(cartIdentifier);
  }

  /**
   * Clear cart
   */
  async clear(cartIdentifier) {
    const cart = await this._getCart(cartIdentifier);
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return { message: "Cart cleared successfully" };
  }

  /**
   * Merge guest cart with user cart
   */
  async mergeGuestCart(userId, sessionId) {
    if (!sessionId) return;

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      userCart = new Cart({ userId, items: [] });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        (item) => item.productId.toString() === guestItem.productId.toString(),
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    await Cart.deleteOne({ sessionId });

    return userCart;
  }

  /**
   * Get cart (helper)
   */
  async getCart(cartIdentifier) {
    if (cartIdentifier.userId) {
      return this.getByUserId(cartIdentifier.userId);
    }
    return this.getBySessionId(cartIdentifier.sessionId);
  }

  /**
   * Get or create cart (helper)
   */
  async _getOrCreateCart(cartIdentifier) {
    if (cartIdentifier.userId) {
      let cart = await Cart.findOne({ userId: cartIdentifier.userId });
      if (!cart) {
        cart = new Cart({ userId: cartIdentifier.userId, items: [] });
      }
      return cart;
    }
    let cart = await Cart.findOne({ sessionId: cartIdentifier.sessionId });
    if (!cart) {
      cart = new Cart({ sessionId: cartIdentifier.sessionId, items: [] });
    }
    return cart;
  }

  /**
   * Get cart (helper)
   */
  async _getCart(cartIdentifier) {
    if (cartIdentifier.userId) {
      return Cart.findOne({ userId: cartIdentifier.userId });
    }
    return Cart.findOne({ sessionId: cartIdentifier.sessionId });
  }

  /**
   * Calculate cart totals
   */
  _calculateCartTotals(cart) {
    const cartObj = cart.toObject();

    let subtotal = 0;
    let itemCount = 0;
    let hasChangedPrices = false;

    cartObj.items = cartObj.items.map((item) => {
      const product = item.productId;
      const productId = product?._id?.toString() || item.productId?.toString();
      const currentPrice = product?.price || item.priceAtAdd;

      let priceChanged = false;
      if (product && product.price !== item.priceAtAdd) {
        hasChangedPrices = true;
        priceChanged = true;
      }

      const itemTotal = currentPrice * item.quantity;
      subtotal += itemTotal;
      itemCount += item.quantity;

      return {
        _id: item._id,
        productId: productId,
        productName: product?.name || item.productName,
        productImage: product?.images?.[0] || item.productImage,
        priceAtAdd: item.priceAtAdd,
        currentPrice: currentPrice,
        quantity: item.quantity,
        priceChanged: priceChanged,
        itemTotal,
      };
    });

    return {
      ...cartObj,
      subtotal,
      itemCount,
      hasChangedPrices,
    };
  }
}

module.exports = new CartService();

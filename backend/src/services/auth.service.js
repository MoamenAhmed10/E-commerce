const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

class AuthService {
  /**
   * Generate JWT token for user
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Token, user info, and empty cart
   */
  async register(userData) {
    const { name, email, mobile, password } = userData;

    // Check if user already exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        const error = new Error("Email already registered");
        error.statusCode = 400;
        throw error;
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        const error = new Error("Mobile number already registered");
        error.statusCode = 400;
        throw error;
      }
    }

    // Create user
    const user = new User({
      name,
      email: email || undefined,
      mobile: mobile || undefined,
      passwordHash: password, // Will be hashed by pre-save hook
    });

    await user.save();

    // Create empty cart for user
    const newCart = await Cart.create({ userId: user._id, items: [] });

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      cart: {
        _id: newCart._id,
        userId: newCart.userId,
        items: [],
        subtotal: 0,
        itemCount: 0,
        hasChangedPrices: false,
      },
    };
  }

  /**
   * Login user with email/mobile and password
   * Merges guest cart if sessionId is provided
   *
   * @param {string} emailOrMobile - Email or mobile number
   * @param {string} password - User password
   * @param {string} sessionId - Guest session ID (optional)
   * @returns {Object} Token, user info, and merged cart
   */
  async login(emailOrMobile, password, sessionId = null) {
    console.log(`[AUTH] Login attempt for: ${emailOrMobile}`);
    console.log(`[AUTH] Session ID provided: ${sessionId}`);

    // Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("Account is deactivated");
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    console.log(`[AUTH] User authenticated: ${user._id}`);

    // Merge guest cart if sessionId provided
    let mergedCart = null;
    if (sessionId) {
      console.log(
        `[AUTH] Attempting to merge guest cart with sessionId: ${sessionId}`,
      );
      mergedCart = await this.mergeGuestCartBySessionId(user._id, sessionId);

      if (mergedCart) {
        console.log(
          `[AUTH] ✓ Cart merged successfully - Items count: ${mergedCart.items.length}`,
        );
      } else {
        console.log(
          `[AUTH] No guest cart found to merge (sessionId: ${sessionId})`,
        );
      }
    } else {
      console.log(`[AUTH] No sessionId provided - skipping cart merge`);
    }

    // Generate token
    const token = this.generateToken(user._id);

    // Get the user's cart
    let userCart;
    const CartService = require("./cart.service");

    if (mergedCart) {
      console.log(`[AUTH] Using merged cart - re-calculating totals`);
      // Calculate totals on the merged cart
      userCart = await CartService.getByUserId(user._id);
      console.log(
        `[AUTH] After getByUserId - Items: ${userCart.items ? userCart.items.length : 0}`,
      );
    } else {
      console.log(`[AUTH] No merge occurred - fetching user cart`);
      userCart = await CartService.getByUserId(user._id);
      console.log(
        `[AUTH] After getByUserId - Items: ${userCart.items ? userCart.items.length : 0}`,
      );
    }

    console.log(
      `[AUTH] Final cart for response - Items: ${userCart.items ? userCart.items.length : 0}`,
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      cart: userCart,
    };
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Merge guest cart into user cart (called after login) - Legacy method
   * @param {string} userId - User ID
   * @param {Array} guestCartItems - Guest cart items
   * @returns {Object} Updated cart
   */
  async mergeGuestCart(userId, guestCartItems) {
    if (!guestCartItems || guestCartItems.length === 0) return null;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    for (const guestItem of guestCartItems) {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === guestItem.productId,
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        cart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        cart.items.push({
          productId: guestItem.productId,
          productName: guestItem.productName,
          productImage: guestItem.productImage,
          priceAtAdd: guestItem.priceAtAdd,
          quantity: guestItem.quantity,
          priceChanged: false,
        });
      }
    }

    await cart.save();
    return cart;
  }

  /**
   * Merge guest cart by sessionId into user cart (called after login)
   * This function:
   * - Finds the guest cart by session ID
   * - Merges items into the user's cart
   * - Handles quantity summation for duplicate products
   * - Validates stock availability
   * - Deletes the guest cart after successful merge
   *
   * @param {string} userId - User ID
   * @param {string} sessionId - Guest session ID
   * @returns {Object} Merged cart with updated items
   */
  async mergeGuestCartBySessionId(userId, sessionId) {
    if (!sessionId) {
      console.log(`[CART MERGE] No sessionId provided`);
      return null;
    }

    console.log(
      `[CART MERGE] Starting merge - userId: ${userId}, sessionId: ${sessionId}`,
    );

    // Find guest cart by sessionId
    const guestCart = await Cart.findOne({ sessionId });

    if (!guestCart) {
      console.log(
        `[CART MERGE] No guest cart found for sessionId: ${sessionId}`,
      );
      return null;
    }

    if (guestCart.items.length === 0) {
      console.log(`[CART MERGE] Guest cart is empty - deleting`);
      await Cart.deleteOne({ sessionId });
      return null;
    }

    console.log(
      `[CART MERGE] Found guest cart with ${guestCart.items.length} items`,
    );

    // Find or create user cart
    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      console.log(`[CART MERGE] Creating new user cart for userId: ${userId}`);
      userCart = new Cart({ userId, items: [] });
      console.log(`[CART MERGE] New cart userId field:`, userCart.userId);
    } else {
      console.log(
        `[CART MERGE] Found existing user cart with ${userCart.items.length} items`,
      );
    }

    const initialItemCount = userCart.items.length;

    // Get Product model for stock validation
    const Product = require("../models/product.model");

    // Merge items from guest cart to user cart
    for (const guestItem of guestCart.items) {
      console.log(`[CART MERGE] Processing guest item: ${guestItem.productId}`);

      const existingItemIndex = userCart.items.findIndex(
        (item) => item.productId.toString() === guestItem.productId.toString(),
      );

      if (existingItemIndex > -1) {
        // Product exists in user cart - sum quantities
        const existingItem = userCart.items[existingItemIndex];
        const newQuantity = existingItem.quantity + guestItem.quantity;

        console.log(
          `[CART MERGE] Duplicate found - old qty: ${existingItem.quantity}, guest qty: ${guestItem.quantity}, new qty: ${newQuantity}`,
        );

        // Validate stock availability for the merged quantity
        const product = await Product.findById(guestItem.productId);
        if (product && product.stock !== null && product.stock < newQuantity) {
          // Stock insufficient - use max available stock
          existingItem.quantity = Math.min(newQuantity, product.stock);

          console.warn(
            `[CART MERGE] Stock limited for product ${product.name}: requested ${newQuantity}, available ${product.stock}`,
          );
        } else {
          // Stock sufficient - use requested quantity
          existingItem.quantity = newQuantity;
        }

        // Update price if current price differs (price may have changed)
        if (product && product.price !== existingItem.priceAtAdd) {
          existingItem.priceChanged = true;
          console.log(
            `[CART MERGE] Price changed for product ${product.name}: ${existingItem.priceAtAdd} → ${product.price}`,
          );
        }
      } else {
        // New item - validate stock before adding
        const product = await Product.findById(guestItem.productId);

        if (product && product.isActive && !product.isDeleted) {
          let quantityToAdd = guestItem.quantity;

          // Check stock availability
          if (product.stock !== null && product.stock < quantityToAdd) {
            // Use max available stock
            quantityToAdd = Math.max(0, product.stock);
            console.warn(
              `[CART MERGE] Stock limited for product ${product.name}: requested ${guestItem.quantity}, available ${product.stock}`,
            );
          }

          // Only add if quantity > 0
          if (quantityToAdd > 0) {
            userCart.items.push({
              productId: guestItem.productId,
              productName: product.name,
              productImage: product.images?.[0] || guestItem.productImage,
              priceAtAdd: product.price,
              quantity: quantityToAdd,
              priceChanged: product.price !== guestItem.priceAtAdd,
            });
            console.log(
              `[CART MERGE] Added new item: ${product.name}, qty: ${quantityToAdd}`,
            );
          }
        } else {
          // Product no longer available - skip it
          console.warn(
            `[CART MERGE] Product ${guestItem.productId} is no longer available and was not added to cart`,
          );
        }
      }
    }

    const finalItemCount = userCart.items.length;
    console.log(
      `[CART MERGE] Merge complete - Items before: ${initialItemCount}, Items after: ${finalItemCount}`,
    );
    console.log(
      `[CART MERGE] User cart state - userId: ${userCart.userId}, sessionId: ${userCart.sessionId}, isNew: ${userCart.isNew}`,
    );

    // Save the merged cart
    try {
      await userCart.save();
      console.log(
        `[CART MERGE] ✓ User cart saved successfully with ID: ${userCart._id}`,
      );
    } catch (saveError) {
      console.error(`[CART MERGE] ERROR saving user cart:`, saveError);
      throw saveError;
    }

    // Delete guest cart after successful merge
    try {
      const deleteResult = await Cart.deleteOne({ sessionId });
      console.log(
        `[CART MERGE] ✓ Guest cart deleted (deletedCount: ${deleteResult.deletedCount})`,
      );
    } catch (deleteError) {
      console.error(`[CART MERGE] ERROR deleting guest cart:`, deleteError);
      // Don't throw - we already saved the user cart
    }

    return userCart;
  }
}

module.exports = new AuthService();

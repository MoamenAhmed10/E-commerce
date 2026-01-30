const mongoose = require("mongoose");

/**
 * Cart Item Schema - stores snapshot of product at time of adding to cart
 */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
    priceAtAdd: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    priceChanged: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true, // Allow null for guest carts
    },
    sessionId: {
      type: String,
      sparse: true, // Allow null for logged-in users
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index to ensure either userId or sessionId is unique
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

// Validation: either userId or sessionId must be present
cartSchema.pre("validate", function (next) {
  if (!this.userId && !this.sessionId) {
    next(new Error("Either userId or sessionId must be provided"));
  } else if (this.userId && this.sessionId) {
    next(new Error("Cannot have both userId and sessionId"));
  } else {
    next();
  }
});

// userId already has unique index, no need for additional index

// Virtual for cart subtotal (excluding items with changed prices)
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.priceAtAdd * item.quantity;
  }, 0);
});

// Virtual for item count
cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Virtual for items with price changes
cartSchema.virtual("hasChangedPrices").get(function () {
  return this.items.some((item) => item.priceChanged);
});

// Method to clear cart
cartSchema.methods.clear = function () {
  this.items = [];
  return this.save();
};

// Method to add item
cartSchema.methods.addItem = function (product, quantity = 1) {
  const existingItem = this.items.find(
    (item) => item.productId.toString() === product._id.toString(),
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      productId: product._id,
      productName: product.name,
      productImage: product.images?.[0] || null,
      priceAtAdd: product.price,
      quantity,
    });
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString(),
  );

  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(
        (i) => i.productId.toString() !== productId.toString(),
      );
    } else {
      item.quantity = quantity;
    }
  }

  return this.save();
};

// Method to remove item
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString(),
  );
  return this.save();
};

module.exports = mongoose.model("Cart", cartSchema);

const mongoose = require("mongoose");
const {
  ORDER_STATUS,
  isValidStatusTransition,
} = require("../constants/order-status");

/**
 * Order Item Schema - stores snapshot of product at time of order
 */
const orderItemSchema = new mongoose.Schema(
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

/**
 * Customer Snapshot - stores customer info at time of order
 */
const customerSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String },
  },
  { _id: false },
);

/**
 * Address Snapshot - stores address at time of order
 */
const addressSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String },
    city: { type: String, required: true },
    area: { type: String, required: true },
    street: { type: String, required: true },
    building: { type: String, required: true },
    notes: { type: String },
  },
  { _id: false },
);

/**
 * Status History Entry
 */
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    customerSnapshot: {
      type: customerSnapshotSchema,
      required: true,
    },
    addressSnapshot: {
      type: addressSnapshotSchema,
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    statusHistory: [statusHistorySchema],
    notes: {
      type: String,
      maxlength: 500,
    },
    deliveredAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Soft delete - exclude deleted orders by default
orderSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Virtual for item count
orderSchema.virtual("totalItems").get(function () {
  if (!this.items || !Array.isArray(this.items)) return 0;
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Static method to generate order number
orderSchema.statics.generateOrderNumber = async function () {
  const date = new Date();
  const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const count = await this.countDocuments({
    orderNumber: { $regex: `^${prefix}` },
  });
  return `${prefix}-${String(count + 1).padStart(5, "0")}`;
};

// Static method to check if status transition is valid
orderSchema.statics.isValidStatusTransition = function (
  currentStatus,
  newStatus,
) {
  return isValidStatusTransition(currentStatus, newStatus);
};

// Static method for cancellable statuses
orderSchema.statics.canBeCancelled = function (status) {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING].includes(status);
};

// Method to change status
orderSchema.methods.changeStatus = function (newStatus, changedBy, notes) {
  if (!isValidStatusTransition(this.status, newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy,
    notes,
  });

  return this.save();
};

module.exports = mongoose.model("Order", orderSchema);

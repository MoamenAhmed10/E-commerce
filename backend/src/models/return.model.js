const mongoose = require("mongoose");

const RETURN_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Return reason is required"],
      trim: true,
      minlength: [10, "Reason must be at least 10 characters"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: String,
        quantity: Number,
        reason: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(RETURN_STATUS),
      default: RETURN_STATUS.REQUESTED,
    },
    adminNotes: {
      type: String,
      maxlength: 500,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
returnSchema.index({ userId: 1, createdAt: -1 });
returnSchema.index({ orderId: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

// Soft delete
returnSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Method to approve return
returnSchema.methods.approve = function (adminId, notes) {
  this.status = RETURN_STATUS.APPROVED;
  this.processedAt = new Date();
  this.processedBy = adminId;
  this.adminNotes = notes;
  return this.save();
};

// Method to reject return
returnSchema.methods.reject = function (adminId, notes) {
  this.status = RETURN_STATUS.REJECTED;
  this.processedAt = new Date();
  this.processedBy = adminId;
  this.adminNotes = notes;
  return this.save();
};

module.exports = mongoose.model("Return", returnSchema);
module.exports.RETURN_STATUS = RETURN_STATUS;

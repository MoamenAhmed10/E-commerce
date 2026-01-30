const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
    },
    building: {
      type: String,
      required: [true, "Building is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
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

// Compound index for user's addresses
addressSchema.index({ userId: 1, isDefault: 1 });

// Soft delete - exclude deleted addresses by default
addressSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Pre-save middleware to ensure only one default address per user
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id }, isDeleted: false },
      { isDefault: false },
    );
  }
  next();
});

// Virtual for formatted address
addressSchema.virtual("fullAddress").get(function () {
  return `${this.building}, ${this.street}, ${this.area}, ${this.city}`;
});

addressSchema.set("toJSON", { virtuals: true });
addressSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Address", addressSchema);

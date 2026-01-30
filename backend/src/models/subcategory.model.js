const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
      minlength: [2, "Subcategory name must be at least 2 characters"],
      maxlength: [50, "Subcategory name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound indexes
subcategorySchema.index({ categoryId: 1, isActive: 1 });
subcategorySchema.index({ slug: 1, categoryId: 1 }, { unique: true });

// Soft delete - exclude deleted subcategories by default
subcategorySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Populate category by default
subcategorySchema.pre(/^find/, function (next) {
  this.populate("categoryId", "name slug");
  next();
});

module.exports = mongoose.model("SubCategory", subcategorySchema);

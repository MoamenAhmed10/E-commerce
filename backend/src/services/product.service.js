const Product = require("../models/product.model");
const Category = require("../models/category.model");
const SubCategory = require("../models/subcategory.model");
const { slugify } = require("../utils/slugify");

class ProductService {
  /**
   * Get all products with filters, pagination, and sorting
   */
  async getAll(options = {}) {
    const {
      page = 1,
      limit = 12,
      sort = "newest",
      category,
      subCategory,
      minPrice,
      maxPrice,
      minRating,
      size,
      color,
      search,
      inStock,
      includeInactive,
      gender,
      stockStatus,
      isActive,
      newArrivals,
      onSale,
    } = options;

    // Translate sort parameter to MongoDB sort string
    const sortOptions = {
      newest: "-createdAt",
      oldest: "createdAt",
      // Support both hyphen and underscore formats
      "price-asc": "price",
      price_asc: "price",
      "price-low": "price",
      price_low: "price",
      "price-high": "-price",
      price_high: "-price",
      "price-desc": "-price",
      price_desc: "-price",
      "name-asc": "name",
      name_asc: "name",
      "name-desc": "-name",
      name_desc: "-name",
      "rating-high": "-averageRating",
      rating_high: "-averageRating",
      "rating-low": "averageRating",
      rating_low: "averageRating",
    };
    const sortBy = sortOptions[sort] || sort || "-createdAt";

    const filter = { isDeleted: false };

    // Handle isActive filter for admin
    if (includeInactive === "true") {
      // Admin viewing all products - check specific isActive filter
      if (isActive === "true") {
        filter.isActive = true;
      } else if (isActive === "false") {
        filter.isActive = false;
      }
      // If isActive is not specified, show all (active and inactive)
    } else {
      // Public API - only show active products
      filter.isActive = true;
    }

    // Handle stockStatus filter (for admin dashboard)
    if (stockStatus) {
      if (stockStatus === "in_stock") {
        filter.stock = { $gt: 10 };
      } else if (stockStatus === "low_stock") {
        filter.stock = { $gt: 0, $lte: 10 };
      } else if (stockStatus === "out_of_stock") {
        filter.stock = { $lte: 0 };
      }
    }

    // Resolve category slug to ID
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.categoryId = cat._id;
    }

    // Resolve subcategory slug to ID
    if (subCategory) {
      const subCat = await SubCategory.findOne({ slug: subCategory });
      if (subCat) filter.subCategoryId = subCat._id;
    }

    if (gender && gender !== "all") filter.gender = gender;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }
    if (size) filter["sizes.size"] = size;
    if (color) filter["sizes.color"] = { $regex: color, $options: "i" };
    if (inStock === "true") filter["sizes.stock"] = { $gt: 0 };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // New arrivals - products marked as new arrivals
    if (newArrivals === "true" || newArrivals === true) {
      filter.isNewArrival = true;
    }

    // On sale - products with isOnSale flag
    if (onSale === "true" || onSale === true) {
      filter.isOnSale = true;
    }

    const skip = (page - 1) * limit;

    // Sort on sale products first, then by selected sort
    let sortQuery = sortBy;
    if (onSale !== "true" && onSale !== true) {
      // Show on sale products first in normal listing
      sortQuery = { isOnSale: -1 };
      if (typeof sortBy === "string") {
        const sortField = sortBy.startsWith("-") ? sortBy.substring(1) : sortBy;
        const sortDir = sortBy.startsWith("-") ? -1 : 1;
        sortQuery[sortField] = sortDir;
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name slug")
        .populate("subCategoryId", "name slug")
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    return {
      products,
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
   * Get product by ID
   */
  async getById(productId) {
    const product = await Product.findById(productId)
      .populate("categoryId", "name slug")
      .populate("subCategoryId", "name slug");

    if (!product || product.isDeleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  /**
   * Get product by slug
   */
  async getBySlug(slug) {
    const product = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false,
    })
      .populate("categoryId", "name slug")
      .populate("subCategoryId", "name slug");

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  /**
   * Get featured products (best sellers and new arrivals for home page)
   */
  async getFeatured(limit = 8) {
    const [menBestSellers, menNewArrivals, womenBestSellers, womenNewArrivals] =
      await Promise.all([
        Product.find({
          isActive: true,
          isDeleted: false,
          isBestSeller: true,
          gender: "men",
        })
          .populate("categoryId", "name slug")
          .sort("-createdAt")
          .limit(limit),
        Product.find({
          isActive: true,
          isDeleted: false,
          isNewArrival: true,
          gender: "men",
        })
          .populate("categoryId", "name slug")
          .sort("-createdAt")
          .limit(limit),
        Product.find({
          isActive: true,
          isDeleted: false,
          isBestSeller: true,
          gender: "women",
        })
          .populate("categoryId", "name slug")
          .sort("-createdAt")
          .limit(limit),
        Product.find({
          isActive: true,
          isDeleted: false,
          isNewArrival: true,
          gender: "women",
        })
          .populate("categoryId", "name slug")
          .sort("-createdAt")
          .limit(limit),
      ]);

    return {
      men: {
        bestSellers: menBestSellers,
        newArrivals: menNewArrivals,
      },
      women: {
        bestSellers: womenBestSellers,
        newArrivals: womenNewArrivals,
      },
    };
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit = 8) {
    return Product.find({
      isActive: true,
      isDeleted: false,
      isNewArrival: true,
    })
      .populate("categoryId", "name slug")
      .sort("-createdAt")
      .limit(limit);
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit = 8) {
    return Product.find({
      isActive: true,
      isDeleted: false,
      isBestSeller: true,
    })
      .populate("categoryId", "name slug")
      .sort("-createdAt")
      .limit(limit);
  }

  /**
   * Create product (Admin)
   */
  async create(productData) {
    const slug = slugify(productData.name);

    // Check for duplicate slug (only among active products)
    const existing = await Product.findOne({ slug, isDeleted: { $ne: true } });
    if (existing) {
      const error = new Error("Product with this name already exists");
      error.statusCode = 400;
      throw error;
    }

    const product = new Product({
      ...productData,
      slug,
    });
    await product.save();
    return product;
  }

  /**
   * Update product (Admin)
   */
  async update(productId, updateData) {
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name && updateData.name !== product.name) {
      const newSlug = slugify(updateData.name);
      const existing = await Product.findOne({
        slug: newSlug,
        _id: { $ne: productId },
      });
      if (existing) {
        const error = new Error("Product with this name already exists");
        error.statusCode = 400;
        throw error;
      }
      updateData.slug = newSlug;
    }

    Object.assign(product, updateData);
    await product.save();
    return product;
  }

  /**
   * Update product stock
   */
  async updateStock(productId, sizeId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const sizeVariant = product.sizes.id(sizeId);
    if (!sizeVariant) {
      const error = new Error("Size variant not found");
      error.statusCode = 404;
      throw error;
    }

    sizeVariant.stock += quantity;
    if (sizeVariant.stock < 0) {
      const error = new Error("Insufficient stock");
      error.statusCode = 400;
      throw error;
    }

    await product.save();
    return product;
  }

  /**
   * Toggle product status (Admin)
   */
  async toggleStatus(productId) {
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    product.isActive = !product.isActive;
    await product.save();
    return product;
  }

  /**
   * Toggle featured status (Admin)
   */
  async toggleFeatured(productId) {
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    product.isFeatured = !product.isFeatured;
    await product.save();
    return product;
  }

  /**
   * Soft delete product (Admin)
   */
  async delete(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();
    return { message: "Product deleted successfully" };
  }
}

module.exports = new ProductService();

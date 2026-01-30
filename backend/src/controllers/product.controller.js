const productService = require("../services/product.service");

/**
 * Get all products with filters
 */
exports.getAll = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.query);
    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by slug
 */
exports.getBySlug = async (req, res, next) => {
  try {
    const product = await productService.getBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 */
exports.getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getFeatured(limit);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * Get new arrivals
 */
exports.getNewArrivals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getNewArrivals(limit);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * Create product (Admin)
 */
exports.create = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (Admin)
 */
exports.update = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product stock (Admin)
 */
exports.updateStock = async (req, res, next) => {
  try {
    const { sizeId, quantity } = req.body;
    const product = await productService.updateStock(
      req.params.id,
      sizeId,
      quantity,
    );
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle product status (Admin)
 */
exports.toggleStatus = async (req, res, next) => {
  try {
    const product = await productService.toggleStatus(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle featured status (Admin)
 */
exports.toggleFeatured = async (req, res, next) => {
  try {
    const product = await productService.toggleFeatured(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin)
 */
exports.delete = async (req, res, next) => {
  try {
    const result = await productService.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

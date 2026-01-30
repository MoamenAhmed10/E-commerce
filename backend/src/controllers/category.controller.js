const categoryService = require("../services/category.service");

/**
 * Get all categories
 */
exports.getAll = async (req, res, next) => {
  try {
    const includeInactive =
      req.user?.role === "admin" && req.query.includeInactive === "true";
    const categories = await categoryService.getAll(includeInactive);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 */
exports.getBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getBySlug(req.params.slug);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * Create category (Admin)
 */
exports.create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (Admin)
 */
exports.update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle category status (Admin)
 */
exports.toggleStatus = async (req, res, next) => {
  try {
    const category = await categoryService.toggleStatus(req.params.id);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (Admin)
 */
exports.delete = async (req, res, next) => {
  try {
    const result = await categoryService.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

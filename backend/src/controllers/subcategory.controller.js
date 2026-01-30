const subcategoryService = require("../services/subcategory.service");

/**
 * Get all subcategories
 */
exports.getAll = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const includeInactive =
      req.user?.role === "admin" && req.query.includeInactive === "true";
    const subcategories = await subcategoryService.getAll(
      categoryId,
      includeInactive,
    );
    res.json({ success: true, data: subcategories });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subcategory by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.getById(req.params.id);
    res.json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

/**
 * Create subcategory (Admin)
 */
exports.create = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.create(req.body);
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

/**
 * Update subcategory (Admin)
 */
exports.update = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.update(
      req.params.id,
      req.body,
    );
    res.json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle subcategory status (Admin)
 */
exports.toggleStatus = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.toggleStatus(req.params.id);
    res.json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete subcategory (Admin)
 */
exports.delete = async (req, res, next) => {
  try {
    const result = await subcategoryService.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

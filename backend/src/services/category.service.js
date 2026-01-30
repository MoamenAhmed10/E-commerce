const Category = require("../models/category.model");
const SubCategory = require("../models/subcategory.model");
const { slugify } = require("../utils/slugify");

class CategoryService {
  /**
   * Get all active categories with their subcategories
   */
  async getAll(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(filter)
      .populate({
        path: "subcategories",
        match: includeInactive
          ? {}
          : { isActive: true, isDeleted: { $ne: true } },
        select: "name slug description image isActive _id",
      })
      .sort({ name: 1 });
    return categories;
  }

  /**
   * Get category by ID or slug
   */
  async getById(identifier) {
    const category = await Category.findOne({
      $or: [{ _id: identifier }, { slug: identifier }],
    });
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  /**
   * Create category (Admin)
   */
  async create(categoryData) {
    const slug = slugify(categoryData.name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      const error = new Error("Category with this name already exists");
      error.statusCode = 400;
      throw error;
    }

    const category = new Category({
      ...categoryData,
      slug,
    });
    await category.save();
    return category;
  }

  /**
   * Update category (Admin)
   */
  async update(categoryId, updateData) {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name && updateData.name !== category.name) {
      const newSlug = slugify(updateData.name);
      const existing = await Category.findOne({
        slug: newSlug,
        _id: { $ne: categoryId },
      });
      if (existing) {
        const error = new Error("Category with this name already exists");
        error.statusCode = 400;
        throw error;
      }
      updateData.slug = newSlug;
    }

    Object.assign(category, updateData);
    await category.save();
    return category;
  }

  /**
   * Toggle category active status (Admin)
   */
  async toggleStatus(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    category.isActive = !category.isActive;
    await category.save();
    return category;
  }

  /**
   * Soft delete category (Admin)
   */
  async delete(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    category.isDeleted = true;
    category.isActive = false;
    await category.save();
    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();

const SubCategory = require("../models/subcategory.model");
const Category = require("../models/category.model");
const { slugify } = require("../utils/slugify");

class SubcategoryService {
  /**
   * Get all subcategories
   */
  async getAll(categoryId = null, includeInactive = false) {
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (!includeInactive) filter.isActive = true;

    return SubCategory.find(filter).sort({ name: 1 });
  }

  /**
   * Get subcategory by ID
   */
  async getById(subcategoryId) {
    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      const error = new Error("Subcategory not found");
      error.statusCode = 404;
      throw error;
    }
    return subcategory;
  }

  /**
   * Create subcategory (Admin)
   */
  async create(subcategoryData) {
    // Verify category exists
    const category = await Category.findById(subcategoryData.categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    const slug = slugify(subcategoryData.name);

    // Check for duplicate slug within category
    const existing = await SubCategory.findOne({
      slug,
      categoryId: subcategoryData.categoryId,
    });
    if (existing) {
      const error = new Error(
        "Subcategory with this name already exists in this category",
      );
      error.statusCode = 400;
      throw error;
    }

    const subcategory = new SubCategory({
      ...subcategoryData,
      slug,
    });
    await subcategory.save();
    return subcategory;
  }

  /**
   * Update subcategory (Admin)
   */
  async update(subcategoryId, updateData) {
    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      const error = new Error("Subcategory not found");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name && updateData.name !== subcategory.name) {
      const newSlug = slugify(updateData.name);
      const existing = await SubCategory.findOne({
        slug: newSlug,
        categoryId: subcategory.categoryId,
        _id: { $ne: subcategoryId },
      });
      if (existing) {
        const error = new Error(
          "Subcategory with this name already exists in this category",
        );
        error.statusCode = 400;
        throw error;
      }
      updateData.slug = newSlug;
    }

    Object.assign(subcategory, updateData);
    await subcategory.save();
    return subcategory;
  }

  /**
   * Toggle subcategory active status (Admin)
   */
  async toggleStatus(subcategoryId) {
    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      const error = new Error("Subcategory not found");
      error.statusCode = 404;
      throw error;
    }

    subcategory.isActive = !subcategory.isActive;
    await subcategory.save();
    return subcategory;
  }

  /**
   * Soft delete subcategory (Admin)
   */
  async delete(subcategoryId) {
    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      const error = new Error("Subcategory not found");
      error.statusCode = 404;
      throw error;
    }

    subcategory.isDeleted = true;
    subcategory.isActive = false;
    await subcategory.save();
    return { message: "Subcategory deleted successfully" };
  }
}

module.exports = new SubcategoryService();

import { logActivity } from "../../utils/activityLogger.js";
import * as categoryService from "./categories.services.js";

// @desc    Create a new category
// @route   POST /api/v1/categories/add
// @access  Admin
export const createCategory = async (req, res) => {
  try {
    const { categoryName, slug, description, comment } = req.body;

    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check duplicate slug
    const existing = await categoryService.getCategoryBySlug(slug);
    if (existing) {
      return res.status(400).json({ message: "Category slug already exists" });
    }

    const category = await categoryService.createCategory({
      categoryName,
      slug,
      description,
      comment,
    });

    // Log activity
    await logActivity({
      model_name: "Category",
      logs_fields_id: category._id,
      by: userId,
      action: "Created",
      note: `new category ${category.categoryName} created by ${userEmail}`,
    });

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all categories
// @route   GET /api/v1/categories/all
// @access  Public/Admin
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const categories = await categoryService.getAllCategories(
      parseInt(page),
      parseInt(limit)
    );
    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/details/:id
// @access  Public/Admin
export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Get Category Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/update/:id
// @access  Admin
export const updateCategory = async (req, res) => {
  try {
    const { categoryName, slug, description, comment } = req.body;

    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if slug is being changed to an existing one
    if (slug) {
      const existing = await categoryService.getCategoryBySlug(slug);
      if (existing && existing._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({ message: "Category slug already exists" });
      }
    }

    const updated = await categoryService.updateCategory(req.params.id, {
      categoryName,
      slug,
      description,
      comment,
    });

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Log activity
    await logActivity({
      model_name: "Category",
      logs_fields_id: updated._id,
      by: userId,
      action: "Created",
      note: `category ${updated.categoryName} updated by ${userEmail}`,
    });

    res.status(200).json({
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Admin
export const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const deleted = await categoryService.deleteCategory(req.params.id);

    // Log activity
    await logActivity({
      model_name: "Category",
      logs_fields_id: deleted._id,
      by: userId,
      action: "Deleted",
      note: `category ${deleted.categoryName} deleted by ${userEmail}`,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

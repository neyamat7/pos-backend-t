import Category from "./categories.model.js";

// Create new category
export const createCategory = async (data) => {
  const category = new Category(data);
  return await category.save();
};

// Get all categories
export const getAllCategories = async (page, limit) => {
  const skip = (page - 1) * limit;
  const total = await Category.countDocuments();

  const categories = await Category.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    categories,
  };
};

// Get single category by ID
export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

// Get category by slug
export const getCategoryBySlug = async (slug) => {
  return await Category.findOne({ slug });
};

// Update category by ID
export const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

// Delete category by ID
export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

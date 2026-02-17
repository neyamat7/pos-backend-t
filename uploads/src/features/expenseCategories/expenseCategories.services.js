import ExpenseCategory from "./expenseCategories.model.js";

// @desc    Get all expense categories with pagination and optional filtering
// @access  Public
export const getAllExpenseCategories = async (
  page = 1,
  limit = 10,
  filters = {},
  role = "user"
) => {
  const skip = (page - 1) * limit;

  const query = {};
  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  // If user is not admin, exclude "Salary" category (case-insensitive)
  if (role !== "admin") {
    const salaryExclusion = { $not: { $regex: "^Salary$", $options: "i" } };

    if (query.name) {
       // If searching, we combine.
       query.$and = [
         { name: query.name },
         { name: salaryExclusion }
       ];
       delete query.name;
    } else {
       query.name = salaryExclusion;
    }
  }

  const categories = await ExpenseCategory.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ExpenseCategory.countDocuments(query);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    categories,
  };
};



// @desc    Create new expense category
// @access  Public
export const createExpenseCategoryService = async (data) => {
  return await ExpenseCategory.create(data);
};

// @desc    Update expense category by ID
// @access  Public
export const updateExpenseCategoryService = async (id, data) => {
  const updated = await ExpenseCategory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!updated) throw new Error("Expense category not found");
  return updated;
};

// @desc    Delete expense category by ID
// @access  Public
export const deleteExpenseCategoryService = async (id) => {
  const deleted = await ExpenseCategory.findByIdAndDelete(id);
  if (!deleted) throw new Error("Expense category not found");
  return deleted;
};

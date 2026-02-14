import { logActivity } from "../../utils/activityLogger.js";
import * as expenseService from "./expense.service.js";

// @desc    Create expense
// @route   POST /api/v1/expenses
export const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const expenseData = { ...req.body };

    // Sanitize employeeId if it's an empty string
    if (expenseData.employeeId === "") {
      delete expenseData.employeeId;
    }

    // Set expense_by to the logged-in user
    expenseData.expense_by = userId;

    const expense = await expenseService.createExpense(expenseData);

    // Log activity
    await logActivity({
      model_name: "Expense",
      logs_fields_id: expense._id,
      by: userId,
      action: "Created",
      note: `${expense.amount}  for ${expense.expense_for} expense by ${userEmail}`,
    });

    res.status(201).json({
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/v1/expenses
export const getAllExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      employeeId,
      date,
    } = req.query;

    const expenses = await expenseService.getAllExpenses(
      parseInt(page),
      parseInt(limit),
      { search, category, employeeId, date }
    );

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get Expenses Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update expense
// @route   PUT /api/v1/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const updated = await expenseService.updateExpense(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Log activity
    await logActivity({
      model_name: "Expense",
      logs_fields_id: updated._id,
      by: userId,
      action: "Updated",
      note: `${updated.amount}  for ${updated.expense_for} updated by ${userEmail}`,
    });

    res.status(200).json({
      message: "Expense updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get expenses by employee ID
// @route   GET /api/v1/expenses/employee/:employeeId
export const getExpensesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const expenses = await expenseService.getAllExpenses(
      parseInt(page),
      parseInt(limit),
      { employeeId }
    );

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get Expenses By Employee ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

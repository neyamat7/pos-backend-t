import { CashTransaction } from "../cash-management/cash-management.model.js";
import User from "../user/user.model.js";
import Expense from "./expense.model.js";


// Create
export const createExpense = async (data) => {
  // Handle salary tracking for employees
  if (data.expense_category.toLowerCase() === "salary" && data.employeeId) {
    const employee = await User.findById(data.employeeId);
    
    if (employee && employee.salary) {
      // Get current month-year (e.g., "2025-12")
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if we need to reset for a new month
      if (employee.last_salary_reset_month !== currentMonthYear) {
        // New month: reset remaining_salary to salary
        employee.remaining_salary = employee.salary;
        employee.last_salary_reset_month = currentMonthYear;
      }
      
      // Deduct the expense amount from remaining_salary (ensure it doesn't go below 0)
      employee.remaining_salary = Math.max(0, employee.remaining_salary - data.amount);
      
      // Save the updated employee data
      await employee.save();
    }
  }
  
  const expense = new Expense(data);
  return await expense.save();
};

// Get all
export const getAllExpenses = async (page, limit, filters = {}) => {
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.category) {
    query.expense_category = filters.category;
  }

  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters.date) {
    query.date = filters.date;
  }

  if (filters.search) {
    query.$or = [
      { reference_num: { $regex: filters.search, $options: "i" } },
      { expense_category: { $regex: filters.search, $options: "i" } },
    ];
  }

  const total = await Expense.countDocuments(query);

  const expenses = await Expense.find(query)
    .populate("expense_by", "name email")
    .populate("employeeId", "name")
    .populate("choose_account", "name account_type balance")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    expenses,
  };
};

// Update
export const updateExpense = async (id, data) => {
  const existingExpense = await Expense.findById(id);
  if (!existingExpense) {
    throw new Error("Expense not found");
  }

  // --- REVERT LOGIC ---
  // If the existing expense was a "salary" expense, revert the deduction
  if (
    existingExpense.expense_category.toLowerCase() === "salary" &&
    existingExpense.employeeId
  ) {
    const employee = await User.findById(existingExpense.employeeId);
    if (employee) {
      employee.remaining_salary += existingExpense.amount;
      await employee.save();
    }
  }
  
  const newCategory = data.expense_category || existingExpense.expense_category;
  const newEmployeeId = data.employeeId || existingExpense.employeeId;
  const newAmount = data.amount !== undefined ? data.amount : existingExpense.amount;

  if (newCategory.toLowerCase() === "salary" && newEmployeeId) {
    const employee = await User.findById(newEmployeeId);
    if (employee && employee.salary) {
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (employee.last_salary_reset_month !== currentMonthYear) {
        employee.remaining_salary = employee.salary;
        employee.last_salary_reset_month = currentMonthYear;
      }
      
      employee.remaining_salary = Math.max(0, employee.remaining_salary - newAmount);
      await employee.save();
    }
  }

  return await Expense.findByIdAndUpdate(id, data, { new: true })
    .populate("expense_by", "name email")
    .populate("choose_account", "name account_type balance");
};

// @desc Get total expenses by month (Expense + CashTransaction OUT)
// @access  Admin
export const getTotalExpensesByMonth = async (monthName, year) => {
  // Step 1: Determine the year (use provided year or current year)
  const targetYear = year || new Date().getFullYear();
  
  // Step 2: Parse the month name to get month index (0-11)
  let monthIndex;
  if (monthName) {
    // Convert month name (e.g., "January") to month index (0)
    monthIndex = new Date(`${monthName} 1, ${targetYear}`).getMonth();
  } else {
    // If no month provided, use current month
    monthIndex = new Date().getMonth();
  }

  // Step 3: Build the date range for the entire month
  // Start date: First day of month at 00:00:00
  const startDate = new Date(targetYear, monthIndex, 1);
  // End date: Last day of month at 23:59:59.999
  const endDate = new Date(targetYear, monthIndex + 1, 0, 23, 59, 59, 999);

  // Step 4: Calculate total from Expense model
  // Query all expenses within the month (all payment types included)
  const expenseResult = await Expense.aggregate([
    {
      // Match expenses within the date range
      $match: {
        // Convert string date to Date object for comparison
        $expr: {
          $and: [
            { $gte: [{ $dateFromString: { dateString: "$date" } }, startDate] },
            { $lte: [{ $dateFromString: { dateString: "$date" } }, endDate] }
          ]
        }
      }
    },
    {
      // Sum all expense amounts
      $group: {
        _id: null,
        totalExpenseAmount: { $sum: "$amount" }
      }
    }
  ]);

  // Extract total expense amount (default to 0 if no records)
  const totalExpenseAmount = expenseResult[0]?.totalExpenseAmount || 0;

  // Step 5: Calculate total from CashTransaction model (type: "OUT")
  // Query all cash out transactions within the month
  const cashOutResult = await CashTransaction.aggregate([
    {
      // Match cash OUT transactions within the date range
      $match: {
        type: "OUT", // Only outgoing cash
        businessDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      // Sum all cash out amounts
      $group: {
        _id: null,
        totalCashOut: { $sum: "$amount" }
      }
    }
  ]);

  // Extract total cash out amount (default to 0 if no records)
  const totalCashOut = cashOutResult[0]?.totalCashOut || 0;

  // Step 6: Calculate combined total expenses
  // Total Expenses = Expense records + Cash OUT transactions
  const totalExpenses = totalExpenseAmount + totalCashOut;

  // Step 7: Return the breakdown and total
  return {
    totalExpenseAmount,  // From Expense model
    totalCashOut,        // From CashTransaction model (type: OUT)
    totalExpenses,       // Combined total
    month: monthName || new Date(targetYear, monthIndex).toLocaleString('en-US', { month: 'long' }),
    year: targetYear
  };
};


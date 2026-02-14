import customerModel from "../customer/customer.model.js";
import expenseModel from "../expense/expense.model.js";
import incomeModel from "../income/income.model.js";
import inventoryLotsModel from "../inventoryLots/inventoryLots.model.js";
import purchaseModel from "../purchase/purchase.model.js";
import saleModel from "../sale/sale.model.js";
import supplierModel from "../supplier/supplier.model.js";

// @desc Dashboard Stats Calculation
// @access Private
const getDateFilter = (filter) => {
  const now = new Date();
  let start;

  switch (filter) {
    case "daily":
      start = new Date(now.setHours(0, 0, 0, 0));
      break;

    case "weekly":
      start = new Date(now.setDate(now.getDate() - 7));
      break;

    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "yearly":
      start = new Date(now.getFullYear(), 0, 1);
      break;

    default:
      start = new Date(now.setHours(0, 0, 0, 0));
  }

  return { createdAt: { $gte: start } };
};

export const getStats = async (filter) => {
  const dateQuery = getDateFilter(filter);

  // ----- FILTERED VALUES -----
  const totalPurchase = await purchaseModel.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalSales = await saleModel.aggregate([
    { $match: dateQuery },
    {
      $group: {
        _id: null,
        total: { $sum: "$payment_details.payable_amount" },
      },
    },
  ]);

  const salesDue = await saleModel.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: "$payment_details.due_amount" } } },
  ]);

  const totalExpense = await expenseModel.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalIncome = await incomeModel.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: "$total_Income" } } },
  ]);

  // ----- NON-FILTERED VALUES -----
  const totalActiveLots = await inventoryLotsModel.countDocuments({
    status: "in stock",
  });

  const totalCustomer = await customerModel.countDocuments();
  const totalSupplier = await supplierModel.countDocuments();

  return {
    filtered_by: filter,
    total_purchase: totalPurchase[0]?.total || 0,
    total_sales: totalSales[0]?.total || 0,
    sales_due: salesDue[0]?.total || 0,
    total_expense: totalExpense[0]?.total || 0,
    total_income: totalIncome[0]?.total,

    // Non-filtered
    total_active_lots: totalActiveLots,
    total_customer: totalCustomer,
    total_supplier: totalSupplier,
  };
};

// @desc Get monthly summary for current year
// @access Private/Admin
export const getMonthlySummaryService = async () => {
  const year = new Date().getFullYear();

  // Month names array
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Sales by month
  const salesAgg = await saleModel.aggregate([
    {
      $match: {
        sale_date: {
          $gte: `${year}-01-01`,
          $lte: `${year}-12-31`,
        },
      },
    },
    {
      $group: {
        _id: { $month: { $dateFromString: { dateString: "$sale_date" } } },
        totalSales: { $sum: "$payment_details.payable_amount" },
        customers: { $addToSet: "$customerId" },
      },
    },
  ]);

  // Profit by month (InventoryLot.purchase_date)
  const profitAgg = await inventoryLotsModel.aggregate([
    {
      $match: {
        purchase_date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$purchase_date" },
        totalProfit: { $sum: "$profits.totalProfit" },
        totalLoss: { $sum: "$profits.lot_loss" },
      },
    },
  ]);

  // Expenses by month (Expense.createdAt)
  const expenseAgg = await expenseModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalExpenses: { $sum: "$amount" },
      },
    },
  ]);

  // Customer count by month (Customer.createdAt)
  const customerAgg = await customerModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        customerCount: { $sum: 1 },
      },
    },
  ]);

  // Combine all into 12 months with month names
  const summary = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1;
    return {
      month: monthNames[i], // Month name
      sales: salesAgg.find((s) => s._id === monthNumber)?.totalSales || 0,
      profit: profitAgg.find((p) => p._id === monthNumber)?.totalProfit || 0,
      loss: profitAgg.find((p) => p._id === monthNumber)?.totalLoss || 0,
      expenses:
        expenseAgg.find((e) => e._id === monthNumber)?.totalExpenses || 0,
      customerCount:
        customerAgg.find((c) => c._id === monthNumber)?.customerCount || 0,
    };
  });

  return { year, summary };
};

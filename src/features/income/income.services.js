import Income from "./income.model.js";

// @desc    Get all incomes with pagination, filtering and population
// @access  Admin
export const getAllIncomes = async (page, limit, filters = {}) => {
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by date range
  if (filters.fromDate || filters.toDate) {
    query.sellDate = {};
    if (filters.fromDate) query.sellDate.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.sellDate.$lte = new Date(filters.toDate);
  }


  // Get incomes with population
  const incomes = await Income.find(query)
    .sort({ sellDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "information.lots_Ids",
      select: "lot_name productsId supplierId",
      populate: [
        {
          path: "productsId",
          select: "productName description",
        },
        {
          path: "supplierId",
          select: "name email",
        },
      ],
    });

  const total = await Income.countDocuments(query);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    incomes,
  };
};

// @desc    Get single income by ID with full details
// @access  Admin
export const getIncomeById = async (id) => {
  const income = await Income.findById(id).populate({
    path: "information.lots_Ids",
    select: "lot_name productsId supplierId createdAt",
    populate: [
      {
        path: "productsId",
        select: "productName description basePrice categoryId",
        populate: {
          path: "categoryId",
          select: "categoryName",
        },
      },
      {
        path: "supplierId",
        select: "name email phone address",
      },
    ],
  });

  if (!income) {
    throw new Error("Income not found");
  }

  return income;
};

// @desc    Get income statistics
// @access  Admin
export const getIncomeStats = async (fromDate, toDate) => {
  const matchStage = {};

  if (fromDate || toDate) {
    matchStage.sellDate = {};
    if (fromDate) matchStage.sellDate.$gte = new Date(fromDate);
    if (toDate) matchStage.sellDate.$lte = new Date(toDate);
  }

  const stats = await Income.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalSellAmount: { $sum: "$total_Sell" },
        totalLotCommission: { $sum: "$lot_Commission" },
        totalCustomerCommission: { $sum: "$customer_Commission" },
        totalIncome: { $sum: "$total_Income" },
        totalReceived: { $sum: "$received_amount" },
        totalDue: { $sum: "$due" },
        averageIncome: { $avg: "$total_Income" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalSales: 0,
      totalSellAmount: 0,
      totalLotCommission: 0,
      totalCustomerCommission: 0,
      totalIncome: 0,
      totalReceived: 0,
      totalDue: 0,
      averageIncome: 0,
    }
  );
};

// @desc    Get income all time
// @access  Admin
export const getIncomeTotals = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear() + 1, 0, 1);

  const [daily, weekly, monthly, yearly] = await Promise.all([
    Income.aggregate([
      { $match: { sellDate: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: "$total_Income" } } },
    ]),
    Income.aggregate([
      { $match: { sellDate: { $gte: weekStart, $lt: weekEnd } } },
      { $group: { _id: null, total: { $sum: "$total_Income" } } },
    ]),
    Income.aggregate([
      { $match: { sellDate: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: null, total: { $sum: "$total_Income" } } },
    ]),
    Income.aggregate([
      { $match: { sellDate: { $gte: yearStart, $lt: yearEnd } } },
      { $group: { _id: null, total: { $sum: "$total_Income" } } },
    ]),
  ]);

  return {
    daily: daily[0]?.total || 0,
    weekly: weekly[0]?.total || 0,
    monthly: monthly[0]?.total || 0,
    yearly: yearly[0]?.total || 0,
  };
};

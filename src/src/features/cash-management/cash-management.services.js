import mongoose from "mongoose";
import { getOrCreateDailyCash } from "../../utils/getDailyCash.js";
import { CashTransaction } from "./cash-management.model.js";

// @desc    Get daily cash status with history
// @access  Admin
export const getDailyCashService = async (date) => {
  const dailyCash = await getOrCreateDailyCash(date);


  return {
    dailyCash, 
  };
};

// @desc    Add cash-in amount
// @access  Admin
export const addCashInService = async (date, amount, note) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dailyCash = await getOrCreateDailyCash(date, session);

    if (dailyCash.isClosed) {
      throw new Error("Daily cash record is closed for this date.");
    }

    // 1. Create Cash Transaction Record
    await CashTransaction.create(
      [
        {
          businessDate: dailyCash.businessDate,
          type: "IN",
          amount,
          source: "manual",
          note,
        },
      ],
      { session }
    );

    // 2. Update Daily Cash Totals
    dailyCash.cashIn += amount;
    dailyCash.closingCash += amount;

    await dailyCash.save({ session });

    await session.commitTransaction();
    session.endSession();

    return dailyCash;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// @desc    Add cash-out amount
// @access  Admin
export const addCashOutService = async (date, amount, note) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dailyCash = await getOrCreateDailyCash(date, session);

    if (dailyCash.isClosed) {
      throw new Error("Daily cash record is closed for this date.");
    }

    if (dailyCash.closingCash < amount) {
      throw new Error(`Insufficient cash in drawer. Available: ${dailyCash.closingCash}, Required: ${amount}`);
    }

    // 1. Create Cash Transaction Record
    await CashTransaction.create(
      [
        {
          businessDate: dailyCash.businessDate,
          type: "OUT",
          amount,
          source: "manual",
          note,
        },
      ],
      { session }
    );

    // 2. Update Daily Cash Totals
    dailyCash.cashOut += amount;
    dailyCash.closingCash -= amount;

    await dailyCash.save({ session });

    await session.commitTransaction();
    session.endSession();

    return dailyCash;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const getDailyCashHistory = async (date, year, month, page = 1, limit = 10) => {
  let query = {};
  let dailyCash = null;

  if (year) {
    const startYear = parseInt(year);
    let startDate, endDate;

    if (month) {
      const startMonth = parseInt(month) - 1; // JS months are 0-indexed
      startDate = new Date(Date.UTC(startYear, startMonth, 1));
      endDate = new Date(Date.UTC(startYear, startMonth + 1, 1));
    } else {
      startDate = new Date(Date.UTC(startYear, 0, 1));
      endDate = new Date(Date.UTC(startYear + 1, 0, 1));
    }

    query.businessDate = {
      $gte: startDate,
      $lt: endDate,
    };
  } else {
    dailyCash = await getOrCreateDailyCash(date);
    query.businessDate = dailyCash.businessDate;
  }

  // Get total count for pagination
  const total = await CashTransaction.countDocuments(query);

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get paginated history
  const history = await CashTransaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Calculate totals from ALL transactions (not just current page)
  const allTransactions = await CashTransaction.find(query).select('type amount');
  const totals = allTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "IN") {
        acc.totalCashIn += transaction.amount;
      } else if (transaction.type === "OUT") {
        acc.totalCashOut += transaction.amount;
      }
      return acc;
    },
    { totalCashIn: 0, totalCashOut: 0 }
  );

  return {
    dailyCash,
    history,
    totals: {
      totalCashIn: totals.totalCashIn,
      totalCashOut: totals.totalCashOut,
    },
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    filter: {
      date: date || null,
      year: year || null,
      month: month || null,
    },
  };
};
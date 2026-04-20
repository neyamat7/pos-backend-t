import mongoose from "mongoose";
import customerModel from "../customer/customer.model.js";
import supplierModel from "../supplier/supplier.model.js";
import Balance from "./balance.model.js";

// @desc    Create a new balance
// @access  Admin
export const createBalance = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate unique transaction ID if not provided
    if (!data.transaction_Id) {
      const prefix = data.role === "customer" ? "C-TXN" : "S-TXN";
      data.transaction_Id = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    // Create balance
    const balance = new Balance(data);
    const savedBalance = await balance.save({ session });

    // Update related profile
    if (data.role === "customer") {
      throw new Error("Customer not found");
      // const customer = await customerModel.findByIdAndUpdate(
      //   data.balance_for,
      //   {
      //     $inc: { "account_info.balance": data.amount },
      //   },
      //   { new: true, session }
      // );

      // if (!customer) throw new Error("Customer not found");
    } else if (data.role === "supplier") {
      const supplier = await supplierModel.findByIdAndUpdate(
        data.balance_for,
        {
          $inc: { "account_info.balance": data.amount },
        },
        { new: true, session }
      );

      if (!supplier) throw new Error("Supplier not found");
    } else {
      throw new Error("Invalid type or missing ID field");
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return savedBalance;
  } catch (error) {
    // Rollback if anything fails
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// @desc    Get all balances
// @access  Admin or Accountant
export const getAllBalances = async (id, page, limit, filters = {}) => {
  const skip = (page - 1) * limit;

  const query = { balance_for: id };

  // Filter by date range
  if (filters.fromDate || filters.toDate) {
    query.date = {};

    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      fromDate.setUTCHours(0, 0, 0, 0);
      query.date.$gte = fromDate;
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setUTCHours(23, 59, 59, 999);
      query.date.$lte = toDate;
    }
  }

  let balances = await Balance.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Balance.countDocuments(query);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    balances,
  };
};

// @desc    Get balance details by ID
// @access  Admin or Accountant
export const getBalanceById = async (id) => {
  return await Balance.findById(id);
};
// @desc    Add customer balance history and deduct from due
// @access  Admin
export const addCustomerBalanceService = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get current customer data
    const customer = await customerModel
      .findById(data.balance_for)
      .session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    const currentDue = Number(customer.account_info?.due) || 0;
    const paymentAmount = Number(data.amount) || 0;

    // 2. Calculate how much goes to due and how much to balance
    let amountToDeductFromDue = 0;
    let amountToAddToBalance = 0;

    if (paymentAmount <= currentDue) {
      // Payment is less than or equal to due
      amountToDeductFromDue = paymentAmount;
      amountToAddToBalance = 0;
    } else {
      // Payment exceeds due
      amountToDeductFromDue = currentDue; // Pay off all due
      amountToAddToBalance = paymentAmount - currentDue; // Extra goes to balance
    }

    // 3. Create balance record
    // Generate unique transaction ID if not provided
    if (!data.transaction_Id) {
      data.transaction_Id = `C-TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    const balance = new Balance({
      ...data,
      role: "customer",
    });
    const savedBalance = await balance.save({ session });

    // 4. Update customer account
    const updates = {};

    if (amountToDeductFromDue > 0) {
      updates["account_info.due"] = currentDue - amountToDeductFromDue;
    }

    if (amountToAddToBalance > 0) {
      const currentBalance = Number(customer.account_info?.balance) || 0;
      updates["account_info.balance"] = currentBalance + amountToAddToBalance;
    }

    await customerModel.findByIdAndUpdate(
      data.balance_for,
      { $set: updates },
      { new: true, session }
    );

    // 5. Wire payment into DailyCash
    if (paymentAmount > 0) {
      const balanceDate = data.date ? new Date(data.date) : new Date();
      const dailyCash = await getOrCreateDailyCash(balanceDate, session);
      await CashTransaction.create(
        [
          {
            businessDate: dailyCash.businessDate,
            type: "IN",
            amount: paymentAmount,
            source: "other",
            note: `Customer add-balance payment — customer: ${data.balance_for}`,
          },
        ],
        { session }
      );
      dailyCash.cashIn += paymentAmount;
      dailyCash.closingCash += paymentAmount;
      await dailyCash.save({ session });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return savedBalance;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
// @desc    Give a discount to a customer (reduces due, keeps record as discount type)
// @access  Admin
export const applyCustomerDiscountService = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get current customer data
    const customer = await customerModel
      .findById(data.balance_for)
      .session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    const currentDue = Number(customer.account_info?.due) || 0;
    const discountAmount = Number(data.amount) || 0;

    if (discountAmount > currentDue) {
      throw new Error(
        "Discount amount cannot be greater than the current due."
      );
    }

    // 2. Create balance record as 'discount'
    const balance = new Balance({
      ...data,
      transaction_Id:
        data.transaction_Id ||
        `DISC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      role: "customer",
      type: "discount",
      payment_method: "none",
    });
    const savedDiscount = await balance.save({ session });

    // 3. Update customer due ONLY (since this is a discount, not a payment)
    const newDue = currentDue - discountAmount;

    await customerModel.findByIdAndUpdate(
      data.balance_for,
      {
        $set: { "account_info.due": newDue },
      },
      { new: true, session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return savedDiscount;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

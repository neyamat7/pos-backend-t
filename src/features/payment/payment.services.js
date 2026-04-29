import mongoose from "mongoose";
import incomeModel from "../income/income.model.js";
import inventoryLotsModel from "../inventoryLots/inventoryLots.model.js";
import supplierModel from "../supplier/supplier.model.js";
import Payment from "./payment.model.js";

// @desc    create new payment
// @route   POST /api/v1/payments/all/:supplierId
export const createTransaction = async (data, { by } = {}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Save payment
    const payment = new Payment(data);
    await payment.save({ session });

    // Update related InventoryLots
    const lotUpdates = payment.selected_lots_info.map(async (lotInfo) => {
      const { lot_id, profit, discount } = lotInfo;

      // Build dynamic update object
      const updateData = {
        payment_status: "paid",
        "profits.lotProfit": profit,
        extra_discount: discount,
      };

      return inventoryLotsModel.findByIdAndUpdate(
        lot_id,
        { $set: updateData },
        { new: true, session }
      );
    });

    await Promise.all(lotUpdates);

    // Update Supplier balance and due
    const supplier = await supplierModel
      .findById(payment.supplierId)
      .session(session);

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    const prevBalance = Number(supplier.account_info.balance) || 0;
    const prevDue = Number(supplier.account_info.due) || 0;

    const newBalance = prevBalance - (Number(payment.amount_from_balance) || 0);

    // Subtract the total paid amount from the supplier's due
    const newDue = prevDue - (Number(payment.total_paid_amount) || 0);

    supplier.account_info.balance = Math.max(newBalance, 0);
    // Ensure due doesn't go negative
    supplier.account_info.due = Math.max(newDue, 0);

    await supplier.save({ session });

    // Wire actual cash paid to supplier into DailyCash as cash OUT
    const actualCashPaid = Number(payment.total_paid_amount) || 0;
    if (actualCashPaid > 0) {
      const paymentDate = payment.date ? new Date(payment.date) : new Date();
      const dailyCash = await getOrCreateDailyCash(paymentDate, session);
      await CashTransaction.create(
        [
          {
            businessDate: dailyCash.businessDate,
            type: "OUT",
            amount: actualCashPaid,
            source: "other",
            note: `Supplier payment — supplier: ${payment.supplierId}`,
          },
        ],
        { session }
      );
      dailyCash.cashOut += actualCashPaid;
      dailyCash.closingCash -= actualCashPaid;
      await dailyCash.save({ session });
    }

    // Log activity (inside transaction)
    const supplierName = supplier?.basic_info?.name;
    await logActivity({
      model_name: "Payment",
      logs_fields_id: payment._id,
      by,
      action: "Payment Cleared",
      note: `Payment clear for ${supplierName}. Amount:${payment.payable_amount} `,
      session,
    });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Payment and related data saved successfully.",
      payment,
    };
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction failed:", error);
    throw new Error(error.message || "Failed to create transaction");
  }
};

// @desc    Get all transaction by supplier
// @route   GET /api/v1/payments/all/:supplierId
export const getPaymentsBySupplier = async (
  supplierId,
  page,
  limit,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const query = { supplierId };

  // Filter by date range
  if (filters.fromDate || filters.toDate) {
    query.date = {};
    if (filters.fromDate) query.date.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.date.$lte = new Date(filters.toDate);
  }

  let transactions = await Payment.find(query)
    .populate("supplierId")
    .populate("selected_lots_info.lot_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(query);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    transactions,
  };
};

// @desc    view details information
// @route   GET /api/v1/payments/details/:id
export const getPaymentById = async (id) => {
  return await Payment.findById(id)
    .populate("supplierId")
    .populate("inventory_lot_ids");
};

// @desc    Clear full supplier settlement
// @route   POST /api/v1/payments/settlement
export const clearSupplierSettlement = async (data, { by } = {}) => {
  const {
    supplierId,
    date,
    actuallyPaidAmount,
    discountReceived,
    amountFromBalance,
    payment_method,
    transactionId,
    note,
  } = data;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Fetch the supplier
    const supplier = await supplierModel.findById(supplierId).session(session);
    if (!supplier) throw new Error("Supplier not found");

    // 2. Find all unpaid lots that contribute to supplier due
    // - Commission lots: only after stock out
    // - Non-commission lots: immediately (even if in stock)
    const unpaidLots = await inventoryLotsModel
      .find({
        supplierId,
        payment_status: "unpaid",
        $or: [{ status: "stock out" }, { hasCommission: false }],
      })
      .session(session);

    const lotIds = unpaidLots.map((lot) => lot._id);

    // 3. Update Supplier Balance and Due
    const balanceToUse = Number(amountFromBalance) || 0;
    const currentBalance = Number(supplier.account_info.balance) || 0;

    if (balanceToUse > currentBalance) {
      throw new Error("Insufficient balance available");
    }

    // Subtract from balance
    supplier.account_info.balance = Math.max(0, currentBalance - balanceToUse);

    // full settlement = actual cash + discount given by supplier + amount taken from balance
    const totalReduction =
      (Number(actuallyPaidAmount) || 0) +
      (Number(discountReceived) || 0) +
      balanceToUse;

    const currentDue = Number(supplier.account_info.due) || 0;
    supplier.account_info.due = Math.max(0, currentDue - totalReduction);

    await supplier.save({ session });

    // 4. Update Lots Payment Status
    if (lotIds.length > 0) {
      await inventoryLotsModel.updateMany(
        { _id: { $in: lotIds } },
        { $set: { payment_status: "paid" } },
        { session }
      );
    }

    // 5. Create Income record for Discount (Business Profit)
    if ((Number(discountReceived) || 0) > 0) {
      const incomeData = {
        sellDate: new Date(date),
        information: {
          saleId: "SETTLEMENT_DISCOUNT",
          lots_Ids: lotIds,
        },
        total_Sell: 0,
        lot_Commission: 0,
        customer_Commission: 0,
        total_Income: Number(discountReceived),
        received_amount: 0,
        due: 0,
      };
      const income = new incomeModel(incomeData);
      await income.save({ session });
    }

    // 6. Record Payment History
    const paymentRecord = new Payment({
      date: new Date(date),
      supplierId,
      selected_lots_info: unpaidLots.map((lot) => ({
        lot_id: lot._id,
        total_sell: lot.sales?.totalSoldPrice || 0,
        profit: lot.profits?.lotProfit || 0,
        paid_amount: 0,
      })),
      payment_method,
      payable_amount: totalReduction, // Total amount cleared
      amount_from_balance: balanceToUse,
      total_paid_amount: Number(actuallyPaidAmount) || 0,
      discount_received: Number(discountReceived) || 0,
      transactionId:
        transactionId ||
        `SETTLE-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Avoid duplicate null keys
      note: note || "Full settlement of stock out lots",
    });
    await paymentRecord.save({ session });

    // 7. Wire actual cash paid to supplier into DailyCash as cash OUT
    const actualCashOut = Number(actuallyPaidAmount) || 0;
    if (actualCashOut > 0) {
      const settlementDate = date ? new Date(date) : new Date();
      const dailyCash = await getOrCreateDailyCash(settlementDate, session);
      await CashTransaction.create(
        [
          {
            businessDate: dailyCash.businessDate,
            type: "OUT",
            amount: actualCashOut,
            source: "other",
            note: `Supplier settlement — supplier: ${supplierId}`,
          },
        ],
        { session }
      );
      dailyCash.cashOut += actualCashOut;
      dailyCash.closingCash -= actualCashOut;
      await dailyCash.save({ session });
    }

    // 8. Log activity (inside transaction)
    const supplierName = supplier?.basic_info?.name;
    await logActivity({
      model_name: "Payment",
      logs_fields_id: paymentRecord._id,
      by,
      action: "Full Settlement",
      note: `Full settlement for ${supplierName}. Paid:${paymentRecord.total_paid_amount}, Discount:${paymentRecord.discount_received}`,
      session,
    });

    // 9. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Supplier settlement completed successfully",
      payment: paymentRecord,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Settlement failed:", error);
    throw new Error(error.message || "Failed to complete settlement");
  }
};

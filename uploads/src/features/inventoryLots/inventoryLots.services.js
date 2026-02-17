import mongoose from "mongoose";
import { getTotalExpensesByMonth } from "../expense/expense.service.js";
import { getTotalCrateProfitByMonth } from "../inventoryCrate/inventoryCrate.services.js";
import purchaseModel from "../purchase/purchase.model.js";
import saleModel from "../sale/sale.model.js";
import supplierModel from "../supplier/supplier.model.js";
import { adjustSupplierDue } from "../supplier/supplier.service.js";
import inventoryLotsModel from "./inventoryLots.model.js";

// @desc create lost from purchase list also update crate in supplier profile
// @access  Admin
export const createLotsForPurchase = async (purchaseId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find purchase
    const purchase = await purchaseModel.findById(purchaseId).session(session);
    if (!purchase) throw new Error("Purchase not found");
    if (purchase.is_lots_created)
      throw new Error("Lots already created for this purchase");

    const lotsToCreate = [];

    // Loop over suppliers
    for (const item of purchase.items) {
      const supplierId = item.supplier.toString();
      const supplier = await supplierModel
        .findById(supplierId)
        .session(session);
      if (!supplier) throw new Error(`Supplier not found: ${supplierId}`);

      let {
        crate1,
        crate2,
        needToGiveCrate1 = 0,
        needToGiveCrate2 = 0,
      } = supplier.crate_info;

      // Loop over lots for this supplier
      for (const lot of item.lots) {

        // console.log('lot in create lot', lot);

        // Check duplicate lot
        const existingLot = await inventoryLotsModel
          .findOne({ lot_name: lot.lot_name })
          .session(session);
        if (existingLot)
          throw new Error(`Lot name "${lot.lot_name}" already exists`);

        lotsToCreate.push({
          lot_name: lot.lot_name,
          purchase_date: purchase.purchase_date,
          status: "in stock",
          hasCommission: lot.commission_rate > 0,
          isCrated: lot.isCrated,
          isBoxed: lot.isBoxed,
          isPieced: lot.isPieced,
          productsId: lot.productId,
          supplierId,
          purchaseListId: purchaseId,
          box_quantity: lot.box_quantity,
          remaining_boxes: lot.box_quantity,
          piece_quantity: lot.piece_quantity,
          remaining_pieces: lot.piece_quantity,
          carat: {
            carat_Type_1: lot.carat.carat_Type_1,
            carat_Type_2: lot.carat.carat_Type_2,
            remaining_crate_Type_1: lot.carat.carat_Type_1,
            remaining_crate_Type_2: lot.carat.carat_Type_2,
          },
          costs: {
            unitCost: lot.unit_Cost,
            commissionRate: lot.commission_rate || 0,
          },

          expenses: {
            labour: lot.expenses.labour,
            transportation: lot.expenses.transportation,
            van_vara: lot.expenses.van_vara,
            moshjid: lot.expenses.moshjid,
            trading_post: lot.expenses.trading_post,
            other_expenses: lot.expenses.other_expenses,
            custom_expenses: lot.expenses.custom_expenses || [],
            extra_expense: lot.expenses.extra_expense || 0,
            extra_expense_note: lot.expenses.extra_expense_note || "",
            total_expenses:
              lot.expenses.labour +
              lot.expenses.transportation +
              lot.expenses.van_vara +
              lot.expenses.moshjid +
              lot.expenses.trading_post +
              lot.expenses.other_expenses +
              (lot.expenses.extra_expense || 0) +
              (lot.expenses.custom_expenses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0),
          },
        });

        // Deduct crate per lot (Type 1)
        if (lot.carat.carat_Type_1 > crate1) {
          needToGiveCrate1 += lot.carat.carat_Type_1 - crate1;
          crate1 = 0;
        } else {
          crate1 -= lot.carat.carat_Type_1;
        }

        // Deduct crate per lot (Type 2)
        if (lot.carat.carat_Type_2 > crate2) {
          needToGiveCrate2 += lot.carat.carat_Type_2 - crate2;
          crate2 = 0;
        } else {
          crate2 -= lot.carat.carat_Type_2;
        }
      }

      // Update supplier crate info
      supplier.crate_info.crate1 = crate1;
      supplier.crate_info.crate2 = crate2;
      supplier.crate_info.needToGiveCrate1 = needToGiveCrate1;
      supplier.crate_info.needToGiveCrate2 = needToGiveCrate2;

      await supplier.save({ session });
    }

    // Insert all lots
    await inventoryLotsModel.insertMany(lotsToCreate, { session });

    // Mark purchase as lots created
    purchase.is_lots_created = true;
    await purchase.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { success: true, createdLots: lotsToCreate.length };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to create lots: ${error.message}`);
  }
};

// @desc Get all inventory lots
// @access  Admin
export const getAllLots = async (page, limit, search) => {
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.lot_name = { $regex: search, $options: "i" };
  }

  const total = await inventoryLotsModel.countDocuments(query);

  const lots = await inventoryLotsModel
    .find(query)
    .populate("productsId", "productName")
    .populate("supplierId", "basic_info")
    .populate("purchaseListId", "purchase_date status")
    .sort({ status: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    lots,
  };
};

// @desc Get lot details by ID
// @access  Admin
export const getLotById = async (lotId) => {
  const lot = await inventoryLotsModel
    .findById(lotId)
    .populate("productsId", "productName description")
    .populate("supplierId", "name email")
    .populate("purchaseListId", "purchase_date status");

  if (!lot) {
    throw new Error("Lot not found");
  }

  return lot;
};

// @desc Get all lots by supplier
// @access  Admin
export const getAllLotsBySupplier = async (
  supplierId,
  page,
  limit,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const aggregationPipeline = [
    // Stage 1: Match inventory lots by supplier
    {
      $match: {
        supplierId: new mongoose.Types.ObjectId(supplierId),
        ...(filters.fromDate || filters.toDate
          ? {
              purchase_date: {
                ...(filters.fromDate && { $gte: new Date(filters.fromDate) }),
                ...(filters.toDate && { $lte: new Date(filters.toDate) }),
              },
            }
          : {}),
      },
    },

    // Stage 2: Lookup products with search filter
    {
      $lookup: {
        from: "products",
        localField: "productsId",
        foreignField: "_id",
        as: "productsId",
        pipeline: [
          // Apply product search filter here
          ...(filters.search
            ? [
                {
                  $match: {
                    productName: { $regex: filters.search, $options: "i" },
                  },
                },
              ]
            : []),
          {
            $project: { productName: 1, description: 1, createdAt: 1 },
          },
        ],
      },
    },
    // Stage 3: Filter out lots with empty products (ONLY if search is applied)
    ...(filters.search
      ? [
          {
            $match: {
              "productsId.0": { $exists: true }, // At least one product exists
            },
          },
        ]
      : []),
    // Stage 4: Lookup supplier
    {
      $lookup: {
        from: "suppliers",
        localField: "supplierId",
        foreignField: "_id",
        as: "supplierId",
        pipeline: [
          {
            $project: { name: 1, email: 1 },
          },
        ],
      },
    },
    {
      $unwind: "$supplierId", // Convert array to object
    },
    // Stage 5: Lookup purchase list
    {
      $lookup: {
        from: "purchase", // Make sure this matches your collection name
        localField: "purchaseListId",
        foreignField: "_id",
        as: "purchaseListId",
        pipeline: [
          {
            $project: { purchase_date: 1, status: 1 },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$purchaseListId",
        preserveNullAndEmptyArrays: true, // Keep lots even if no purchase list
      },
    },
    // Stage 6: Sort and paginate
    {
      $addFields: {
        statusOrder: {
          $cond: [{ $eq: ["$status", "in stock"] }, 0, 1],
        },
      },
    },
    { $sort: { statusOrder: 1, createdAt: -1 } },
  ];

  // Execute aggregation for data
  const lots = await inventoryLotsModel.aggregate([
    ...aggregationPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  // Execute aggregation for total count
  const totalResult = await inventoryLotsModel.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);

  const total = totalResult[0]?.total || 0;

  // Only calculate summary if date filters are provided
  let summary = null;
  
  if (filters.fromDate && filters.toDate) {
    // Execute aggregation for summary data (across all filtered lots, not just current page)
    const summaryResult = await inventoryLotsModel.aggregate([
      // Use only the match stages from the pipeline (before pagination)
      aggregationPipeline[0], // Match by supplier and date
      ...(filters.search ? [aggregationPipeline[1], aggregationPipeline[2]] : [aggregationPipeline[1]]),
      {
        $group: {
          _id: null,
          totalCratesSold: {
            $sum: {
              $add: [
                { $ifNull: ["$sales.totalCrateType1Sold", 0] },
                { $ifNull: ["$sales.totalCrateType2Sold", 0] }
              ]
            }
          },
          totalBoxesSold: { $sum: "$sales.totalBoxSold" },
          totalPiecesSold: { $sum: "$sales.totalPieceSold" },
          totalSoldAmount: { $sum: "$sales.totalSoldPrice" },
        },
      },
    ]);

    // Fetch supplier's due amount
    const supplier = await supplierModel.findById(supplierId).select("account_info.due");
    const supplierDue = supplier?.account_info?.due || 0;

    // Extract summary data
    summary = summaryResult[0] || {
      totalCratesSold: 0,
      totalBoxesSold: 0,
      totalPiecesSold: 0,
      totalSoldAmount: 0,
    };
    delete summary._id; // Remove the _id field from summary

    // Add supplier due to summary
    summary.supplierDue = supplierDue;
  }

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    lots,
    ...(summary && { summary }), // Only include summary if it exists
  };
};

// @desc Helper to calculate final profit/loss for a lot at stock out
export const calculateLotFinalProfitLoss = (lot) => {
  const { totalKgSold, totalSoldPrice } = lot.sales;
  const { unitCost } = lot.costs;
  const { hasCommission } = lot;

  let originalPrice = 0;
  let loss = 0;
  let customerProfit = 0;

  // Calculate loss only for non-commission products
  if (!hasCommission) {
    // Check if product is box-based, piece-based or kg-based
    if (lot.isBoxed) {
      // Box-based calculation
      originalPrice = lot.box_quantity * unitCost;
      loss = originalPrice - totalSoldPrice;
      if (loss < 0) loss = 0;
    } else if (lot.isPieced) {
      // Piece-based calculation
      originalPrice = lot.piece_quantity * unitCost;
      loss = originalPrice - totalSoldPrice;
      if (loss < 0) loss = 0;
    } else {
      //  Kg-based calculation
      originalPrice = totalKgSold * unitCost;
      loss = originalPrice - totalSoldPrice;
      if (loss < 0) loss = 0;
    }

    // Calculate customerProfit for non-commission products
    // Ensure customerProfit is never negative (if loss, profit = 0)
    customerProfit = Math.max(0, totalSoldPrice - originalPrice);
  }

  return { loss, customerProfit };
};

// @desc Update lot status
// @access  Admin
export const updateLotStatus = async (lotId, newStatus) => {
  const allowedStatuses = ["in stock", "stock out"];

  // Validate incoming status
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`);
  }

  // Find the lot
  const lot = await inventoryLotsModel.findById(lotId);
  if (!lot) {
    throw new Error("Lot not found");
  }

  // Update status
  lot.status = newStatus;

  if (newStatus === "stock out") {
    const { loss, customerProfit } = calculateLotFinalProfitLoss(lot);
    lot.profits.lot_loss = loss;
    if (!lot.hasCommission) {
      lot.profits.customerProfit = customerProfit;
    }
  }

  await lot.save();

  return lot;
};

// @desc Controller to get all in-stock loots
// @access  Admin
export const getAllInStockLots = async () => {
  const lots = await inventoryLotsModel
    .find({ status: "in stock" })
    .sort({ createdAt: -1 })
    .populate("productsId", "productName")
    .populate("supplierId", "basic_info.name")
    .populate("purchaseListId", "purchase_date");

  return lots;
};

// @desc    Get all unpaid & out-of-stock lots
// @access  Admin
export const getUnpaidAndOutOfStockLots = async () => {
  return await inventoryLotsModel
    .find({
      payment_status: "unpaid",
      status: "stock out",
    })
    .populate("supplierId", "name phone")
    .populate("productsId", "product_name")
    .populate("purchaseListId", "invoice_number")
    .sort({ createdAt: -1 });
};

// @desc    Get all unpaid & out-of-stock lots by supplier
// @access  Admin
export const getUnpaidAndOutOfStockLotsBySupplier = async (supplierId) => {
  return await inventoryLotsModel
    .find({
      supplierId: supplierId,
      payment_status: "unpaid",
      status: "stock out",
    })
    .populate("supplierId", "name phone")
    .populate("productsId", "product_name")
    .populate("purchaseListId", "invoice_number")
    .sort({ createdAt: -1 });
};

// @desc    Get all unpaid & out-of-stock lots
// @access  Admin
export const adjustStockService = async (lotId, stockAdjustData) => {
  const { unit_quantity, reason_note } = stockAdjustData;

  const lot = await inventoryLotsModel.findById(lotId);
  if (!lot) {
    throw new Error("Inventory lot not found");
  }

  const { totalKgSold, totalSoldPrice } = lot.sales;
  const { unitCost } = lot.costs;
  const { box_quantity } = lot;
  const { hasCommission } = lot;

  // Update stock_adjust fields
  lot.stock_adjust.unit_quantity = unit_quantity;
  lot.stock_adjust.reason_note = reason_note;

  let originalPrice = 0;
  let loss = 0;

  // Determine calculation type
  if (lot.isBoxed) {
    // BOX-based product
    originalPrice = lot.box_quantity * unitCost;
    loss = originalPrice - totalSoldPrice;
    if (loss < 0) loss = 0;
  } else if (lot.isPieced) {
    // PIECE-based product
    originalPrice = lot.piece_quantity * unitCost;
    loss = originalPrice - totalSoldPrice;
    if (loss < 0) loss = 0;
  } else {
    // KG-based product
    originalPrice = (totalKgSold + unit_quantity) * unitCost;
    loss = originalPrice - totalSoldPrice;
    if (loss < 0) loss = 0;
  }

  // Update profits
  lot.profits.lot_loss = loss;

  if (!hasCommission) {
    lot.profits.customerProfit = totalSoldPrice - originalPrice;
  }

  await lot.save();
  return lot;
};

// @desc Add or update extra expense to a lot
// @access Admin
export const updateExtraExpense = async (lotId, extraExpenseData) => {
  const { extra_expense, extra_expense_note } = extraExpenseData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const lot = await inventoryLotsModel.findById(lotId).session(session);
    if (!lot) {
      throw new Error("Lot not found");
    }

    // Update extra expense fields
    lot.expenses.extra_expense = extra_expense || 0;
    lot.expenses.extra_expense_note = extra_expense_note || "";

    // Recalculate total_expenses
    const totalCustomExpenses = lot.expenses.custom_expenses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    lot.expenses.total_expenses =
      lot.expenses.labour +
      lot.expenses.transportation +
      lot.expenses.van_vara +
      lot.expenses.moshjid +
      lot.expenses.trading_post +
      lot.expenses.other_expenses +
      lot.expenses.extra_expense +
      totalCustomExpenses;

    await lot.save({ session });

    // If lot is stock out, adjust supplier due with new expenses
    if (lot.status === "stock out") {
      const totalSoldAmount = Number(lot.sales?.totalSoldPrice) || 0;
      const lotProfit = Number(lot.profits?.lotProfit) || 0;
      const totalExpenses = lot.expenses.total_expenses;

      // Calculate new supplier due amount
      const newDueAmount = totalSoldAmount - lotProfit - totalExpenses;
      
      // Get previous due added (default to 0 if not set)
      const previousDueAdded = Number(lot.supplierDueAdded) || 0;

      // Adjust supplier due by the difference
      await adjustSupplierDue({
        supplierId: lot.supplierId,
        previousDueAdded,
        newDueAmount,
        session
      });

      // Update the lot's supplierDueAdded to the new amount
      lot.supplierDueAdded = newDueAmount;
      await lot.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return lot;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// @desc Calculate profit/loss (all-time or filtered by purchase date)
// @access Public
export const calculateProfitLoss = async (filters = {}) => {
  try {

    // Base query: always show stock out lots
    const query = {
      status: "stock out",
    };

    // Add date filter only if provided
    if (filters.purchase_date) {
      const startDate = new Date(filters.purchase_date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(filters.purchase_date);
      endDate.setHours(23, 59, 59, 999);

      query.purchase_date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Fetch lots
    const lots = await inventoryLotsModel.find(query).select("profits");

    // Calculate totals
    const totals = lots.reduce(
      (acc, lot) => {
        acc.totalCustomerProfit += lot.profits.customerProfit || 0;
        acc.totalLotProfit += lot.profits.lotProfit || 0;
        acc.totalCombinedProfit += lot.profits.totalProfit || 0;
        acc.totalLoss += lot.profits.lot_loss || 0;
        return acc;
      },
      {
        totalCustomerProfit: 0,
        totalLotProfit: 0,
        totalCombinedProfit: 0,
        totalLoss: 0,
      }
    );

    return {
      success: true,
      data: {
        ...totals,
        recordCount: lots.length,
      },
    };
  } catch (error) {
    throw error;
  }
};

// @desc Get inventory lots analytics (filtered by month, supplier)
// @access Admin
export const getLotsAnalytics = async (
  page,
  limit,
  monthName,
  supplierId
) => {
  const skip = (page - 1) * limit;
  const matchStage = {};

  // 1. Filter by Month (Default: Current Month)
  const year = new Date().getFullYear();
  let monthIndex;

  if (monthName) {
    // If month is provided, parse it
    monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  } else {
    // Default to current month
    monthIndex = new Date().getMonth();
  }

  if (!isNaN(monthIndex)) {
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    matchStage.purchase_date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // 2. Filter by Supplier ID
  if (supplierId) {
    matchStage.supplierId = new mongoose.Types.ObjectId(supplierId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              lot_name: 1,
              purchase_date: 1,
              status: 1,
              hasCommission: 1,
              profits: {
                lotProfit: 1,
                customerProfit: 1,
                totalProfit: 1,
                lot_loss: 1,
              },
            },
          },
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalCustomerProfit: { $sum: "$profits.customerProfit" },
              totalLotProfit: { $sum: "$profits.lotProfit" },
              totalCombinedProfit: { $sum: "$profits.totalProfit" },
              totalLoss: { $sum: "$profits.lot_loss" },
            },
          },
        ],
        count: [{ $count: "total" }],
      },
    },
  ];

  // Step 1: Execute aggregation to get lot profit/loss data
  const result = await inventoryLotsModel.aggregate(pipeline);

  const lots = result[0].data;
  const total = result[0].count[0]?.total || 0;
  const totals = result[0].totals[0] || {
    totalCustomerProfit: 0,
    totalLotProfit: 0,
    totalCombinedProfit: 0,
    totalLoss: 0,
  };
  delete totals._id; // Remove _id from totals

  // Step 2: Get total expenses for the same month
  // Call the expense service to get Expense + CashTransaction OUT data
  const expenseData = await getTotalExpensesByMonth(monthName, year);

  // Step 3: Get total crate profit for the same month
  // Call the crate service to get profit from crate re-stock transactions
  const crateProfitData = await getTotalCrateProfitByMonth(monthName, year);

  // Step 4: Calculate Gross Profit and Net Profit
  // Gross Profit = Total Combined Profit from lots + Crate Profit
  const grossProfit = totals.totalCombinedProfit + crateProfitData.totalCrateProfit;

  // Net Profit = Gross Profit - Total Loss - Total Expenses
  // Ensure netProfit is never negative
  const netProfit = Math.max(0, grossProfit - totals.totalLoss - expenseData.totalExpenses);

  // Step 5: Add expense, crate profit, and profit calculations to totals
  totals.totalExpenses = expenseData.totalExpenses;           // Total expenses (Expense + CashOut)
  totals.expenseBreakdown = {
    expenseRecords: expenseData.totalExpenseAmount,           // From Expense model
    cashOutTransactions: expenseData.totalCashOut,            // From CashTransaction (type: OUT)
  };
  
  totals.totalCrateProfit = crateProfitData.totalCrateProfit; // Total profit from crate re-stock
  totals.crateProfitBreakdown = {
    type1Profit: crateProfitData.breakdown.type1.profit,      // Type 1 crate profit
    type2Profit: crateProfitData.breakdown.type2.profit,      // Type 2 crate profit
    type1Quantity: crateProfitData.breakdown.type1.quantity,  // Type 1 crate count
    type2Quantity: crateProfitData.breakdown.type2.quantity,  // Type 2 crate count
  };
  
  totals.grossProfit = grossProfit;                           // Lot Profit + Crate Profit
 
  totals.netProfit = netProfit;                               // Gross Profit - Operating Expenses

  // Step 6: Return complete analytics with all profit metrics
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    lots,
    totals,
  };
};

// @desc Delete a lot safely (reverts crates, checks sales)
// @access Admin
export const deleteLotService = async (lotId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch Lot
    const lot = await inventoryLotsModel.findById(lotId).session(session);
    if (!lot) {
      throw new Error("Lot not found");
    }

    // 2. Safety Check: Ensure no sales exist for this lot
    const saleCount = await saleModel.countDocuments({
      "items.selected_lots.lotId": lotId,
    }).session(session);

    if (saleCount > 0) {
      throw new Error(`Cannot delete lot. It has ${saleCount} related sales.`);
    }

    // 3. Fetch Supplier to revert crates
    const supplier = await supplierModel.findById(lot.supplierId).session(session);
    if (!supplier) {
      throw new Error("Associated supplier not found");
    }

    // 4. Revert Crate Balance (Type 1)
    const lotsCrate1 = lot.carat?.carat_Type_1 || 0;
    if (lotsCrate1 > 0) {
      if (supplier.crate_info.needToGiveCrate1 >= lotsCrate1) {
        // We owed them these crates, now we don't.
        supplier.crate_info.needToGiveCrate1 -= lotsCrate1;
      } else {
        // We owed less than what this lot used, so the rest goes back to their hand.
        const remaining = lotsCrate1 - supplier.crate_info.needToGiveCrate1;
        supplier.crate_info.needToGiveCrate1 = 0;
        supplier.crate_info.crate1 += remaining;
      }
    }

    // 5. Revert Crate Balance (Type 2)
    const lotsCrate2 = lot.carat?.carat_Type_2 || 0;
    if (lotsCrate2 > 0) {
      if (supplier.crate_info.needToGiveCrate2 >= lotsCrate2) {
         // We owed them these crates, now we don't.
        supplier.crate_info.needToGiveCrate2 -= lotsCrate2;
      } else {
         // We owed less than what this lot used, so the rest goes back to their hand.
        const remaining = lotsCrate2 - supplier.crate_info.needToGiveCrate2;
        supplier.crate_info.needToGiveCrate2 = 0;
        supplier.crate_info.crate2 += remaining;
      }
    }

    // 6. Save Supplier Changes
    await supplier.save({ session });

    // 7. Delete the Lot
    await lot.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: "Lot deleted and crates reverted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


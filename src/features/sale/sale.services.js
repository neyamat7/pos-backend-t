import mongoose from "mongoose";

import customerModel from "../customer/customer.model.js";
import customerCrateHistoryModel from "../customerCrateHistory/customerCrateHistory.model.js";
import incomeModel from "../income/income.model.js";
import inventoryLotsModel from "../inventoryLots/inventoryLots.model.js";
import { calculateLotFinalProfitLoss } from "../inventoryLots/inventoryLots.services.js";
import { updateSupplierDueForStockOut } from "../supplier/supplier.service.js";
import Sale from "./sale.model.js";

// @desc Create sale a sale list + Update customer collection  ( caret info + due + balance ) Update inventory lots ( total sold + total sold kg + lotCommission + customerCommission ) + Create Income document
// @access  Admin
export const createSale = async (saleData) => {
  // console.log('saleData in sale services', saleData);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create the sale
    const [sale] = await Sale.create([saleData], { session });

    // 2. Get customer data
    const customer = await customerModel
      .findById(saleData.customerId)
      .session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // 2.1 Update sale with current customer financial state as historical data
    sale.payment_details.previous_due = customer.account_info?.due || 0;
    sale.payment_details.previous_balance = customer.account_info?.balance || 0;

    // --- Balance Usage Logic ---
    const initialDueAmount = Number(saleData.payment_details?.due_amount) || 0;
    const currentCustomerBalance = Number(customer.account_info?.balance) || 0;

    let amountUsedFromBalance = 0;
    let finalSaleDueAmount = initialDueAmount;

    if (initialDueAmount > 0 && currentCustomerBalance > 0) {
      amountUsedFromBalance = Math.min(
        initialDueAmount,
        currentCustomerBalance
      );
      finalSaleDueAmount = initialDueAmount - amountUsedFromBalance;
    }

    // Update sale document with calculated balance usage and adjusted due
    sale.payment_details.received_amount_from_balance = amountUsedFromBalance;
    sale.payment_details.due_amount = finalSaleDueAmount;
    await sale.save({ session });

    // 3. Calculate total crates used in this sale
    let totalCrateType1 = 0;
    let totalCrateType2 = 0;

    saleData.items.forEach((item) => {
      item.selected_lots.forEach((lot) => {
        totalCrateType1 += Number(lot.crate_type1) || 0;
        totalCrateType2 += Number(lot.crate_type2) || 0;
      });
    });

    // 4. Update customer data
    const updates = {};

    // Update due (add the FINAL balanced-adjusted due_amount)
    updates["account_info.due"] =
      (Number(customer.account_info?.due) || 0) + finalSaleDueAmount;

    // Update balance (subtract the amount used)
    if (amountUsedFromBalance > 0) {
      updates["account_info.balance"] =
        currentCustomerBalance - amountUsedFromBalance;
    }

    // Update crates
    const newCrateType1 =
      (Number(customer.crate_info?.type_1) || 0) + totalCrateType1;
    const newCrateType2 =
      (Number(customer.crate_info?.type_2) || 0) + totalCrateType2;

    updates["crate_info.type_1"] = newCrateType1;
    updates["crate_info.type_2"] = newCrateType2;

    // 5. Apply updates to customer
    await customerModel.findByIdAndUpdate(
      saleData.customerId,
      { $set: updates },
      { session, new: true }
    );

    let lotIds = [];
    // 6. Update inventory lots
    for (const item of saleData.items) {
      for (const lot of item.selected_lots) {
        lotIds.push(lot.lotId);
        // Get current lot data
        const inventoryLot = await inventoryLotsModel
          .findById(lot.lotId)
          .session(session);

        if (!inventoryLot) {
          throw new Error(`InventoryLot not found: ${lot.lotId}`);
        }

        let newStatus = inventoryLot.status;
        // for check box quantity and update status
        if (lot.isBoxed || Number(lot.box_quantity) > 0) {
          if (Number(inventoryLot.remaining_boxes) < Number(lot.box_quantity)) {
            throw new Error(`Not enough boxes in lot: ${lot.lot_name}`);
          }

          newStatus =
            Number(inventoryLot.remaining_boxes) - Number(lot.box_quantity) ===
            0
              ? "stock out"
              : "in stock";
        }

        // for check piece quantity and update status
        if (lot.isPieced || Number(lot.piece_quantity) > 0) {
          if (
            Number(inventoryLot.remaining_pieces) < Number(lot.piece_quantity)
          ) {
            throw new Error(`Not enough pieces in lot: ${lot.lot_name}`);
          }

          newStatus =
            Number(inventoryLot.remaining_pieces) -
              Number(lot.piece_quantity) ===
            0
              ? "stock out"
              : "in stock";
        }

        // for check bag quantity and update status
        if (lot.isBagged || Number(lot.bag_quantity) > 0) {
          if (Number(inventoryLot.remaining_bags) < Number(lot.bag_quantity)) {
            throw new Error(`Not enough bags in lot: ${lot.lot_name}`);
          }

          newStatus =
            Number(inventoryLot.remaining_bags) - Number(lot.bag_quantity) === 0
              ? "stock out"
              : "in stock";
        }

        // for check crate quantity and update status
        if (Number(lot.crate_type1) > 0 || Number(lot.crate_type2) > 0) {
          if (
            Number(inventoryLot.carat.remaining_crate_Type_1) <
            Number(lot.crate_type1)
          ) {
            throw new Error(`Not enough crate in lot: ${lot.lot_name}`);
          }

          if (
            Number(inventoryLot.carat.remaining_crate_Type_2) <
            Number(lot.crate_type2)
          ) {
            throw new Error(`Not enough crate in lot: ${lot.lot_name}`);
          }

          newStatus =
            Number(inventoryLot.carat.remaining_crate_Type_1) -
              Number(lot.crate_type1) ===
              0 &&
            Number(inventoryLot.carat.remaining_crate_Type_2) -
              Number(lot.crate_type2) ===
              0
              ? "stock out"
              : "in stock";
        }

        // Calculate increments for this lot
        const kgSold = Number(lot.kg) || 0;
        const boxSold = Number(lot.box_quantity) || 0;
        const bagSold = Number(lot.bag_quantity) || 0;
        const pieceSold = Number(lot.piece_quantity) || 0;
        const crateType1Sold = Number(lot.crate_type1) || 0;
        const crateType2Sold = Number(lot.crate_type2) || 0;
        const soldPrice = Number(lot.selling_price) || 0;
        const lotCommission = Number(lot.lot_commission_amount) || 0;
        const customerCommission = Number(lot.customer_commission_amount) || 0;
        const lotProfit = Number(lot.lot_profit) || 0;

        // customerProfit depends on commission status
        const customerProfit = inventoryLot.hasCommission
          ? Number(lot.customer_commission_amount) || 0 // Commission lot: use customer commission
          : lotProfit; // Non-commission lot: use lot profit

        const totalProfit =
          lotProfit + (Number(lot.lot_commission_amount) || 0);

        // Prepare lot updates
        const lotUpdates = {
          // Increment sales
          "sales.totalKgSold":
            (Number(inventoryLot.sales?.totalKgSold) || 0) + kgSold,
          "sales.totalBoxSold":
            (Number(inventoryLot.sales?.totalBoxSold) || 0) + boxSold,
          "sales.totalBagSold":
            (Number(inventoryLot.sales?.totalBagSold) || 0) + bagSold,
          "sales.totalPieceSold":
            (Number(inventoryLot.sales?.totalPieceSold) || 0) + pieceSold,
          "sales.totalCrateType1Sold":
            (Number(inventoryLot.sales?.totalCrateType1Sold) || 0) +
            crateType1Sold,
          "sales.totalCrateType2Sold":
            (Number(inventoryLot.sales?.totalCrateType2Sold) || 0) +
            crateType2Sold,
          "sales.totalSoldPrice":
            (Number(inventoryLot.sales?.totalSoldPrice) || 0) + soldPrice,

          // Increment profits (lotProfit only for commission-based lots)
          "profits.lotProfit": inventoryLot.hasCommission
            ? (Number(inventoryLot.profits?.lotProfit) || 0) + lotCommission
            : Number(inventoryLot.profits?.lotProfit) || 0,
          "profits.customerProfit":
            (Number(inventoryLot.profits?.customerProfit) || 0) +
            customerProfit,
          "profits.totalProfit":
            (Number(inventoryLot.profits?.totalProfit) || 0) + totalProfit,
          remaining_boxes:
            (Number(inventoryLot.remaining_boxes) || 0) - boxSold,
          remaining_bags: (Number(inventoryLot.remaining_bags) || 0) - bagSold,
          remaining_kg: (Number(inventoryLot.remaining_kg) || 0) - kgSold,
          remaining_pieces:
            (Number(inventoryLot.remaining_pieces) || 0) - pieceSold,

          "carat.remaining_crate_Type_1":
            Number(inventoryLot.carat.remaining_crate_Type_1) -
            (Number(lot.crate_type1) || 0),
          "carat.remaining_crate_Type_2":
            Number(inventoryLot.carat.remaining_crate_Type_2) -
            (Number(lot.crate_type2) || 0),

          status: newStatus,
        };

        // If lot is stock out, calculate final profit/loss and update supplier due
        if (newStatus === "stock out") {
          const updatedLotForCalc = {
            ...inventoryLot.toObject(),
            sales: {
              ...inventoryLot.sales,
              totalKgSold:
                (Number(inventoryLot.sales?.totalKgSold) || 0) + kgSold,
              totalBoxSold:
                (Number(inventoryLot.sales?.totalBoxSold) || 0) + boxSold,
              totalPieceSold:
                (Number(inventoryLot.sales?.totalPieceSold) || 0) + pieceSold,
              totalBagSold:
                (Number(inventoryLot.sales?.totalBagSold) || 0) + bagSold,
              totalSoldPrice:
                (Number(inventoryLot.sales?.totalSoldPrice) || 0) + soldPrice,
            },
          };
          const { loss, customerProfit: finalCustomerProfit } =
            calculateLotFinalProfitLoss(updatedLotForCalc);

          lotUpdates["profits.lot_loss"] = loss;

          if (!inventoryLot.hasCommission) {
            lotUpdates["profits.customerProfit"] = finalCustomerProfit;
            // Update total profit to reflect final customer profit
            lotUpdates["profits.totalProfit"] = finalCustomerProfit;
          }

          // Update supplier due when lot goes stock out (only if not already credited at purchase)
          if ((inventoryLot.supplierDueAdded || 0) === 0) {
            const totalSoldAmount =
              (Number(inventoryLot.sales?.totalSoldPrice) || 0) + soldPrice;
            const lotProfit = Number(inventoryLot.profits?.lotProfit) || 0;
            const totalExpenses =
              Number(inventoryLot.expenses?.total_expenses) || 0;

            const result = await updateSupplierDueForStockOut({
              supplierId: inventoryLot.supplierId,
              totalSoldAmount,
              lotProfit,
              totalExpenses,
              session,
            });

            // Store the supplier due amount in the lot for future adjustments
            lotUpdates["supplierDueAdded"] = result.supplierDueAmount;
          } else {
            // Supplier already credited at purchase time
            // Stay with the current purchase-time value
            lotUpdates["supplierDueAdded"] = inventoryLot.supplierDueAdded;
          }
        }

        // Apply updates to inventory lot
        await inventoryLotsModel.findByIdAndUpdate(
          lot.lotId,
          { $set: lotUpdates },
          { session, new: true }
        );
      }
    }

    // 7. Create Income document
    const incomeData = {
      sellDate: new Date(saleData.sale_date),
      information: {
        saleId: sale._id.toString(),
        lots_Ids: lotIds,
      },
      total_Sell: Number(saleData.payment_details?.payable_amount) || 0,
      lot_Commission: Number(saleData.total_lots_commission) || 0,
      customer_Commission: Number(saleData.total_custom_commission) || 0,

      total_Income: Number(saleData.total_profit) || 0,

      received_amount: Number(sale.payment_details?.received_amount) || 0,
      received_amount_from_balance:
        sale.payment_details.received_amount_from_balance || 0,
      due: Number(sale.payment_details?.due_amount) || 0,
    };

    await incomeModel.create([incomeData], { session });

    // 8. Create Customer Crate History if crates used
    if (totalCrateType1 > 0 || totalCrateType2 > 0) {
      const crateHistoryData = {
        saleId: sale._id,
        customerId: saleData.customerId,
        crate_type1: totalCrateType1,
        crate_type2: totalCrateType2,
        crate_type1_price:
          Number(saleData.payment_details?.total_crate_type1_price) || 0,
        crate_type2_price:
          Number(saleData.payment_details?.total_crate_type2_price) || 0,
      };

      await customerCrateHistoryModel.create([crateHistoryData], { session });
    }

    // 9. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return sale;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// @desc    Get all sales
// @access  Admin
export const getAllSales = async (search, page, limit) => {
  const skip = (page - 1) * limit;

  let pipeline = [];

  if (search) {
    // Pipeline with search
    pipeline = [
      // Step 1: Unwind items array
      { $unwind: "$items" },

      // Step 2: Unwind selected_lots array
      { $unwind: "$items.selected_lots" },

      // Step 3: Lookup lot details for matching
      {
        $lookup: {
          from: "inventorylots", // Make sure this matches your collection name
          localField: "items.selected_lots.lotId",
          foreignField: "_id",
          as: "lotInfo",
        },
      },

      // Step 4: Unwind lotInfo
      { $unwind: { path: "$lotInfo", preserveNullAndEmptyArrays: true } },

      // Step 5: Match the lot_name (case-insensitive search)
      {
        $match: {
          "lotInfo.lot_name": {
            $regex: search,
            $options: "i",
          },
        },
      },

      // Step 6: Sort by createdAt
      { $sort: { createdAt: -1 } },
    ];
  } else {
    // Pipeline without search
    pipeline = [{ $sort: { createdAt: -1 } }];
  }

  // Count total documents
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Sale.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  // Add pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  // Execute aggregation
  let sales = await Sale.aggregate(pipeline);

  // Populate references
  sales = await Sale.populate(sales, [
    {
      path: "customerId",
      select:
        "basic_info.name contact_info.phone contact_info.email contact_info.location account_info.due account_info.balance",
    },
    {
      path: "items.productId",
      select: "productName productNameBn basePrice categoryId isCrated isBoxed isBagged is_discountable sell_by_piece",
      populate: {
        path: "categoryId",
        select: "categoryName",
      },
    },
    {
      path: "items.selected_lots.lotId",
      select: "lot_name commissionRate",
    },
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    sales,
  };
};

// @desc    Get all sales by customer with search and pagination
// @access  Admin
export const getAllSalesByCustomer = async (
  customerId,
  page,
  limit,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const aggregationPipeline = [
    // Stage 1: Match sales by customer
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(customerId),
      },
    },
    // Stage 2: Apply date filtering if fromDate or toDate is provided
    ...(filters.fromDate || filters.toDate
      ? [
          {
            $match: {
              sale_date: {
                ...(filters.fromDate && {
                  $gte: new Date(filters.fromDate).toISOString().split("T")[0],
                }),
                ...(filters.toDate && {
                  $lte: new Date(filters.toDate).toISOString().split("T")[0],
                }),
              },
            },
          },
        ]
      : []),
    // Stage 3: Unwind items to search within them
    {
      $unwind: "$items",
    },
    // Stage 4: Lookup product details with search filter
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productData",
        pipeline: [
          // Apply product search filter here
          ...(filters.search
            ? [
                {
                  $match: {
                    $or: [
                      {
                        productName: { $regex: filters.search, $options: "i" },
                      },
                      {
                        productNameBn: {
                          $regex: filters.search,
                          $options: "i",
                        },
                      },
                    ],
                  },
                },
              ]
            : []),
          // Lookup category
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryData",
              pipeline: [
                {
                  $project: { categoryName: 1 },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$categoryData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              productName: 1,
              productNameBn: 1,
              basePrice: 1,
              categoryId: 1,
              isCrated: 1,
              isBoxed: 1,
              isBagged: 1,
              is_discountable: 1,
              sell_by_piece: 1,
              categoryName: "$categoryData.categoryName",
            },
          },
        ],
      },
    },
    // Stage 5: Map product details back to the unwound item
    {
      $addFields: {
        "items.productId": { $arrayElemAt: ["$productData", 0] },
      },
    },
    // Stage 6: Lookup lot details
    {
      $lookup: {
        from: "inventorylots",
        localField: "items.selected_lots.lotId",
        foreignField: "_id",
        as: "lotData",
        pipeline: [
          {
            $project: { lot_name: 1, commissionRate: 1 },
          },
        ],
      },
    },
    // Stage 7: Replace lotId with actual lot data in selected_lots
    {
      $addFields: {
        "items.selected_lots": {
          $map: {
            input: "$items.selected_lots",
            as: "lot",
            in: {
              $mergeObjects: [
                "$$lot",
                {
                  lotId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$lotData",
                          as: "ld",
                          cond: { $eq: ["$$ld._id", "$$lot.lotId"] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    // Stage 8: Filter out items with empty products (ONLY if search is applied)
    ...(filters.search
      ? [
          {
            $match: {
              "items.productId": { $ne: null }, // Product exists after filtering
            },
          },
        ]
      : []),
    // Stage 9: Lookup customer details
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerData",
        pipeline: [
          {
            $project: {
              "basic_info.name": 1,
              "contact_info.phone": 1,
              "contact_info.email": 1,
              "account_info.due": 1,
              "account_info.balance": 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        customerId: { $arrayElemAt: ["$customerData", 0] },
      },
    },
    // Stage 10: Remove temporary fields
    {
      $project: {
        productData: 0,
        lotData: 0,
        customerData: 0,
      },
    },
    // Stage 11: Group back by sale
    {
      $group: {
        _id: "$_id",
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        sale_date: { $first: "$sale_date" },
        customerId: { $first: "$customerId" },
        total_custom_commission: { $first: "$total_custom_commission" },
        total_lots_commission: { $first: "$total_lots_commission" },
        total_profit: { $first: "$total_profit" },
        payment_details: { $first: "$payment_details" },
        items: { $push: "$items" },
      },
    },
    // Stage 12: Filter out sales with empty items (if search applied)
    ...(filters.search
      ? [
          {
            $match: {
              "items.0": { $exists: true }, // At least one item exists
            },
          },
        ]
      : []),
    // Stage 13: Sort
    { $sort: { createdAt: -1 } },
  ];

  // Execute aggregation for data
  const sales = await Sale.aggregate([
    ...aggregationPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  // Execute aggregation for total count
  const totalResult = await Sale.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    sales,
  };
};

// @desc    Get sale details by ID
// @access  Admin
export const getSaleById = async (id) => {
  const sale = await Sale.findById(id)
    .populate(
      "customerId",
      "basic_info.name contact_info.phone contact_info.email account_info.due account_info.balance"
    )
    .populate({
      path: "items.productId",
      select: "productName productNameBn basePrice categoryId isCrated isBoxed isBagged is_discountable sell_by_piece",
      populate: {
        path: "categoryId",
        select: "categoryName",
      },
    })
    .populate("items.selected_lots.lotId", "lot_name commissionRate");

  return sale;
};

// @desc Get lot summary with sales list by lotId
// @access private
export const getLotSummaryService = async (lotId) => {
  const data = await Sale.aggregate([
    { $unwind: "$items" },
    { $unwind: "$items.selected_lots" },

    // @desc Filter by lotId from params
    {
      $match: {
        "items.selected_lots.lotId": new mongoose.Types.ObjectId(lotId),
      },
    },

    // @desc Join lot info
    {
      $lookup: {
        from: "inventorylots",
        localField: "items.selected_lots.lotId",
        foreignField: "_id",
        as: "lot",
      },
    },
    { $unwind: "$lot" },

    // @desc Join supplier info
    {
      $lookup: {
        from: "suppliers",
        localField: "lot.supplierId",
        foreignField: "_id",
        as: "supplier",
      },
    },
    { $unwind: "$supplier" },

    // @desc Project sale-level and lot-level fields
    {
      $project: {
        _id: 0,
        lot_name: "$lot.lot_name",
        supplier_name: "$supplier.basic_info.name",
        lot_expenses: "$lot.expenses",

        sale: {
          // Product type flags
          isBoxed: "$items.selected_lots.isBoxed",
          isPieced: "$items.selected_lots.isPieced",

          // Quantity fields for different product types
          box_quantity: "$items.selected_lots.box_quantity",
          piece_quantity: "$items.selected_lots.piece_quantity",
          kg: "$items.selected_lots.kg",

          // Crate information
          crate_type1: "$items.selected_lots.crate_type1",
          crate_type2: "$items.selected_lots.crate_type2",

          // Common fields
          discount_Kg: "$items.selected_lots.discount_Kg",
          unit_price: "$items.selected_lots.unit_price",

          total_price: {
            $cond: [
              { $gt: ["$items.selected_lots.box_quantity", 0] },
              {
                $multiply: [
                  "$items.selected_lots.box_quantity",
                  "$items.selected_lots.unit_price",
                ],
              },
              {
                $cond: [
                  { $gt: ["$items.selected_lots.piece_quantity", 0] },
                  {
                    $multiply: [
                      "$items.selected_lots.piece_quantity",
                      "$items.selected_lots.unit_price",
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $subtract: [
                          "$items.selected_lots.kg",
                          "$items.selected_lots.discount_Kg",
                        ],
                      },
                      "$items.selected_lots.unit_price",
                    ],
                  },
                ],
              },
            ],
          },

          total_crate: {
            $cond: [
              {
                $gt: [
                  {
                    $add: [
                      "$items.selected_lots.crate_type1",
                      "$items.selected_lots.crate_type2",
                    ],
                  },
                  0,
                ],
              },

              {
                $add: [
                  "$items.selected_lots.crate_type1",
                  "$items.selected_lots.crate_type2",
                ],
              },

              {
                $cond: [
                  { $gt: ["$items.selected_lots.box_quantity", 0] },
                  "$items.selected_lots.box_quantity",
                  0,
                ],
              },
            ],
          },
        },
      },
    },

    // @desc Group all sales under the same lot
    {
      $group: {
        _id: "$lot_name",
        lot_name: { $first: "$lot_name" },
        supplier_name: { $first: "$supplier_name" },
        lot_expenses: { $first: "$lot_expenses" },
        sales: { $push: "$sale" }, // all sale items under this lot
      },
    },

    { $project: { _id: 0 } }, // remove _id field
  ]);

  return data[0] || {}; // return the first (and only) lot object
};

// @desc    Delete a sale and revert ALL related changes
// @access  Admin
export const deleteSale = async (saleId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch the sale document
    const sale = await Sale.findById(saleId).session(session);

    if (!sale) {
      throw new Error("Sale not found");
    }

    // 2. Calculate total crates used in this sale (for customer revert)
    let totalCrateType1 = 0;
    let totalCrateType2 = 0;

    sale.items.forEach((item) => {
      item.selected_lots.forEach((lot) => {
        totalCrateType1 += Number(lot.crate_type1) || 0;
        totalCrateType2 += Number(lot.crate_type2) || 0;
      });
    });

    // 3. Revert Customer data
    const customer = await customerModel
      .findById(sale.customerId)
      .session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    const dueAmount = Number(sale.payment_details?.due_amount) || 0;
    const balanceRefundAmount =
      Number(sale.payment_details?.received_amount_from_balance) || 0;

    const customerUpdates = {
      "account_info.due": Math.max(
        0,
        (Number(customer.account_info?.due) || 0) - dueAmount
      ),
      "account_info.balance":
        (Number(customer.account_info?.balance) || 0) + balanceRefundAmount,
      "crate_info.type_1": Math.max(
        0,
        (Number(customer.crate_info?.type_1) || 0) - totalCrateType1
      ),
      "crate_info.type_2": Math.max(
        0,
        (Number(customer.crate_info?.type_2) || 0) - totalCrateType2
      ),
    };

    await customerModel.findByIdAndUpdate(
      sale.customerId,
      { $set: customerUpdates },
      { session, new: true }
    );

    // 4. Revert each Inventory Lot
    for (const item of sale.items) {
      for (const lot of item.selected_lots) {
        const inventoryLot = await inventoryLotsModel
          .findById(lot.lotId)
          .session(session);

        if (!inventoryLot) {
          console.warn(
            `InventoryLot not found during delete: ${lot.lotId}, skipping...`
          );
          continue;
        }

        const kgSold = Number(lot.kg) || 0;
        const boxSold = Number(lot.box_quantity) || 0;
        const pieceSold = Number(lot.piece_quantity) || 0;
        const crateType1Sold = Number(lot.crate_type1) || 0;
        const crateType2Sold = Number(lot.crate_type2) || 0;
        const soldPrice = Number(lot.selling_price) || 0;
        const lotCommission = Number(lot.lot_commission_amount) || 0;
        const lotProfit = Number(lot.lot_profit) || 0;

        // Calculate the customerProfit that was added during create
        const customerProfit = inventoryLot.hasCommission
          ? Number(lot.customer_commission_amount) || 0
          : lotProfit;

        const totalProfit = lotProfit + lotCommission;

        // 4a. If lot is currently "stock out" and has supplierDueAdded, revert supplier due
        if (
          inventoryLot.status === "stock out" &&
          inventoryLot.supplierDueAdded
        ) {
          const supplierDueToRevert =
            Number(inventoryLot.supplierDueAdded) || 0;

          if (supplierDueToRevert > 0) {
            const supplier = await mongoose
              .model("Supplier")
              .findById(inventoryLot.supplierId)
              .session(session);

            if (supplier) {
              const currentSupplierDue =
                Number(supplier.account_info?.due) || 0;

              await mongoose.model("Supplier").findByIdAndUpdate(
                inventoryLot.supplierId,
                {
                  $set: {
                    "account_info.due":
                      currentSupplierDue - supplierDueToRevert,
                  },
                },
                { session, new: true }
              );
            }
          }
        }

        // 4b. Prepare lot reversal updates
        const newRemainingBoxes =
          (Number(inventoryLot.remaining_boxes) || 0) + boxSold;
        const newRemainingPieces =
          (Number(inventoryLot.remaining_pieces) || 0) + pieceSold;
        const newRemainingCrate1 =
          (Number(inventoryLot.carat?.remaining_crate_Type_1) || 0) +
          crateType1Sold;
        const newRemainingCrate2 =
          (Number(inventoryLot.carat?.remaining_crate_Type_2) || 0) +
          crateType2Sold;

        // Determine new status — if any stock is restored, it's "in stock"
        let newStatus = inventoryLot.status;
        if (inventoryLot.status === "stock out") {
          if (
            boxSold > 0 ||
            pieceSold > 0 ||
            crateType1Sold > 0 ||
            crateType2Sold > 0 ||
            kgSold > 0
          ) {
            newStatus = "in stock";
          }
        }

        const lotUpdates = {
          // Subtract sales stats
          "sales.totalKgSold": Math.max(
            0,
            (Number(inventoryLot.sales?.totalKgSold) || 0) - kgSold
          ),
          "sales.totalBoxSold": Math.max(
            0,
            (Number(inventoryLot.sales?.totalBoxSold) || 0) - boxSold
          ),
          "sales.totalPieceSold": Math.max(
            0,
            (Number(inventoryLot.sales?.totalPieceSold) || 0) - pieceSold
          ),
          "sales.totalCrateType1Sold": Math.max(
            0,
            (Number(inventoryLot.sales?.totalCrateType1Sold) || 0) -
              crateType1Sold
          ),
          "sales.totalCrateType2Sold": Math.max(
            0,
            (Number(inventoryLot.sales?.totalCrateType2Sold) || 0) -
              crateType2Sold
          ),
          "sales.totalSoldPrice": Math.max(
            0,
            (Number(inventoryLot.sales?.totalSoldPrice) || 0) - soldPrice
          ),

          // Restore remaining stock
          remaining_boxes: newRemainingBoxes,
          remaining_pieces: newRemainingPieces,
          "carat.remaining_crate_Type_1": newRemainingCrate1,
          "carat.remaining_crate_Type_2": newRemainingCrate2,

          // Reverse profits
          "profits.lotProfit": inventoryLot.hasCommission
            ? Math.max(
                0,
                (Number(inventoryLot.profits?.lotProfit) || 0) - lotCommission
              )
            : Number(inventoryLot.profits?.lotProfit) || 0,
          "profits.customerProfit": Math.max(
            0,
            (Number(inventoryLot.profits?.customerProfit) || 0) - customerProfit
          ),
          "profits.totalProfit":
            (Number(inventoryLot.profits?.totalProfit) || 0) - totalProfit,

          // Update status
          status: newStatus,
        };

        // If reverting from stock out, clear the stock-out specific fields
        if (inventoryLot.status === "stock out" && newStatus === "in stock") {
          lotUpdates["profits.lot_loss"] = 0;
          lotUpdates["supplierDueAdded"] = 0;
        }

        // Apply lot updates
        await inventoryLotsModel.findByIdAndUpdate(
          lot.lotId,
          { $set: lotUpdates },
          { session, new: true }
        );
      }
    }

    // 5. Delete Income record linked to this sale
    await incomeModel.deleteMany(
      { "information.saleId": saleId.toString() },
      { session }
    );

    // 6. Delete Customer Crate History linked to this sale
    await customerCrateHistoryModel.deleteMany(
      { saleId: sale._id },
      { session }
    );

    // 7. Delete the Sale document itself
    await Sale.findByIdAndDelete(saleId, { session });

    // 8. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Sale deleted and all changes reverted successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

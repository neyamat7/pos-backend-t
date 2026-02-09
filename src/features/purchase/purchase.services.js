import mongoose from "mongoose";
import Purchase from "./purchase.model.js";

// @desc   Create new purchase
// @access  Admin
export const createPurchase = async (data) => {

  return await Purchase.create(data);
};

// @desc Get all purchases
// @access  Admin
export const getAllPurchases = async (page, limit) => {
  const skip = (page - 1) * limit;
  const total = await Purchase.countDocuments();

  const purchase = await Purchase.find()
    .populate("items.supplier")
    .populate("items.lots.productId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    purchase,
  };
};

// @desc Get all purchases by supplier
// @access  Admin
export const getAllPurchasesBySupplier = async (
  supplierId,
  page,
  limit,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const aggregationPipeline = [
    // Stage 1: Match purchases by supplier and date range
    {
      $match: {
        "items.supplier": new mongoose.Types.ObjectId(supplierId),
        ...(filters.fromDate || filters.toDate
          ? {
              purchase_date: {
                ...(filters.fromDate ? { $gte: new Date(filters.fromDate) } : {}),
                ...(filters.toDate ? { $lte: new Date(filters.toDate) } : {}),
              },
            }
          : {}),
      },
    },
    // Stage 2: Unwind items to search within them
    {
      $unwind: "$items",
    },
    // Stage 3: Match items by supplier (again after unwind)
    {
      $match: {
        "items.supplier": new mongoose.Types.ObjectId(supplierId),
      },
    },
    // Stage 4: Lookup supplier details
    {
      $lookup: {
        from: "suppliers",
        localField: "items.supplier",
        foreignField: "_id",
        as: "items.supplierData",
      },
    },
    // Stage 5: Lookup product details with search filter
    {
      $lookup: {
        from: "products",
        localField: "items.lots.productId",
        foreignField: "_id",
        as: "items.productData",
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
    // Stage 6: Filter out items with empty products (ONLY if search is applied)
    ...(filters.search
      ? [
          {
            $match: {
              "items.productData.0": { $exists: true }, // At least one product exists
            },
          },
        ]
      : []),
    // Stage 7: Group back by purchase
    {
      $group: {
        _id: "$_id",
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        purchaseNumber: { $first: "$purchaseNumber" },
        status: { $first: "$status" },
        items: { $push: "$items" },
      },
    },
    // Stage 8: Filter out purchases with empty items (if search applied)
    ...(filters.search
      ? [
          {
            $match: {
              "items.0": { $exists: true }, // At least one item exists
            },
          },
        ]
      : []),
    // Stage 9: Sort
    { $sort: { createdAt: -1 } },
  ];

  // Execute aggregation for data
  const purchases = await Purchase.aggregate([
    ...aggregationPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  // Execute aggregation for total count
  const totalResult = await Purchase.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);

  const total = totalResult[0]?.total || 0;

 

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    purchases,
  };
};

// @desc Get single purchase by ID
// @access  Admin
export const getPurchaseById = async (id) => {
  return await Purchase.findById(id)
    .populate("items.supplier")
    .populate("items.lots.productId");
};

// @desc Update purchase
// @access  Admin
export const updatePurchase = async (id, data) => {
  return await Purchase.findByIdAndUpdate(id, data, { new: true });
};

// @desc Update the status of a purchase by ID
// @access  Admin
export const updatePurchaseStatus = async (purchaseId, status) => {
  const allowedStatuses = ["on the way", "received", "canceled"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const purchase = await Purchase.findById(purchaseId);
  if (!purchase) {
    throw new Error("Purchase not found");
  }

  purchase.status = status;
  await purchase.save();

  return purchase;
};

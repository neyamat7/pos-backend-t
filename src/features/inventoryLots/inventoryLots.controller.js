import * as inventoryLotsService from "./inventoryLots.services.js";

// @desc create lost from purchase list
// @route   POST /api/v1/inventoryLots/add
// @access  Admin
export const createLots = async (req, res) => {
  try {
    const purchaseId = req.query.id;

    const userId = req.user?.id || req.user?._id;
    if (!userId) throw new Error("Authenticated user not found");

    const lotsCreatedCount = await inventoryLotsService.createLotsForPurchase(
      purchaseId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: `Successfully created ${lotsCreatedCount} lots.`,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc Get all lots
// @route   GET /api/v1/inventoryLots/all
// @access  Admin
export const fetchAllLots = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const lots = await inventoryLotsService.getAllLots(
      parseInt(page),
      parseInt(limit),
      search
    );
    return res.status(200).json({ lots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Get all lots by supplier
// @route   GET /api/v1/inventoryLots/by-supplier
// @access  Admin
export const lotsBySupplier = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, fromDate, toDate } = req.query;

    const lots = await inventoryLotsService.getAllLotsBySupplier(
      req.params.id,
      parseInt(page),
      parseInt(limit),
      { search, fromDate, toDate }
    );

    res.status(200).json({
      success: true,
      ...lots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single lot details
// @route   GET /api/v1/inventoryLots/details
// @access  Admin
export const fetchLotDetails = async (req, res) => {
  try {
    const lotId = req.params.id;
    const lot = await inventoryLotsService.getLotById(lotId);
    return res.status(200).json({ lot });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Update lot status
// @route   GET /api/v1/inventoryLots/details
// @access  Admins
export const updateLotStatusController = async (req, res) => {
  try {
    const lotId = req.params.id;
    const { status } = req.body; // expecting { "status": "stock out" }

    const updatedLot = await inventoryLotsService.updateLotStatus(
      lotId,
      status
    );

    return res.status(200).json({
      message: "Lot status updated successfully",
      lot: updatedLot,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller to get all in-stock loots
// @route   GET /api/v1/inventoryLots/in-stock
// @access  Admins
export const getAllInStockLots = async (req, res) => {
  try {
    const lots = await inventoryLotsService.getAllInStockLots();

    res.status(200).json({
      success: true,
      count: lots.length,
      data: lots,
    });
  } catch (error) {
    console.error("Error in getAllInStockLots:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch in-stock lots",
    });
  }
};

// @desc    Get all unpaid & out-of-stock lots
// @route   GET /api/v1/inventory-lots/unpaid-stock-out
// @access  Admin
export const getUnpaidAndOutOfStockLots = async (req, res) => {
  try {
    const lots = await inventoryLotsService.getUnpaidAndOutOfStockLots();
    res.status(200).json({
      success: true,
      count: lots.length,
      data: lots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unpaid & out-of-stock lots by supplier
// @route   GET /api/v1/inventory-lots/unpaid-stock-out/:supplierId
// @access  Admin
export const getUnpaidAndOutOfStockLotsBySupplier = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const lots =
      await inventoryLotsService.getUnpaidAndOutOfStockLotsBySupplier(
        supplierId
      );
    res.status(200).json({
      success: true,
      count: lots.length,
      data: lots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unpaid & out-of-stock lots
// @route   GET /api/v1/inventory-lots/unpaid-stock-out
// @access  Admin
export const adjustStockController = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { unit_quantity, reason_note } = req.body;

    const updatedLot = await inventoryLotsService.adjustStockService(lotId, {
      unit_quantity,
      reason_note,
    });

    res.status(200).json({
      message: "Stock adjustment successful",
      lot: updatedLot,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to adjust stock",
    });
  }
};

// @desc    Update lot cost price retroactively
// @route   PATCH /api/v1/inventoryLots/:lotId/cost
// @access  Admin
export const updateLotCostController = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { unitCost } = req.body;

    if (!unitCost || isNaN(unitCost)) {
      return res.status(400).json({ message: "Valid unit cost is required" });
    }

    const result = await inventoryLotsService.updateLotCostService(
      lotId,
      unitCost
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to update lot cost",
    });
  }
};

// @desc    Update extra expense for a lot
// @route   PATCH /api/v1/inventoryLots/:lotId/extra-expense
// @access  Admin
export const updateExtraExpenseController = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { extra_expense, extra_expense_note } = req.body;

    const updatedLot = await inventoryLotsService.updateExtraExpense(lotId, {
      extra_expense,
      extra_expense_note,
    });

    res.status(200).json({
      success: true,
      message: "Extra expense updated successfully",
      lot: updatedLot,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get profit/loss (all-time or by purchase date)
// @route   GET /api/v1/profit-loss
// @access  Public
export const getProfitLoss = async (req, res) => {
  try {
    const { purchase_date } = req.query;

    // Validate date format if provided
    if (purchase_date && isNaN(Date.parse(purchase_date))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const filters = {};
    if (purchase_date) {
      filters.purchase_date = purchase_date;
    }

    const result = await inventoryLotsService.calculateProfitLoss(filters);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Profit/Loss calculation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate profit/loss",
      error: error.message,
    });
  }
};

// @desc    Get inventory lots analytics
// @route   GET /api/v1/inventoryLots/analytics
// @access  Admin
export const getLotsAnalyticsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, month, supplierId } = req.query;

    const result = await inventoryLotsService.getLotsAnalytics(
      parseInt(page),
      parseInt(limit),
      month,
      supplierId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics",
    });
  }
};

// @desc    Delete a lot
// @route   DELETE /api/v1/inventoryLots/:id
// @access  Admin
export const deleteLot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await inventoryLotsService.deleteLotService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error("Delete lot error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete lot",
    });
  }
};

// @desc    Upload lot receipt image
// @route   POST /api/v1/inventoryLots/:id/receipt
// @access  Admin
export const uploadReceiptImage = async (req, res) => {
  try {
    const lotId = req.params.id;
    const image = await inventoryLotsService.addReceiptImageService(
      lotId,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "Receipt image uploaded successfully",
      data: image,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove lot receipt image
// @route   DELETE /api/v1/inventoryLots/:id/receipt/:imageId
// @access  Admin
export const deleteReceiptImage = async (req, res) => {
  try {
    const { id: lotId, imageId } = req.params;
    const result = await inventoryLotsService.removeReceiptImageService(
      lotId,
      imageId
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

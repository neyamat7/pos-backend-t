import * as inventoryCrateService from "./inventoryCrate.services.js";

// @desc    Create new crate transition
// @route   POST /api/v1/crate-transition
// @access  Admin
export const createCrateTransition = async (req, res) => {
  try {
    const newTransition =
      await inventoryCrateService.createCrateTransitionService(req.body);
    res.status(201).json({
      success: true,
      message: "Crate transition created successfully",
      data: newTransition,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all crate transitions
// @route   GET /api/v1/crate-transition
// @access  Admin
export const getAllCrateTransitions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const transitions =
      await inventoryCrateService.getAllCrateTransitionsService(
        parseInt(page),
        parseInt(limit),
        search
      );

    res.status(200).json({
      success: true,
      count: transitions.length,
      data: transitions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add crates for a supplier
// @route   POST /api/v1/supplier/:supplierId/add-crates
// @access  Admin
export const addCratesForSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const result = await inventoryCrateService.addCratesForSupplierService(
      supplierId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Crates added to supplier and totals updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update crate totals or supplier crate info
// @route   PATCH /api/v1/crates
// @query   supplierId (optional) - if present, updates supplier crates; otherwise updates total crates
// @access  Admin
export const updateCrateOrSupplierController = async (req, res) => {
  const { supplierId, inventoryCratesId } = req.query;
  const crate_info = req.body;

  // Basic validation
  if (!crate_info || Object.keys(crate_info).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Crate information is required",
    });
  }

  try {
    const result = await inventoryCrateService.updateCrateOrSupplierService(
      supplierId,
      inventoryCratesId,
      crate_info
    );

    return res.status(200).json({
      success: true,
      message: supplierId
        ? "Supplier crate info and totals updated successfully"
        : "Crate totals updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating crate or supplier:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update crate or supplier info",
    });
  }
};

// @desc Get current crate totals
// @route GET /api/v1/crates/totals
// @access Admin
export const getCrateTotalsController = async (req, res) => {
  const { year, month } = req.query;
  const result = await inventoryCrateService.getCrateTotalsService(year, month);

  res.status(200).json({
    message: "Crate totals fetched successfully",
    data: result,
  });
};

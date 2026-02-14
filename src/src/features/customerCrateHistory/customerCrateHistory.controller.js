import * as customerCrateHistoryService from "./customerCrateHistory.services.js";

// @desc Get all crate history for customer
// @route GET /api/crate-history/:customerId
// @access Private
export const getAllHistoryController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await customerCrateHistoryService.getCustomerCrateHistory(
      req.params.customerId,
      parseInt(page),
      parseInt(limit)
    );

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc Get details for one crate history
// @route GET /api/crate-history/details/:id
// @access Private
export const getHistoryDetailsController = async (req, res, next) => {
  try {
    const data = await customerCrateHistoryService.getSingleCrateHistory(
      req.params.id
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc Update crate history status (returned / partial_return)
// @route PUT /api/crate-history/status/:id
// @access Private
export const updateStatusController = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) throw new Error("Status is required");

    const updated = await customerCrateHistoryService.updateCrateStatus(
      req.params.id,
      status
    );
    res.json(updated);
  } catch (err) {
    console.error("Controller error:", err);
    next(err);
  }
};

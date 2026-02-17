import * as cashManagementService from "./cash-management.services.js";

// @desc    Get daily cash status
// @route   GET /api/v1/cash-management
// @access  Admin
export const getDailyCash = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const dailyCash = await cashManagementService.getDailyCashService(date);
    res.status(200).json({
      success: true,
      data: dailyCash,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add cash-in amount
// @route   POST /api/v1/cash-management/cash-in
// @access  Admin
export const addCashIn = async (req, res) => {
  try {
    const { date, amount, note } = req.body;
    if (!date || amount === undefined) {
      return res.status(400).json({ success: false, message: "Date and amount are required" });
    }

    const dailyCash = await cashManagementService.addCashInService(date, parseFloat(amount), note);
    res.status(200).json({
      success: true,
      message: "Cash-in added successfully",
      data: dailyCash,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add cash-out amount
// @route   POST /api/v1/cash-management/cash-out
// @access  Admin
export const addCashOut = async (req, res) => {
  try {
    const { date, amount, note } = req.body;
    if (!date || amount === undefined) {
      return res.status(400).json({ success: false, message: "Date and amount are required" });
    }

    const dailyCash = await cashManagementService.addCashOutService(date, parseFloat(amount), note);
    res.status(200).json({
      success: true,
      message: "Cash-out added successfully",
      data: dailyCash,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getDailyCashHistory = async (req, res) => {
  try {
    const { date, year, month, page = 1, limit = 10 } = req.query;
    if (!date && !year) {
      return res.status(400).json({ success: false, message: "Date or Year is required" });
    }

    const data = await cashManagementService.getDailyCashHistory(
      date, 
      year, 
      month, 
      parseInt(page), 
      parseInt(limit)
    );
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
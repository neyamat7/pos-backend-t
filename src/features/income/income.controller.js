import * as incomeService from "./income.services.js";

// @desc    Get all incomes with details
// @route   GET /api/v1/incomes
// @access  Admin
export const getIncomes = async (req, res) => {
  try {
    const { page = 1, limit = 10, fromDate, toDate } = req.query;

    const incomes = await incomeService.getAllIncomes(
      parseInt(page),
      parseInt(limit),
      {
        fromDate,
        toDate,
      }
    );

    res.status(200).json({
      success: true,
      ...incomes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single income details
// @route   GET /api/v1/incomes/:id
// @access  Admin
export const getIncomeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await incomeService.getIncomeById(id);

    res.status(200).json({
      success: true,
      message: "Income details retrieved successfully",
      data: income,
    });
  } catch (error) {
    if (error.message === "Income not found") {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get income statistics
// @route   GET /api/v1/incomes/stats/summary
// @access  Admin
export const getIncomeStatistics = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const stats = await incomeService.getIncomeStats(fromDate, toDate);

    res.status(200).json({
      success: true,
      message: "Income statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllIncomePeriods = async (req, res) => {
  try {
    const totals = await incomeService.getIncomeTotals();
    res.json({
      success: true,
      data: totals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

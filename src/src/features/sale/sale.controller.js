import { logActivity } from "../../utils/activityLogger.js";
import * as saleService from "./sale.services.js";

// @desc    Create sale record
// @route   POST /api/v1/sale/add
// @access  Admin
export const createSale = async (req, res) => {
  try {
    const userId = req.user.id;

    const saleData = req.body;
    const result = await saleService.createSale(saleData);

    // Log activity
    await logActivity({
      model_name: "Sale",
      logs_fields_id: result._id,
      by: userId,
      action: "Created",
      note: `New sale ${result.sale_date} created`,
    });

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in createSale:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create sale",
    });
  }
};

// @desc    Get all sales
// @route   GET /api/v1/sale
// @access  Admin
export const getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await saleService.getAllSales(
      search,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllSales:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sales",
    });
  }
};

// @desc    Get all sales
// @route   GET /api/v1/sale/by-customer/:id
// @access  Admin
export const salesByCustomer = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, fromDate, toDate } = req.query;

    const sales = await saleService.getAllSalesByCustomer(
      req.params.id,
      parseInt(page),
      parseInt(limit),
      { search, fromDate, toDate }
    );

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sale details",
    });
  }
};

// @desc    Get sale details by ID
// @route   GET /api/v1/sale/:id
// @access  Admin
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await saleService.getSaleById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getSaleById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sale details",
    });
  }
};

// @desc    Get lot summary from sales by lotId
// @route   GET /api/v1/sales/lot-summary/:lotId
// @access  private
export const getLotSummaryController = async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const data = await saleService.getLotSummaryService(lotId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

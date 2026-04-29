import { logActivity } from "../../utils/activityLogger.js";
import supplierModel from "../supplier/supplier.model.js";
import * as balanceService from "./balance.services.js";

// @desc    Create a new balance
// @route   POST /api/v1/balances/add
// @access  Admin
export const createBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const balance = await balanceService.createBalance(req.body);

    // Get supplier info
    const supplier = await supplierModel
      .findById(balance.balance_for)
      .select("basic_info.name");

    const supplierName = supplier?.basic_info?.name;

    // Log activity
    await logActivity({
      model_name: "Balance",
      logs_fields_id: balance._id,
      by: userId,
      action: "Created",
      note: `Balance added to ${supplierName}'s account. Amount:${balance.amount}`,
    });

    res.status(201).json({
      message: "Balance created successfully",
      data: balance,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add customer balance history and deduct from due
// @route   POST /api/v1/balances/add-customer-balance
// @access  Admin
export const addCustomerBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const balance = await balanceService.addCustomerBalanceService(req.body, { by: userId });

    res.status(201).json({
      message: "Customer balance added and due updated successfully",
      data: balance,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all balances
// @route   GET /api/v1/balances/all
// @access  Admin
export const getAllBalances = async (req, res) => {
  try {
    const { page = 1, limit = 10, fromDate, toDate, role } = req.query;

    const balances = await balanceService.getAllBalances(
      req.params.id,
      parseInt(page),
      parseInt(limit),
      {
        fromDate,
        toDate,
        role,
      }
    );

    res.status(200).json({
      message: "All balances fetched successfully",
      data: balances,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Give customer discount
// @route   POST /api/v1/balances/apply-customer-discount
// @access  Admin
export const applyCustomerDiscount = async (req, res) => {
  try {
    const userId = req.user.id;

    const discount = await balanceService.applyCustomerDiscountService(
      req.body,
      { by: userId }
    );

    res.status(201).json({
      message: "Customer discount applied and due adjusted successfully",
      data: discount,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get balance details by ID
// @route   GET /api/v1/balances/details/:id
// @access  Admin
export const getBalanceById = async (req, res) => {
  try {
    const balance = await balanceService.getBalanceById(req.params.id);
    if (!balance) {
      return res.status(404).json({ message: "Balance not found" });
    }
    res.status(200).json({
      message: "Balance fetched successfully",
      data: balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

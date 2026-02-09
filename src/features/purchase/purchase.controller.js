import { logActivity } from "../../utils/activityLogger.js";
import * as purchaseService from "./purchase.services.js";

// @desc Create Purchase
// @route   POST /api/v1/purchase/add
// @access  Admin
export const createPurchase = async (req, res) => {
  try {
    const userId = req.user.id;

    const purchase = await purchaseService.createPurchase(req.body);

    // Log activity
    await logActivity({
      model_name: "Purchase",
      logs_fields_id: purchase._id,
      by: userId,
      action: "Created",
      note: `Purchase made on ${purchase.purchase_date.toLocaleDateString()} `,
    });

    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get All Purchases
// @route   GET /api/v1/purchase/all
// @access  Admin
export const getAllPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const purchases = await purchaseService.getAllPurchases(
      parseInt(page),
      parseInt(limit)
    );
    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all purchases by supplier
// @route   POST /api/v1/purchase/by-supplier/:id
// @access  Admin
export const purchasesBySupplier = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, fromDate, toDate } = req.query;

    const purchases = await purchaseService.getAllPurchasesBySupplier(
      req.params.id,
      parseInt(page),
      parseInt(limit),
      { search, fromDate, toDate }
    );

    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Single Purchase Details
// @route   GET /api/v1/purchase/details/:id
// @access  Admin
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }
    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Purchase
// @route   POST /api/v1/purchase/update/:id
// @access  Admin
export const updatePurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const updatedPurchase = await purchaseService.updatePurchase(
      req.params.id,
      req.body
    );

    if (!updatedPurchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Log activity
    await logActivity({
      model_name: "Purchase",
      logs_fields_id: updatedPurchase._id,
      by: userId,
      action: "Created",
      note: `updatedPurchase made on ${updatedPurchase.purchase_date.toLocaleDateString()} by ${userEmail}.`,
    });

    res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      data: updatedPurchase,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update the status of a purchase by ID
// @route   POST /api/v1/purchase/status/:id
// @access  Admin
export const changeStatus = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const { status } = req.body;

    const updatedPurchase = await purchaseService.updatePurchaseStatus(
      purchaseId,
      status
    );

    res.status(200).json({
      success: true,
      message: "Purchase status updated successfully",
      data: updatedPurchase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

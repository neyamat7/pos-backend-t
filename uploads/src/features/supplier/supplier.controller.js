import { logActivity } from "../../utils/activityLogger.js";
import * as supplierService from "./supplier.service.js";

// @desc    Create a new supplier
// @route   POST /api/v1/suppliers
export const createSupplier = async (req, res) => {
  try {
    const userId = req.user.id;

    const supplier = await supplierService.createSupplier(req.body);

    // Log activity
    await logActivity({
      model_name: "Supplier",
      logs_fields_id: supplier._id,
      by: userId,
      action: "Created",
      note: `New supplier ${supplier.basic_info.name} created`,
    });

    res.status(201).json({
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all suppliers
// @route   GET /api/v1/suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const suppliers = await supplierService.getAllSuppliers(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Get All Suppliers Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single supplier details
// @route   GET /api/v1/suppliers/:id
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error("Get Supplier Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update supplier
// @route   PUT /api/v1/suppliers/:id
export const updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await supplierService.updateSupplier(
      req.params.id,
      req.body
    );

    // console.log(updatedSupplier);

    // Log activity
    await logActivity({
      model_name: "Supplier",
      logs_fields_id: updatedSupplier._id,
      by: req.user._id,
      action: "Updated",
      note: "supplier information updated",
    });

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({
      message: "Supplier updated successfully",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error("Update Supplier Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get  suppliers  by name, email, phone, location
// @route   GET /api/v1/suppliers
// @access  Admin
export const getSuppliersByQuery = async (req, res) => {
  try {
    const suppliers = await supplierService.searchSuppliers(req.query);

    if (!suppliers.length) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get suppliers due list with optional search by name, email, phone
// @route   GET /api/v1/suppliers/due-list
// @access  Admin
export const getDueSuppliersController = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const suppliers = await supplierService.getDueSuppliersService(
      search,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      total: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete supplier (Archive)
// @route   DELETE /api/v1/suppliers/:id
// @access  Admin
export const softDeleteSupplier = async (req, res) => {
  try {
    const userId = req.user.id;
    const supplier = await supplierService.softDeleteSupplier(
      req.params.id,
      userId
    );

    // Log activity
    await logActivity({
      model_name: "Supplier",
      logs_fields_id: supplier._id,
      by: userId,
      action: "Deleted",
      note: `Supplier ${supplier.basic_info.name} archived`,
    });

    res.status(200).json({
      message: "Supplier archived successfully",
      supplier,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Restore archived supplier
// @route   PATCH /api/v1/suppliers/restore/:id
// @access  Admin
export const restoreSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.restoreSupplier(req.params.id);

    // Log activity
    await logActivity({
      model_name: "Supplier",
      logs_fields_id: supplier._id,
      by: req.user.id,
      action: "Updated",
      note: `Supplier ${supplier.basic_info.name} restored from archive`,
    });

    res.status(200).json({
      message: "Supplier restored successfully",
      supplier,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get archived suppliers
// @route   GET /api/v1/suppliers/archived
// @access  Admin
export const getArchivedSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const suppliers = await supplierService.getArchivedSuppliers(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

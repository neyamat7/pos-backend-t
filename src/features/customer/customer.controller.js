import { logActivity } from "../../utils/activityLogger.js";
import * as customerService from "./customer.services.js";

// @desc    Create a new customer
// @route   POST /api/v1/customers
// @access  Admin
export const createCustomer = async (req, res) => {
  try {
    const userId = req.user.id;

    const customer = await customerService.createCustomer(req.body);

    // Log activity
    await logActivity({
      model_name: "Customer",
      logs_fields_id: customer._id,
      by: userId,
      action: "Created",
      note: `New customer ${customer.basic_info.name} created`,
    });

    res
      .status(201)
      .json({ message: "Customer created successfully", customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing customer
// @route   PUT /api/v1/customers/:id
// @access  Admin
export const updateCustomer = async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(
      req.params.id,
      req.body
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Log activity
    await logActivity({
      model_name: "Customer",
      logs_fields_id: customer._id,
      by: req.user._id,
      action: "Updated",
      note: "Customer information updated",
    });

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all customers with pagination
// @route   GET /api/v1/customers
// @access  Admin
export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const customers = await customerService.getAllCustomers(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single customer details by ID
// @route   GET /api/v1/customers/:id
// @access  Admin
export const getCustomerById = async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get  customers  by name, email, phone, location
// @route   GET /api/v1/customers/
// @access  Admin
export const getCustomersByQuery = async (req, res) => {
  try {
    const customers = await customerService.searchCustomers(req.query);

    if (!customers.length) {
      return res.status(404).json({ message: "No customers found" });
    }

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get customers due list with optional search by name, email, phone
// @route   GET /api/v1/customers/due-list
// @access  Admin
export const getDueCustomersController = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const customers = await customerService.getDueCustomersService(
      search,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      total: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete customer (Archive)
// @route   DELETE /api/v1/customers/:id
export const softDeleteCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Soft Deleting Customer ID:', req.params.id)
    const customer = await customerService.softDeleteCustomer(
      req.params.id,
      userId
    );

    // Log activity
    await logActivity({
      model_name: "Customer",
      logs_fields_id: customer._id,
      by: userId,
      action: "Deleted",
      note: `Customer ${customer.basic_info.name} archived`,
    });

    res.status(200).json({
      message: "Customer archived successfully",
      customer,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Restore archived customer
// @route   PATCH /api/v1/customers/restore/:id
// @access  Admin
export const restoreCustomer = async (req, res) => {
  try {
    const customer = await customerService.restoreCustomer(req.params.id);

    // Log activity
    await logActivity({
      model_name: "Customer",
      logs_fields_id: customer._id,
      by: req.user.id,
      action: "Updated",
      note: `Customer ${customer.basic_info.name} restored from archive`,
    });

    res.status(200).json({
      message: "Customer restored successfully",
      customer,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get archived customers
// @route   GET /api/v1/customers/archived
// @access  Admin
export const getArchivedCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const customers = await customerService.getArchivedCustomers(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



import { logActivity } from "../../utils/activityLogger.js";
import * as accountService from "./account.service.js";

// @desc    Create a new account
// @route   POST /api/v1/accounts
export const createAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const account = await accountService.createAccount(req.body);

    // Log activity
    await logActivity({
      model_name: "Account",
      logs_fields_id: account._id,
      by: userId,
      action: "Created",
      note: `account ${account.name} created  by ${userEmail}`,
    });

    res.status(201).json({
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    console.error("Create Account Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all accounts
// @route   GET /api/v1/accounts
export const getAllAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const accounts = await accountService.getAllAccounts(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json(accounts);
  } catch (error) {
    console.error("Get Accounts Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an account
// @route   PUT /api/v1/accounts/:id
export const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const updated = await accountService.updateAccount(req.params.id, req.body);

    // Log activity
    await logActivity({
      model_name: "Category",
      logs_fields_id: updated._id,
      by: userId,
      action: "Created",
      note: `account ${updated.categoryName} updated by ${userEmail}`,
    });

    if (!updated) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({
      message: "Account updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Account Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

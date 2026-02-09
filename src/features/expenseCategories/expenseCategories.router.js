import express from "express";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
} from "./expenseCategories.controller.js";

const router = express.Router();

// Get all categories with pagination and optional filtering
router.get("/all", getExpenseCategories);

// Create new category
router.post("/add", createExpenseCategory);

// Update category
router.put("/update/:id", updateExpenseCategory);

// Delete category
router.delete("/delete/:id", deleteExpenseCategory);

export default router;

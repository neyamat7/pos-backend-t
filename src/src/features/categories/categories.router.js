import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./categories.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// get all categories
router.get("/all", getAllCategories);

// get details view
router.get("/details/:id", getCategoryById);

// add new view category
router.post("/add", authMiddleware, createCategory);

// update category
router.put("/update/:id", authMiddleware, updateCategory);

// delete category
router.delete("/delete/:id", authMiddleware, deleteCategory);

export default router;

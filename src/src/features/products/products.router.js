import express from "express";

import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "./products.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// Get all products
router.get("/all", getProducts);

// Get a single product by ID
router.get("/details/:id", getProductById);

// Create a new product
router.post("/add", authMiddleware, createProduct);

// Update an existing product
router.put("/update/:id", authMiddleware, updateProduct);

export default router;

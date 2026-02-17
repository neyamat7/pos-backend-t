import express from "express";
import {
  changeStatus,
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  purchasesBySupplier,
  updatePurchase,
} from "./purchase.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// Create new purchase
router.post("/add", authMiddleware, createPurchase);

// All purchases
router.get("/all", getAllPurchases);

// purchases by supplier
router.get("/by-supplier/:id", purchasesBySupplier);

// Single purchase by ID
router.get("/details/:id", getPurchaseById);

// Update purchase
router.put("/update/:id", authMiddleware, updatePurchase);

// update statues
router.patch("/status/:id", changeStatus);

export default router;

import express from "express";
import { authMiddleware } from "../../middleware/auth.js";
import {
  clearSupplierSettlementController,
  createTransaction,
  getAllBySupplier,
  getTransactionDetails,
} from "./payment.controller.js";

const router = express.Router();

// CREATE a new transaction
router.post("/add", authMiddleware, createTransaction);

// Clear full settlement
router.post("/settlement", authMiddleware, clearSupplierSettlementController);

// GET all transactions by supplier
router.get("/all/:supplierId", getAllBySupplier);

// GET one transaction by id
router.get("/details/:id", getTransactionDetails);

export default router;

import express from "express";
import { authMiddleware } from "../../middleware/auth.js";
import {
  addCustomerBalance,
  applyCustomerDiscount,
  createBalance,
  getAllBalances,
  getBalanceById,
} from "./balance.controller.js";

const router = express.Router();

// Routes
router.get("/all/:id", getAllBalances);

router.post("/add", authMiddleware, createBalance);
router.post("/add-customer-balance", authMiddleware, addCustomerBalance);
router.post("/apply-customer-discount", authMiddleware, applyCustomerDiscount);

router.get("/details/:id", getBalanceById);

export default router;

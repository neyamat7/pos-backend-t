import express from "express";
import {
  createSale,
  getAllSales,
  getLotSummaryController,
  getSaleById,
  salesByCustomer,
} from "./sale.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// add sale
router.post("/add", authMiddleware, createSale);

// get all
router.get("/all", getAllSales);

// get all sales by customer
router.get("/by-customer/:id", salesByCustomer);

// get details
router.get("/details/:id", getSaleById);

router.get("/lot-sale-summary/:lotId", getLotSummaryController);

export default router;

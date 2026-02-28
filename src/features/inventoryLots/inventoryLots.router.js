import express from "express";
import { uploadSingle } from "../../middleware/upload.js";
import {
  adjustStockController,
  createLots,
  deleteLot,
  deleteReceiptImage,
  fetchAllLots,
  fetchLotDetails,
  getAllInStockLots,
  getLotsAnalyticsController,
  getProfitLoss,
  getUnpaidAndOutOfStockLots,
  getUnpaidAndOutOfStockLotsBySupplier,
  lotsBySupplier,
  updateExtraExpenseController,
  updateLotCostController,
  updateLotStatusController,
  uploadReceiptImage,
} from "./inventoryLots.controller.js";

const router = express.Router();

// Create new lots
router.post("/add", createLots);

// get all
router.get("/all", fetchAllLots);

// get all
router.get("/by-supplier/:id", lotsBySupplier);

// get details
router.get("/details/:id", fetchLotDetails);

// change status
router.put("/status/:id", updateLotStatusController);

// get all in stock lots
router.get("/in-stock", getAllInStockLots);

// get all in unpaid/stock out  lots
router.get("/unpaid-stock-out", getUnpaidAndOutOfStockLots);

// get all in unpaid/stock out  lots by supplier
router.get(
  "/unpaid-stock-out-by-supplier/:supplierId",
  getUnpaidAndOutOfStockLotsBySupplier
);

router.patch("/:lotId/adjust-stock", adjustStockController);

router.patch("/:lotId/extra-expense", updateExtraExpenseController);

router.patch("/:lotId/cost", updateLotCostController);

router.get("/profit-loss", getProfitLoss);

router.get("/analytics", getLotsAnalyticsController);

// Receipt images
router.post("/:id/receipt", uploadSingle.single("image"), uploadReceiptImage);
router.delete("/:id/receipt/:imageId", deleteReceiptImage);

router.delete("/:id", deleteLot);

export default router;

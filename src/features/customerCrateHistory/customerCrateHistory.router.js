import express from "express";
import {
  getAllHistoryController,
  getHistoryDetailsController,
  updateStatusController,
} from "./customerCrateHistory.controller.js";

const router = express.Router();

// Routes
router.get("/:customerId", getAllHistoryController);
router.get("/details/:id", getHistoryDetailsController);
router.patch("/status/:id", updateStatusController);

export default router;

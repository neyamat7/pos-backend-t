import express from "express";
import {
  getAllIncomePeriods,
  getIncomeDetail,
  getIncomes,
  getIncomeStatistics,
} from "./income.controller.js";

const router = express.Router();

// Get all incomes with pagination and filters
router.get("/all", getIncomes);

// Get single income details
router.get("/details/:id", getIncomeDetail);

//   Get income statistics summary
router.get("/stats/summary", getIncomeStatistics);

router.get("/periods", getAllIncomePeriods);

export default router;

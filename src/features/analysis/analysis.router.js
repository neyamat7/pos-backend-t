import express from "express";
import { getDailyCashSummary, getDashboardStats, getMonthlySummary } from "./analysis.controller.js";

const router = express.Router();

// Routes
router.get("/stats", getDashboardStats);
router.get("/monthly-summary", getMonthlySummary);
router.get("/daily-cash-summary", getDailyCashSummary);

export default router;

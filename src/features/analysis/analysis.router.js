import express from "express";
import { getDashboardStats, getMonthlySummary } from "./analysis.controller.js";

const router = express.Router();

// Routes
router.get("/stats", getDashboardStats);

router.get("/monthly-summary", getMonthlySummary);
export default router;
